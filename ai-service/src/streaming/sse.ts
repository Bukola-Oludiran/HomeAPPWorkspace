/**
 * SSE writer for /v1/chat.
 *
 * Event types defined in the plan: session, text_delta, tool_call_start,
 * tool_call_result, ui, confirm_required, error, done. The writer keeps no
 * agent state — it just serializes events onto the response stream.
 */

import type { Response } from 'express';

export type SseEvent =
    | { type: 'session'; sessionId: string }
    | { type: 'text_delta'; delta: string }
    | {
          type: 'tool_call_start';
          toolCallId: string;
          name: string;
          args: Record<string, unknown>;
      }
    | {
          type: 'tool_call_result';
          toolCallId: string;
          ok: boolean;
          summary: unknown;
      }
    | {
          type: 'ui';
          toolCallId?: string;
          fragmentId: string;
          component: { type: string; props: unknown };
      }
    | {
          type: 'confirm_required';
          toolCallId: string;
          name: string;
          humanSummary: string;
      }
    | { type: 'error'; code: string; message: string }
    | { type: 'done' };

export interface SseSink {
    write(event: SseEvent): void;
    end(): void;
    readonly isClosed: boolean;
}

export class SseWriter implements SseSink {
    private closed = false;

    constructor(private readonly res: Response) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Disable Nginx response buffering if present
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();

        // Comment line keeps proxies / browsers happy that the stream is
        // alive while no events have flowed yet.
        res.write(': stream-open\n\n');
    }

    write(event: SseEvent): void {
        if (this.closed) return;
        const { type, ...payload } = event;
        this.res.write(`event: ${type}\n`);
        this.res.write(`data: ${JSON.stringify(payload)}\n\n`);
    }

    end(): void {
        if (this.closed) return;
        this.closed = true;
        this.res.end();
    }

    get isClosed(): boolean {
        return this.closed;
    }
}
