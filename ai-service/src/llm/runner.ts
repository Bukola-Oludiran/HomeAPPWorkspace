/**
 * LLM runner — drives the chat agent loop with the Anthropic SDK.
 *
 * Decision: We use `@anthropic-ai/sdk` directly rather than pi-mono's
 * agent harness. The trust model demands the AI service hold the JWT
 * (never the LLM) and inject it at tool execute-time; that's already
 * how the Tool / ToolCtx interfaces work in this codebase. Pi-mono's
 * CLI-shaped abstractions (file-system tools, interactive UI, session
 * persistence) are not load-bearing here, so we sidestep them.
 *
 * Flow per turn:
 *   1. Build the Anthropic tools array from the role's bundle catalogue.
 *   2. Stream a message turn with messages + tools.
 *   3. As the model emits content blocks:
 *      - `text` blocks → SSE text_delta events
 *      - `tool_use` blocks → look up tool, run the confirm-gate or execute,
 *        feed the result back as a tool_result block in the next message.
 *   4. Continue the loop until the model stops emitting tool_use blocks
 *      OR a tool returns `terminate: true`.
 *
 * If `ANTHROPIC_API_KEY` is not set, this module throws on first use; the
 * caller (server.ts) falls back to the echo path with a clear "LLM not
 * configured" message.
 */

import Anthropic from '@anthropic-ai/sdk';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { logger } from '../logger';
import { auditLogger } from '../audit/logger';
import type { SseSink } from '../streaming/sse';
import { buildSink } from '../session/runner';
import { collectTools } from '../tools/registry';
import { buildSystemPrompt } from './system-prompt';
import type { ConfirmationCardProps } from '@homeai/contracts/ui-fragments';
import type { Tool, ToolCtx } from '../tools/types';
import type { SessionState } from '../auth/session-store';

const MAX_TURNS = 8;

let client: Anthropic | null = null;
function getClient(): Anthropic {
    if (!client) {
        if (!env.ANTHROPIC_API_KEY) {
            throw new LlmNotConfigured(
                'ANTHROPIC_API_KEY is not set. Configure it in ai-service/.env to enable the LLM-driven chat path.'
            );
        }
        client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    }
    return client;
}

export class LlmNotConfigured extends Error {}

function toAnthropicTool(tool: Tool): Anthropic.Tool {
    // zodToJsonSchema's TParam is deeply recursive; cast input to escape.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schema = zodToJsonSchema(tool.parameters as any, {
        target: 'jsonSchema7',
        $refStrategy: 'none',
    }) as Record<string, unknown>;
    return {
        name: tool.name.replace(/\./g, '_'), // Anthropic tool names can't have dots
        description: tool.description,
        input_schema: {
            type: 'object',
            properties: (schema.properties as Record<string, unknown>) ?? {},
            required: (schema.required as string[]) ?? undefined,
        } as Anthropic.Tool.InputSchema,
    };
}

function fromAnthropicToolName(anthropicName: string): string {
    return anthropicName.replace(/_/g, '.');
}

export class LlmRunner {
    constructor(
        private readonly state: SessionState,
        private readonly sse: SseSink
    ) {}

    /**
     * Run a single user turn through the LLM. Streams SSE events for
     * text deltas, tool calls, and results. Returns when the model has
     * stopped emitting tool_use blocks or the turn-cap is hit.
     */
    async runTurn(userMessage: string): Promise<void> {
        const anthropic = getClient();
        const { tools, byName } = collectTools(this.state.user.role);
        const anthropicTools = tools.map(toAnthropicTool);
        const system = buildSystemPrompt(this.state.user.role);

        // Anthropic.MessageParam is a deeply-recursive union; TS chokes on it
        // when the array grows. We use `any` here and rely on the SDK's
        // runtime validation.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const conversation: any[] = [{ role: 'user', content: userMessage }];

        for (let turn = 0; turn < MAX_TURNS; turn += 1) {
            if (this.sse.isClosed) return;

            const response = await anthropic.messages.create({
                model: env.LLM_MODEL,
                max_tokens: 2048,
                system,
                tools: anthropicTools,
                messages: conversation,
            });

            // Emit text content as text_delta events; collect tool_use blocks.
            const toolUses: { id: string; name: string; input: unknown }[] = [];
            for (const block of response.content) {
                if (block.type === 'text') {
                    if (block.text) this.sse.write({ type: 'text_delta', delta: block.text });
                } else if (block.type === 'tool_use') {
                    toolUses.push({
                        id: block.id,
                        name: fromAnthropicToolName(block.name),
                        input: block.input,
                    });
                }
            }

            // No tools requested → turn complete.
            if (toolUses.length === 0) return;

            // Echo the assistant's mixed content back into the conversation
            // exactly as received, so the next call sees the full history.
            conversation.push({ role: 'assistant', content: response.content });

            const toolResults: Anthropic.ToolResultBlockParam[] = [];
            for (const use of toolUses) {
                const entry = byName.get(use.name);
                if (!entry) {
                    toolResults.push({
                        type: 'tool_result',
                        tool_use_id: use.id,
                        content: `Unknown tool: ${use.name}`,
                        is_error: true,
                    });
                    continue;
                }
                const result = await this.runOneTool(entry.tool, use.id, use.input);
                toolResults.push({
                    type: 'tool_result',
                    tool_use_id: use.id,
                    content: result.text,
                    is_error: result.isError,
                });

                if (result.terminate) {
                    conversation.push({ role: 'user', content: toolResults });
                    return;
                }
            }

            conversation.push({ role: 'user', content: toolResults });

            // Anthropic's stop_reason 'end_turn' would only show up with no
            // tool_use blocks (handled above). 'tool_use' → loop again with
            // the tool results in conversation.
        }

        // Hit MAX_TURNS — emit a friendly truncation note.
        this.sse.write({
            type: 'text_delta',
            delta: '\n\n(Reached maximum tool-call depth. Ask a more direct follow-up if needed.)',
        });
    }

    private async runOneTool(
        tool: Tool,
        toolUseId: string,
        rawInput: unknown
    ): Promise<{ text: string; isError: boolean; terminate?: boolean }> {
        const parsed = tool.parameters.safeParse(rawInput);
        if (!parsed.success) {
            const msg = parsed.error.errors
                .map((e) => `${e.path.join('.')} ${e.message}`)
                .join('; ');
            this.sse.write({
                type: 'tool_call_result',
                toolCallId: toolUseId,
                ok: false,
                summary: { error: msg },
            });
            return { text: `Invalid input: ${msg}`, isError: true };
        }

        // Emit tool_call_start for client observability.
        this.sse.write({
            type: 'tool_call_start',
            toolCallId: toolUseId,
            name: tool.name,
            args: parsed.data as Record<string, unknown>,
        });

        // Confirm-gate: if the tool is confirm-gated AND we don't have an
        // in-conversation "the user already confirmed" marker, surface the
        // gate. (P3.11 simplification: every confirm-gated tool invocation
        // in agent mode is gated. Future: per-conversation confirmation
        // memory so the LLM can re-call after the user confirms.)
        if (tool.confirm) {
            const humanSummary = tool.confirm.humanSummary(parsed.data);
            this.sse.write({
                type: 'confirm_required',
                toolCallId: toolUseId,
                name: tool.name,
                humanSummary,
            });
            const card: ConfirmationCardProps = {
                title: tool.label,
                humanSummary,
                riskLevel: tool.confirm.riskLevel,
                confirmAction: { id: 'confirm', label: 'Confirm', kind: 'primary' },
                cancelAction: { id: 'cancel', label: 'Cancel', kind: 'subtle' },
            };
            this.sse.write({
                type: 'ui',
                toolCallId: toolUseId,
                fragmentId: randomUUID(),
                component: { type: 'ConfirmationCard', props: card },
            });
            this.sse.write({
                type: 'tool_call_result',
                toolCallId: toolUseId,
                ok: true,
                summary: 'Awaiting user confirmation',
            });
            // Feed back to the LLM that the action is pending user confirmation
            // — it should stop and let the human acknowledge before retrying.
            return {
                text: `Action queued, awaiting user confirmation. Do not retry until the user confirms.`,
                isError: false,
                terminate: true,
            };
        }

        const ctx: ToolCtx = {
            user: this.state.user,
            jwt: this.state.jwt,
            sessionId: this.state.sessionId,
        };
        const sink = buildSink(this.sse, toolUseId);

        try {
            const result = await tool.execute(parsed.data, ctx, sink);
            if (result.ui) {
                const frags = Array.isArray(result.ui) ? result.ui : [result.ui];
                for (const f of frags)
                    this.sse.write({
                        type: 'ui',
                        toolCallId: toolUseId,
                        fragmentId: randomUUID(),
                        component: f,
                    });
            }
            this.sse.write({
                type: 'tool_call_result',
                toolCallId: toolUseId,
                ok: true,
                summary: result.text,
            });
            auditLogger.write({
                type: 'tool_call',
                sessionId: this.state.sessionId,
                userId: this.state.user.userId,
                tool: tool.name,
                ok: true,
                durationMs: 0,
                summary: result.text.slice(0, 200),
            });
            return { text: result.text, isError: false, terminate: result.terminate };
        } catch (err) {
            const message = (err as Error)?.message ?? 'tool execution failed';
            logger.error(`tool ${tool.name} failed: ${message}`);
            auditLogger.write({
                type: 'tool_call',
                sessionId: this.state.sessionId,
                userId: this.state.user.userId,
                tool: tool.name,
                ok: false,
                durationMs: 0,
                summary: message,
            });
            this.sse.write({
                type: 'tool_call_result',
                toolCallId: toolUseId,
                ok: false,
                summary: { error: message },
            });
            return { text: `Tool failed: ${message}`, isError: true };
        }
    }
}
