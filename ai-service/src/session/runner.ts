/**
 * SessionRunner — orchestrates tool execution for a chat turn.
 *
 * Two modes:
 *   - **direct**: invokes a named tool directly with explicit params. Used
 *     by the dev-only POST /v1/_dev/tool/:name endpoint and by unit tests.
 *     Exercises the full DB / gRPC / UI / SSE pipeline without an LLM.
 *   - **agent**: routes through pi-mono with a real LLM. Wired in P3.11
 *     once ANTHROPIC_API_KEY is configured. Stub today.
 *
 * Both modes share the same Tool catalogue (from ./tools/registry) and
 * the same SSE wire shape — they only differ in *who* decides which tool
 * to call (a fixed name from the request body vs. the LLM).
 */

import { randomUUID } from 'crypto';
import { z } from 'zod';
import type {
    ConfirmationCardProps,
    ErrorCardProps,
    UiFragment,
} from '@homeai/contracts/ui-fragments';
import { logger } from '../logger';
import type { SseSink } from '../streaming/sse';
import { collectTools } from '../tools/registry';
import type { Tool, ToolCtx, ToolResult, ToolSink } from '../tools/types';
import type { SessionState } from '../auth/session-store';

function emitErrorFragment(sse: SseSink, message: string, code = 'TOOL_ERROR'): void {
    const fragment: UiFragment = {
        type: 'ErrorCard',
        props: {
            title: 'Something went wrong',
            message,
            code,
        } satisfies ErrorCardProps,
    };
    sse.write({
        type: 'ui',
        fragmentId: randomUUID(),
        component: fragment,
    });
}

export function buildSink(sse: SseSink, toolCallId?: string): ToolSink {
    return {
        ui(fragment, callId) {
            sse.write({
                type: 'ui',
                toolCallId: callId ?? toolCallId,
                fragmentId: randomUUID(),
                component: fragment,
            });
        },
        textDelta(delta) {
            sse.write({ type: 'text_delta', delta });
        },
    };
}

export interface InvokeDirectInput {
    toolName: string;
    args: unknown;
    /** When set, the tool's confirm-gate is treated as already approved. */
    skipConfirm?: boolean;
}

export class SessionRunner {
    constructor(
        private readonly state: SessionState,
        private readonly sse: SseSink
    ) {}

    /** Direct tool invocation — no LLM in the loop. */
    async invokeDirect(input: InvokeDirectInput): Promise<void> {
        const { tools, byName } = collectTools(this.state.user.role);
        const entry = byName.get(input.toolName);
        if (!entry) {
            const available = tools.map((t) => t.name).join(', ');
            emitErrorFragment(
                this.sse,
                `Tool "${input.toolName}" not available for role ${this.state.user.role}. Available: ${available}`,
                'TOOL_NOT_FOUND'
            );
            this.sse.write({
                type: 'error',
                code: 'TOOL_NOT_FOUND',
                message: input.toolName,
            });
            this.sse.write({ type: 'done' });
            return;
        }

        const { tool } = entry;
        const toolCallId = randomUUID();
        const sink = buildSink(this.sse, toolCallId);

        // Validate args against the tool's zod schema BEFORE doing anything else.
        const parsed = tool.parameters.safeParse(input.args);
        if (!parsed.success) {
            emitErrorFragment(
                this.sse,
                `Invalid arguments for ${input.toolName}: ${parsed.error.errors.map((e: z.ZodIssue) => `${e.path.join('.')} ${e.message}`).join('; ')}`,
                'TOOL_VALIDATION'
            );
            this.sse.write({
                type: 'tool_call_result',
                toolCallId,
                ok: false,
                summary: { error: parsed.error.errors },
            });
            this.sse.write({ type: 'done' });
            return;
        }

        // Confirmation gate: emit `confirm_required` + ConfirmationCard.
        // In direct mode, we bypass with `skipConfirm`; in agent mode (P3.11)
        // we wait for the client's ui_action follow-up.
        if (tool.confirm && !input.skipConfirm) {
            const summary = tool.confirm.humanSummary(parsed.data);
            this.sse.write({
                type: 'confirm_required',
                toolCallId,
                name: tool.name,
                humanSummary: summary,
            });
            const card: ConfirmationCardProps = {
                title: tool.label,
                humanSummary: summary,
                riskLevel: tool.confirm.riskLevel,
                confirmAction: { id: 'confirm', label: 'Confirm', kind: 'primary' },
                cancelAction: { id: 'cancel', label: 'Cancel', kind: 'subtle' },
            };
            sink.ui({ type: 'ConfirmationCard', props: card });
            this.sse.write({ type: 'done' });
            return;
        }

        // Emit tool_call_start with the LLM-emitted args.
        this.sse.write({
            type: 'tool_call_start',
            toolCallId,
            name: tool.name,
            args: parsed.data as Record<string, unknown>,
        });

        try {
            const ctx = this.ctx();
            const result = await tool.execute(parsed.data, ctx, sink);
            this.emitResult(toolCallId, tool, result);
        } catch (err) {
            const message = (err as Error)?.message ?? 'Unknown tool failure';
            logger.error(`tool ${tool.name} failed: ${message}`);
            emitErrorFragment(this.sse, message, 'TOOL_EXECUTION');
            this.sse.write({
                type: 'tool_call_result',
                toolCallId,
                ok: false,
                summary: { error: message },
            });
        } finally {
            this.sse.write({ type: 'done' });
        }
    }

    private emitResult(toolCallId: string, _tool: Tool, result: ToolResult): void {
        // Tool may emit fragments via the sink during execute; the result's
        // own `ui` payload is emitted last (e.g., a follow-up receipt card).
        if (result.ui) {
            const fragments = Array.isArray(result.ui) ? result.ui : [result.ui];
            for (const fragment of fragments) {
                this.sse.write({
                    type: 'ui',
                    toolCallId,
                    fragmentId: randomUUID(),
                    component: fragment,
                });
            }
        }
        this.sse.write({
            type: 'tool_call_result',
            toolCallId,
            ok: true,
            summary: result.text,
        });
        // Echo the text summary as a final text_delta for a closing line.
        this.sse.write({ type: 'text_delta', delta: result.text });
    }

    private ctx(): ToolCtx {
        return {
            user: this.state.user,
            jwt: this.state.jwt,
            sessionId: this.state.sessionId,
        };
    }
}
