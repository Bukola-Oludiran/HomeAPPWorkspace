/**
 * ChatPanel — the main chat container.
 *
 * Wires the SSE stream hook to the timeline renderer, surfaces text +
 * generative-UI fragments inline, posts confirmations + ui_actions back
 * to the AI service. Auth is read from the app's auth context (we accept
 * a `useJwt` prop so the panel stays decoupled).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { FragmentRenderer } from './components/FragmentRenderer';
import { useChatStream } from './useChatStream';
import type { TimelineItem } from './types';

interface ChatPanelProps {
    getJwt(): string | null;
    /** Initial system suggestion shown before the first user message. */
    placeholder?: string;
}

export function ChatPanel({ getJwt, placeholder }: ChatPanelProps) {
    const { state, sendMessage, sendUiAction, sendConfirmation } = useChatStream({ getJwt });
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [state.timeline.length, state.isStreaming]);

    const onSubmit = useCallback(
        (e?: React.FormEvent) => {
            e?.preventDefault();
            const trimmed = input.trim();
            if (!trimmed || state.isStreaming) return;
            sendMessage(trimmed);
            setInput('');
        },
        [input, state.isStreaming, sendMessage]
    );

    const onFragmentAction = useCallback(
        (fragmentId: string, actionId: string, payload?: Record<string, unknown>) => {
            sendUiAction(fragmentId, actionId, payload);
        },
        [sendUiAction]
    );

    return (
        <div className="flex h-full flex-col">
            <div
                ref={scrollRef}
                className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4"
            >
                {state.timeline.length === 0 ? (
                    <div className="mt-8 text-center text-sm text-slate-400">
                        {placeholder ?? 'Ask HomeAI anything about your properties, leases, or payments.'}
                    </div>
                ) : (
                    state.timeline.map((item) => <TimelineRow key={item.id} item={item} onAction={onFragmentAction} />)
                )}
                {state.pendingConfirmation ? (
                    <div className="rounded-2xl border-2 border-amber-400 bg-white p-4">
                        <p className="text-sm font-semibold text-slate-700">
                            {state.pendingConfirmation.name}
                        </p>
                        <p className="mt-1 text-sm text-slate-900">
                            {state.pendingConfirmation.humanSummary}
                        </p>
                        <div className="mt-3 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() =>
                                    sendConfirmation(state.pendingConfirmation!.toolCallId, false)
                                }
                                className="rounded-full px-3 py-1.5 text-sm text-slate-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    sendConfirmation(state.pendingConfirmation!.toolCallId, true)
                                }
                                className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
            <form
                onSubmit={onSubmit}
                className="flex gap-2 border-t border-slate-200 bg-white p-3"
            >
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={state.isStreaming ? 'Streaming…' : 'Message HomeAI…'}
                    disabled={state.isStreaming}
                    className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:border-slate-400 focus:outline-none disabled:opacity-50"
                />
                <button
                    type="submit"
                    disabled={state.isStreaming || !input.trim()}
                    className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                >
                    Send
                </button>
            </form>
        </div>
    );
}

interface RowProps {
    item: TimelineItem;
    onAction: (fragmentId: string, actionId: string, payload?: Record<string, unknown>) => void;
}

function TimelineRow({ item, onAction }: RowProps) {
    if (item.kind === 'user_message') {
        return (
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm bg-slate-900 px-3 py-2 text-sm text-white">
                {item.text}
            </div>
        );
    }
    if (item.kind === 'text') {
        return (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-800">
                {item.text}
            </div>
        );
    }
    if (item.kind === 'fragment') {
        return (
            <FragmentRenderer
                fragment={item.component}
                onAction={(actionId, payload) => onAction(item.id, actionId, payload)}
            />
        );
    }
    if (item.kind === 'error') {
        return (
            <div className="rounded-xl bg-red-50 p-2 text-xs text-red-700">
                [{item.code}] {item.message}
            </div>
        );
    }
    return null;
}
