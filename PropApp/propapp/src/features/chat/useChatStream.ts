/**
 * Chat SSE consumer hook.
 *
 * `sendMessage(message)` POSTs to /v1/chat with the current sessionId and
 * any contextSeed, then incrementally consumes the SSE response and
 * dispatches parsed events to a reducer that builds the chat timeline.
 *
 * Beyond raw streaming, the hook also exposes:
 *   - `sessions` + `refreshSessions()`: sidebar history fed by /v1/sessions
 *   - `loadSession(id)`: replay a prior conversation into the timeline
 *   - `newConversation()`: clear in-memory state and start fresh
 *   - `deleteSession(id)`: remove a saved conversation server-side
 *   - `setContextSeed(seed)`: seed propertyId/leaseId for the next turn
 */

import { useCallback, useEffect, useReducer, useRef } from 'react';
import type {
    ChatEvent,
    SessionContextSeed,
    SessionSummary,
    TimelineItem,
    UiFragment,
} from './types';

const AI_SERVICE_URL =
    (import.meta.env.VITE_AI_SERVICE_URL as string | undefined) ?? 'http://localhost:4000';

interface ChatState {
    sessionId: string | null;
    timeline: TimelineItem[];
    isStreaming: boolean;
    sessions: SessionSummary[];
    contextSeed: SessionContextSeed | null;
    pendingConfirmation: {
        toolCallId: string;
        name: string;
        humanSummary: string;
    } | null;
}

type Action =
    | { type: 'turn_started'; userMessage: string }
    | { type: 'session_assigned'; sessionId: string }
    | { type: 'text_delta'; delta: string }
    | { type: 'fragment'; fragmentId: string; toolCallId?: string; component: UiFragment }
    | { type: 'confirm_required'; toolCallId: string; name: string; humanSummary: string }
    | { type: 'confirm_resolved' }
    | { type: 'error'; code: string; message: string }
    | { type: 'done' }
    | { type: 'sessions_loaded'; sessions: SessionSummary[] }
    | { type: 'session_replay'; sessionId: string; timeline: TimelineItem[] }
    | { type: 'context_seed'; seed: SessionContextSeed | null }
    | { type: 'reset' };

const initial: ChatState = {
    sessionId: null,
    timeline: [],
    isStreaming: false,
    sessions: [],
    contextSeed: null,
    pendingConfirmation: null,
};

function uuid(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function reducer(state: ChatState, action: Action): ChatState {
    switch (action.type) {
        case 'reset':
            return { ...initial, sessions: state.sessions };
        case 'turn_started':
            return {
                ...state,
                isStreaming: true,
                timeline: action.userMessage
                    ? [
                          ...state.timeline,
                          {
                              kind: 'user_message',
                              id: uuid(),
                              text: action.userMessage,
                              createdAt: new Date().toISOString(),
                          },
                      ]
                    : state.timeline,
            };
        case 'session_assigned':
            return { ...state, sessionId: action.sessionId };
        case 'text_delta': {
            const last = state.timeline[state.timeline.length - 1];
            if (last && last.kind === 'text') {
                const updated: TimelineItem[] = [
                    ...state.timeline.slice(0, -1),
                    { ...last, text: last.text + action.delta },
                ];
                return { ...state, timeline: updated };
            }
            return {
                ...state,
                timeline: [
                    ...state.timeline,
                    {
                        kind: 'text',
                        id: uuid(),
                        text: action.delta,
                        createdAt: new Date().toISOString(),
                    },
                ],
            };
        }
        case 'fragment':
            return {
                ...state,
                timeline: [
                    ...state.timeline,
                    {
                        kind: 'fragment',
                        id: action.fragmentId,
                        toolCallId: action.toolCallId,
                        component: action.component,
                        createdAt: new Date().toISOString(),
                    },
                ],
            };
        case 'confirm_required':
            return {
                ...state,
                pendingConfirmation: {
                    toolCallId: action.toolCallId,
                    name: action.name,
                    humanSummary: action.humanSummary,
                },
            };
        case 'confirm_resolved':
            return { ...state, pendingConfirmation: null };
        case 'error':
            return {
                ...state,
                timeline: [
                    ...state.timeline,
                    {
                        kind: 'error',
                        id: uuid(),
                        code: action.code,
                        message: action.message,
                        createdAt: new Date().toISOString(),
                    },
                ],
                isStreaming: false,
            };
        case 'done':
            return { ...state, isStreaming: false };
        case 'sessions_loaded':
            return { ...state, sessions: action.sessions };
        case 'session_replay':
            return { ...state, sessionId: action.sessionId, timeline: action.timeline };
        case 'context_seed':
            return { ...state, contextSeed: action.seed };
    }
}

interface PersistedMessageRow {
    id: string;
    role: 'USER' | 'ASSISTANT' | 'SYSTEM';
    content: string;
    payload: {
        fragments?: { fragmentId: string; toolCallId?: string; component: UiFragment }[];
    } | null;
    createdAt: string;
}

function rowsToTimeline(rows: PersistedMessageRow[]): TimelineItem[] {
    const out: TimelineItem[] = [];
    for (const m of rows) {
        if (m.role === 'USER') {
            out.push({ kind: 'user_message', id: m.id, text: m.content, createdAt: m.createdAt });
            continue;
        }
        if (m.role === 'SYSTEM') continue;
        if (m.content) {
            out.push({ kind: 'text', id: `${m.id}-t`, text: m.content, createdAt: m.createdAt });
        }
        for (const f of m.payload?.fragments ?? []) {
            out.push({
                kind: 'fragment',
                id: f.fragmentId,
                toolCallId: f.toolCallId,
                component: f.component,
                createdAt: m.createdAt,
            });
        }
    }
    return out;
}

export interface UseChatStreamOptions {
    getJwt(): string | null;
    /** Optional initial contextSeed (set from URL params on page mount). */
    initialContextSeed?: SessionContextSeed | null;
}

export function useChatStream({ getJwt, initialContextSeed }: UseChatStreamOptions) {
    const [state, dispatch] = useReducer(reducer, initial);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        dispatch({ type: 'context_seed', seed: initialContextSeed ?? null });
    }, [initialContextSeed]);

    const authedFetch = useCallback(
        async (path: string, init?: RequestInit): Promise<Response> => {
            const token = getJwt();
            if (!token) throw new Error('Not signed in');
            return fetch(`${AI_SERVICE_URL}${path}`, {
                ...init,
                headers: {
                    'Content-Type': 'application/json',
                    ...(init?.headers ?? {}),
                    Authorization: `Bearer ${token}`,
                },
            });
        },
        [getJwt]
    );

    const refreshSessions = useCallback(async () => {
        try {
            const res = await authedFetch('/v1/sessions');
            if (!res.ok) return;
            const json = (await res.json()) as { sessions: SessionSummary[] };
            dispatch({ type: 'sessions_loaded', sessions: json.sessions });
        } catch {
            /* silent — sidebar can show empty */
        }
    }, [authedFetch]);

    const loadSession = useCallback(
        async (sessionId: string) => {
            const res = await authedFetch(`/v1/sessions/${sessionId}/messages`);
            if (!res.ok) return;
            const json = (await res.json()) as { messages: PersistedMessageRow[] };
            dispatch({
                type: 'session_replay',
                sessionId,
                timeline: rowsToTimeline(json.messages),
            });
        },
        [authedFetch]
    );

    const deleteSession = useCallback(
        async (sessionId: string) => {
            await authedFetch(`/v1/sessions/${sessionId}`, { method: 'DELETE' });
            if (state.sessionId === sessionId) dispatch({ type: 'reset' });
            await refreshSessions();
        },
        [authedFetch, state.sessionId, refreshSessions]
    );

    const newConversation = useCallback(() => {
        abortRef.current?.abort();
        dispatch({ type: 'reset' });
    }, []);

    const setContextSeed = useCallback((seed: SessionContextSeed | null) => {
        dispatch({ type: 'context_seed', seed });
    }, []);

    const sendRaw = useCallback(
        async (body: object, userMessageForTimeline?: string) => {
            const token = getJwt();
            if (!token) {
                dispatch({ type: 'error', code: 'AUTH', message: 'Not signed in' });
                return;
            }

            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            dispatch({ type: 'turn_started', userMessage: userMessageForTimeline ?? '' });

            const res = await fetch(`${AI_SERVICE_URL}/v1/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...body,
                    sessionId: state.sessionId ?? undefined,
                    contextSeed: state.contextSeed ?? undefined,
                }),
                signal: controller.signal,
            });

            if (!res.ok || !res.body) {
                const detail = await res.text().catch(() => '');
                dispatch({
                    type: 'error',
                    code: String(res.status),
                    message: detail || res.statusText,
                });
                return;
            }

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let buf = '';
            try {
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    buf += decoder.decode(value, { stream: true });

                    let boundary;
                    while ((boundary = buf.indexOf('\n\n')) >= 0) {
                        const block = buf.slice(0, boundary).trim();
                        buf = buf.slice(boundary + 2);
                        if (!block || block.startsWith(':')) continue;
                        const parsed = parseBlock(block);
                        if (parsed) dispatchEvent(parsed);
                    }
                }
            } catch (e) {
                if ((e as Error).name !== 'AbortError') {
                    dispatch({
                        type: 'error',
                        code: 'NETWORK',
                        message: (e as Error).message,
                    });
                }
            } finally {
                refreshSessions();
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [getJwt, state.sessionId, state.contextSeed, refreshSessions]
    );

    function dispatchEvent(ev: ChatEvent) {
        switch (ev.type) {
            case 'session':
                dispatch({ type: 'session_assigned', sessionId: ev.sessionId });
                break;
            case 'text_delta':
                dispatch({ type: 'text_delta', delta: ev.delta });
                break;
            case 'ui':
                dispatch({
                    type: 'fragment',
                    fragmentId: ev.fragmentId,
                    toolCallId: ev.toolCallId,
                    component: ev.component,
                });
                break;
            case 'confirm_required':
                dispatch({
                    type: 'confirm_required',
                    toolCallId: ev.toolCallId,
                    name: ev.name,
                    humanSummary: ev.humanSummary,
                });
                break;
            case 'tool_call_result':
            case 'tool_call_start':
                break;
            case 'error':
                dispatch({ type: 'error', code: ev.code, message: ev.message });
                break;
            case 'done':
                dispatch({ type: 'done' });
                break;
        }
    }

    const sendMessage = useCallback(
        (message: string) => sendRaw({ message }, message),
        [sendRaw]
    );

    const sendUiAction = useCallback(
        (fragmentId: string, actionId: string, payload?: Record<string, unknown>) =>
            sendRaw({
                message: {
                    type: 'ui_action' as const,
                    fragmentId,
                    actionId,
                    payload,
                },
            }),
        [sendRaw]
    );

    const sendConfirmation = useCallback(
        async (toolCallId: string, approved: boolean) => {
            dispatch({ type: 'confirm_resolved' });
            await sendRaw({
                message: {
                    type: 'confirmation' as const,
                    toolCallId,
                    approved,
                },
            });
        },
        [sendRaw]
    );

    return {
        state,
        sendMessage,
        sendUiAction,
        sendConfirmation,
        newConversation,
        refreshSessions,
        loadSession,
        deleteSession,
        setContextSeed,
    };
}

function parseBlock(block: string): ChatEvent | null {
    let type = '';
    let data = '';
    for (const line of block.split('\n')) {
        if (line.startsWith('event: ')) type = line.slice(7);
        else if (line.startsWith('data: ')) data = line.slice(6);
    }
    if (!type) return null;
    try {
        const payload = data ? JSON.parse(data) : {};
        return { type, ...payload } as ChatEvent;
    } catch {
        return null;
    }
}
