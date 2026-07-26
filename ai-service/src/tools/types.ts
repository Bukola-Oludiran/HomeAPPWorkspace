/**
 * Tool & ToolBundle types — MCP-style grouping.
 *
 * A `ToolBundle` is a domain-shaped collection of related tools plus a
 * role-eligibility predicate. The session manager (P3.9) composes a
 * session's tool catalogue from bundles whose `eligibleRoles` include
 * the user's role, defensively re-checked in pi-mono's beforeToolCall.
 *
 * Tools are JSON-RPC-shaped so they can be exercised directly in tests
 * (bypassing pi-mono) and so the pi-mono adapter is a thin wrapper.
 *
 * Each tool's execute() receives:
 *   - params: validated against the tool's zod schema
 *   - ctx: per-session user context (jwt held by service, never by LLM)
 *   - sink: emit UI fragments / text deltas back through the SSE stream
 *   - signal: abort signal from pi-mono / client disconnect
 *
 * The tool returns a structured ToolResult — `text` for the LLM, `details`
 * for logs, and optionally a `terminate` flag.
 */

import type { z, ZodTypeAny } from 'zod';
import type { UiFragment } from '@homeai/contracts/ui-fragments';
import type { SessionUser } from '../auth/verify-jwt';

export type Role = SessionUser['role'];

export interface ToolCtx {
    user: SessionUser;
    /** The bearer JWT the AI service holds for this session — never exposed to the LLM. */
    jwt: string;
    sessionId: string;
}

export interface ToolSink {
    /** Emit a UI fragment back through the SSE stream. */
    ui(fragment: UiFragment, toolCallId?: string): void;
    /** Emit a text-delta event (rarely needed from tools — usually the LLM's job). */
    textDelta(delta: string): void;
}

export interface ToolResult {
    /** Plain-text summary the LLM sees as the tool result content. */
    text: string;
    /** Optional UI fragments to emit alongside the text. */
    ui?: UiFragment | UiFragment[];
    /** Optional structured details for audit logs. Not sent to LLM. */
    details?: unknown;
    /** Hint that the agent should stop the current turn after this tool. */
    terminate?: boolean;
}

export interface Tool<TParams extends ZodTypeAny = ZodTypeAny> {
    name: string;
    label: string;
    description: string;
    parameters: TParams;
    confirm?: {
        /** Surface a ConfirmationCard before executing. */
        humanSummary: (params: z.infer<TParams>) => string;
        riskLevel: 'low' | 'medium' | 'high';
    };
    execute: (
        params: z.infer<TParams>,
        ctx: ToolCtx,
        sink: ToolSink,
        signal?: AbortSignal
    ) => Promise<ToolResult>;
}

export interface ToolBundle {
    name: string;
    description: string;
    eligibleRoles: readonly Role[];
    readTools: Tool[];
    writeTools: Tool[];
}

/** Type-erasure helper: declare a tool with full inference but accept it as `Tool`. */
export function defineLocalTool<TParams extends ZodTypeAny>(t: Tool<TParams>): Tool {
    return t as unknown as Tool;
}
