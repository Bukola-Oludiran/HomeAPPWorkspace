/**
 * Tee recorder for the SSE stream.
 *
 * Wraps an SseWriter and additionally accumulates a structured record of
 * what was emitted during a single turn:
 *   - concatenated text deltas → `text`
 *   - all emitted `ui` fragments → `fragments`
 *
 * Used by the chat handler to persist the assistant's turn into the
 * `ai_session_messages` table after the SSE stream completes. The wrapper
 * forwards every write through to the underlying SseWriter unchanged.
 */

import type { SseEvent, SseSink } from './sse';
import type { UiFragment } from '@homeai/contracts/ui-fragments';

export interface RecordedTurn {
    text: string;
    fragments: { fragmentId: string; toolCallId?: string; component: UiFragment }[];
    toolCalls: { toolCallId: string; name: string; args: Record<string, unknown> }[];
}

export class TeeRecorder implements SseSink {
    private text = '';
    private fragments: RecordedTurn['fragments'] = [];
    private toolCalls: RecordedTurn['toolCalls'] = [];

    constructor(private readonly inner: SseSink) {}

    write(event: SseEvent): void {
        this.inner.write(event);
        switch (event.type) {
            case 'text_delta':
                this.text += event.delta;
                break;
            case 'ui':
                this.fragments.push({
                    fragmentId: event.fragmentId,
                    toolCallId: event.toolCallId,
                    component: event.component as UiFragment,
                });
                break;
            case 'tool_call_start':
                this.toolCalls.push({
                    toolCallId: event.toolCallId,
                    name: event.name,
                    args: event.args,
                });
                break;
        }
    }

    end(): void {
        this.inner.end();
    }

    get isClosed(): boolean {
        return this.inner.isClosed;
    }

    capture(): RecordedTurn {
        return {
            text: this.text,
            fragments: this.fragments.slice(),
            toolCalls: this.toolCalls.slice(),
        };
    }
}
