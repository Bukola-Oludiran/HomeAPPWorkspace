/**
 * AIChatPage — the dedicated `/ai-chat` route.
 *
 * Visual chrome (header, navbar, sidebar shell, bubble styling, input
 * pill) is preserved from the original mock-data design. Data path
 * is now real:
 *   - sidebar history → GET /v1/sessions (grouped by today/yesterday/etc)
 *   - main timeline   → useChatStream's reducer (text deltas + fragments)
 *   - inline cards    → FragmentRenderer
 *   - role-aware empty-state and placeholder
 *   - URL params:
 *       ?propertyId=… / ?leaseId=… → seed the next-turn contextSeed
 *       ?msg=…                     → auto-submit (floating-widget hand-off)
 *       ?sessionId=…               → resume a saved conversation
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ConfirmationModal from '../../components/ConfirmationModal';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../contexts/AuthContext';
import { tokenManager } from '../../lib/api/client';
import { FragmentRenderer } from '../../features/chat/components/FragmentRenderer';
import { useChatStream } from '../../features/chat/useChatStream';
import type { SessionContextSeed, TimelineItem } from '../../features/chat/types';

// ============================================================
// Role-aware copy
// ============================================================

const ROLE_PLACEHOLDER: Record<string, string> = {
    TENANT: 'Find a property, pay rent, report a maintenance issue…',
    LANDLORD: 'Review applicants, list a property, request a payout…',
    AGENT: 'Show me available jobs, accept a viewing, check earnings…',
    ADMIN: 'Ask anything about your properties, leases, or payments…',
};
const ROLE_EMPTY_TITLE: Record<string, string> = {
    TENANT: 'Looking for your next place?',
    LANDLORD: 'Manage your portfolio',
    AGENT: 'Find jobs near you',
    ADMIN: 'Keystead Assistant',
};
const ROLE_SUGGESTIONS: Record<string, string[]> = {
    TENANT: [
        'Find a 2-bedroom in Lekki under ₦2.5M',
        'Show me my active applications',
        'Report a broken AC in my apartment',
    ],
    LANDLORD: [
        'Show me applicants for my VI property',
        'Recommend a price for property 1 (max yield)',
        'Request a payout of ₦500,000',
    ],
    AGENT: [
        'Available property-viewing jobs this week',
        'My earnings this month',
        'Mark job XYZ complete',
    ],
    ADMIN: ['List active properties', 'Show my notifications', 'Show landlord financials'],
};

// ============================================================
// Sidebar grouping
// ============================================================

interface SidebarGroup {
    label: string;
    items: { id: string; title: string; lastMessageAt: string }[];
}

function groupSessions(
    sessions: { id: string; title: string; lastMessageAt: string }[]
): SidebarGroup[] {
    const today: SidebarGroup['items'] = [];
    const yesterday: SidebarGroup['items'] = [];
    const week: SidebarGroup['items'] = [];
    const older: SidebarGroup['items'] = [];
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
    const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000;
    for (const s of sessions) {
        const t = new Date(s.lastMessageAt).getTime();
        if (t >= startOfToday) today.push(s);
        else if (t >= startOfYesterday) yesterday.push(s);
        else if (t >= sevenDaysAgo) week.push(s);
        else older.push(s);
    }
    const groups: SidebarGroup[] = [];
    if (today.length) groups.push({ label: 'Today', items: today });
    if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
    if (week.length) groups.push({ label: 'Previous 7 Days', items: week });
    if (older.length) groups.push({ label: 'Older', items: older });
    return groups;
}

function relativeTime(iso: string): string {
    const t = new Date(iso);
    const now = new Date();
    const sameDay =
        t.getFullYear() === now.getFullYear() &&
        t.getMonth() === now.getMonth() &&
        t.getDate() === now.getDate();
    if (sameDay) return t.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return t.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// ============================================================
// Page
// ============================================================

export default function AIChatPage() {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const roleKey: string = user?.role ?? 'ADMIN';

    // Context seed derived from URL params (`?propertyId=…&leaseId=…`).
    const seedFromUrl = useMemo<SessionContextSeed | null>(() => {
        const seed: SessionContextSeed = {};
        const get = (k: string) => searchParams.get(k) ?? undefined;
        seed.propertyId = get('propertyId');
        seed.leaseId = get('leaseId');
        seed.applicationId = get('applicationId');
        seed.conversationId = get('conversationId');
        seed.maintenanceRequestId = get('maintenanceRequestId');
        return Object.values(seed).some((v) => v) ? seed : null;
    }, [searchParams]);

    const chat = useChatStream({
        getJwt: () => tokenManager.getAccessToken(),
        initialContextSeed: seedFromUrl,
    });
    const {
        state,
        sendMessage,
        sendUiAction,
        sendConfirmation,
        newConversation,
        refreshSessions,
        loadSession,
        deleteSession,
    } = chat;

    const [showSidebar, setShowSidebar] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showClearModal, setShowClearModal] = useState(false);
    const [pendingClearId, setPendingClearId] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // 1. Fetch sidebar history on mount.
    useEffect(() => {
        refreshSessions();
    }, [refreshSessions]);

    // 2. Resume a session if ?sessionId=… is in the URL.
    const sessionIdParam = searchParams.get('sessionId');
    useEffect(() => {
        if (sessionIdParam && sessionIdParam !== state.sessionId) {
            loadSession(sessionIdParam);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionIdParam]);

    // 3. Auto-submit if ?msg=… arrived from the floating widget.
    const msgParam = searchParams.get('msg');
    const autoSubmittedRef = useRef(false);
    useEffect(() => {
        if (msgParam && !autoSubmittedRef.current && !state.isStreaming) {
            autoSubmittedRef.current = true;
            sendMessage(msgParam);
            const next = new URLSearchParams(searchParams);
            next.delete('msg');
            setSearchParams(next, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [msgParam]);

    // 4. Keep the timeline scrolled to bottom.
    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [state.timeline.length, state.isStreaming]);

    function submit() {
        const trimmed = message.trim();
        if (!trimmed || state.isStreaming) return;
        sendMessage(trimmed);
        setMessage('');
        inputRef.current?.focus();
    }

    function handleSidebarClick(id: string) {
        const next = new URLSearchParams(searchParams);
        next.set('sessionId', id);
        next.delete('msg');
        setSearchParams(next, { replace: true });
        loadSession(id);
        if (window.innerWidth < 768) setShowSidebar(false);
    }

    function handleNewChat() {
        newConversation();
        const next = new URLSearchParams();
        if (seedFromUrl?.propertyId) next.set('propertyId', seedFromUrl.propertyId);
        if (seedFromUrl?.leaseId) next.set('leaseId', seedFromUrl.leaseId);
        setSearchParams(next, { replace: true });
    }

    const onFragmentAction = (
        fragmentId: string,
        actionId: string,
        payload?: Record<string, unknown>
    ) => {
        sendUiAction(fragmentId, actionId, payload);
    };

    const groups = useMemo(() => groupSessions(state.sessions), [state.sessions]);
    const placeholder = ROLE_PLACEHOLDER[roleKey] ?? 'Ask Keystead anything…';
    const emptyTitle = ROLE_EMPTY_TITLE[roleKey] ?? 'Keystead Assistant';
    const suggestions = ROLE_SUGGESTIONS[roleKey] ?? [];
    const firstName = user?.firstName ?? '';

    return (
        <div className="bg-canvas dark:bg-canvas-dark h-screen flex flex-col text-slate-900 dark:text-white overflow-hidden relative">
            <ConfirmationModal
                isOpen={showClearModal}
                onClose={() => {
                    setShowClearModal(false);
                    setPendingClearId(null);
                }}
                onConfirm={() => {
                    if (pendingClearId) deleteSession(pendingClearId);
                    setShowClearModal(false);
                    setPendingClearId(null);
                }}
                title="Delete conversation?"
                description="This will permanently delete this chat history. This cannot be undone."
                confirmText="Delete"
                icon="delete"
            />

            {/* Logo */}
            <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                <Link to="/" className="flex items-center h-10">
                    <Logo wordmark="md" />
                </Link>
            </div>

            {/* Header Navbar */}
            <header className="fixed top-6 left-0 right-0 z-40 flex justify-center w-full pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-1 md:gap-2 px-3 py-2 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-xl border border-white/20 dark:border-slate-700 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-black/20 rounded-full mx-4">
                    <div className="flex items-center gap-1">
                        <Link to="/" aria-label="Home" className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-brand-ink hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            <span className="material-symbols-outlined">home</span>
                        </Link>
                        <Link to="/search?type=buy" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-brand-ink hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            Buy
                        </Link>
                        <Link to="/search?type=rent" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-brand-ink hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            Rent
                        </Link>
                        <Link to="/search?type=sell" className="px-4 py-2 text-sm font-semibold rounded-full text-slate-600 hover:text-brand-ink hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            Sell
                        </Link>
                        <Link to="/ai-chat" aria-label="AI Chat" className="flex items-center justify-center size-10 md:size-11 rounded-full text-brand-ink bg-slate-100 dark:bg-slate-700 transition-all">
                            <span className="material-symbols-outlined">forum</span>
                        </Link>
                    </div>
                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <div className="flex items-center gap-1 md:gap-2">
                        <button className="flex items-center justify-center size-10 md:size-11 rounded-full text-slate-500 hover:text-brand-ink hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white transition-all">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center justify-center overflow-hidden rounded-full size-10 md:size-11 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:ring-2 hover:ring-brand/20 transition-all border border-slate-200 dark:border-slate-600"
                            >
                                <span className="material-symbols-outlined">account_circle</span>
                            </button>
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 py-2 bg-white dark:bg-slate-800 min-w-[200px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)] z-50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <Link to="/landlord/dashboard" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-ink">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">dashboard</span>
                                            Landlord dashboard
                                        </div>
                                    </Link>
                                    <Link to="/tenant/dashboard" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-ink">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">vpn_key</span>
                                            Tenant dashboard
                                        </div>
                                    </Link>
                                    <Link to="/agent/jobs" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-ink">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">support_agent</span>
                                            Agent dashboard
                                        </div>
                                    </Link>
                                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                    <Link to="/settings" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-brand-ink">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">settings</span>
                                            Account settings
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 pt-24 pb-4 md:pb-6 px-4 md:px-6 flex flex-col h-full overflow-hidden">
                <div className="flex-1 flex gap-4 md:gap-6 w-full max-w-[95rem] mx-auto overflow-hidden">
                    {/* Sidebar */}
                    {showSidebar && (
                        <aside className="hidden md:flex w-80 flex-col bg-white dark:bg-surface-dark rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden shrink-0 animate-fade-in-up">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shrink-0 bg-white dark:bg-surface-dark z-10">
                                <h2 className="font-bold text-slate-900 dark:text-white text-lg">Chat history</h2>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={handleNewChat}
                                        title="New conversation"
                                        className="size-8 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-xl">edit_square</span>
                                    </button>
                                    <button
                                        onClick={() => setShowSidebar(false)}
                                        className="size-8 flex items-center justify-center rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                                        title="Close sidebar"
                                    >
                                        <span className="material-symbols-outlined text-xl">close</span>
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
                                {groups.length === 0 ? (
                                    <div className="px-3 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                                        No conversations yet. Send a message to start.
                                    </div>
                                ) : (
                                    groups.map((g) => (
                                        <div className="mb-6" key={g.label}>
                                            <h3 className="px-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                                                {g.label}
                                            </h3>
                                            <div className="space-y-1">
                                                {g.items.map((chatRow) => {
                                                    const active = chatRow.id === state.sessionId;
                                                    return (
                                                        <div
                                                            key={chatRow.id}
                                                            className={`group relative w-full text-left p-3 rounded-xl transition-all cursor-pointer ${
                                                                active
                                                                    ? 'bg-brand-ink text-on-brand'
                                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                                            }`}
                                                            onClick={() => handleSidebarClick(chatRow.id)}
                                                        >
                                                            <div className="flex justify-between items-start mb-1">
                                                                <span
                                                                    className={`font-bold text-sm truncate pr-2 ${
                                                                        active ? '' : 'text-slate-700 dark:text-slate-200'
                                                                    }`}
                                                                >
                                                                    {chatRow.title}
                                                                </span>
                                                                <span
                                                                    className={`text-xs whitespace-nowrap ${
                                                                        active ? 'opacity-80' : 'text-slate-500 dark:text-slate-400'
                                                                    }`}
                                                                >
                                                                    {relativeTime(chatRow.lastMessageAt)}
                                                                </span>
                                                            </div>
                                                            <button
                                                                aria-label="Delete conversation"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setPendingClearId(chatRow.id);
                                                                    setShowClearModal(true);
                                                                }}
                                                                className={`absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md ${
                                                                    active ? 'hover:bg-white/20' : 'hover:bg-slate-200 dark:hover:bg-slate-700'
                                                                }`}
                                                            >
                                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 shrink-0">
                                <button
                                    onClick={handleNewChat}
                                    className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-on-brand bg-brand-ink hover:bg-brand-ink/90 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                    New conversation
                                </button>
                            </div>
                        </aside>
                    )}

                    {/* Chat Container */}
                    <div
                        className={`flex-1 bg-white dark:bg-surface-dark rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col ${
                            showSidebar ? 'w-full' : 'max-w-5xl mx-auto w-full'
                        } overflow-hidden relative`}
                    >
                        <button
                            onClick={() => setShowSidebar(!showSidebar)}
                            className={`absolute top-4 left-4 z-20 p-2 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-brand/20 ${
                                showSidebar
                                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                                    : 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white shadow-sm border border-slate-200 dark:border-slate-700'
                            }`}
                            title="Toggle sidebar"
                        >
                            <span className="material-symbols-outlined">menu</span>
                        </button>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar">
                            {state.timeline.length === 0 ? (
                                <EmptyState
                                    title={emptyTitle}
                                    firstName={firstName}
                                    placeholder={placeholder}
                                    suggestions={suggestions}
                                    onSuggestion={sendMessage}
                                    seed={seedFromUrl}
                                />
                            ) : (
                                <Timeline
                                    items={state.timeline}
                                    onFragmentAction={onFragmentAction}
                                    isStreaming={state.isStreaming}
                                />
                            )}

                            {state.pendingConfirmation ? (
                                <div className="flex gap-4 max-w-[95%] md:max-w-[85%]">
                                    <AssistantAvatar />
                                    <div className="flex-1 rounded-2xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-900/20 p-4">
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            {state.pendingConfirmation.name}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-900 dark:text-slate-100">
                                            {state.pendingConfirmation.humanSummary}
                                        </p>
                                        <div className="mt-3 flex justify-end gap-2">
                                            <button
                                                onClick={() =>
                                                    sendConfirmation(state.pendingConfirmation!.toolCallId, false)
                                                }
                                                className="rounded-full px-3 py-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() =>
                                                    sendConfirmation(state.pendingConfirmation!.toolCallId, true)
                                                }
                                                className="rounded-full bg-brand-ink px-4 py-1.5 text-sm font-medium text-on-brand"
                                            >
                                                Confirm
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>

                        {/* Input Area */}
                        <div className="p-3 md:p-4 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 shrink-0 z-20">
                            <div className="relative max-w-3xl mx-auto w-full">
                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand transition-all">
                                    <textarea
                                        ref={inputRef}
                                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 py-1 resize-none max-h-24 text-sm"
                                        placeholder={placeholder}
                                        rows={1}
                                        value={message}
                                        disabled={state.isStreaming}
                                        onChange={(e) => setMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                submit();
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        title="Voice Input (coming soon)"
                                        disabled
                                        className="p-1.5 text-slate-300 cursor-not-allowed transition-colors rounded-full"
                                    >
                                        <span className="material-symbols-outlined text-xl">mic</span>
                                    </button>
                                    <button
                                        onClick={submit}
                                        disabled={state.isStreaming || !message.trim()}
                                        className="p-2 bg-brand-ink text-on-brand rounded-full hover:bg-brand-ink/90 transition-all flex items-center justify-center disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined icon-filled text-lg">
                                            {state.isStreaming ? 'hourglass_top' : 'send'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ============================================================
// Sub-components
// ============================================================

function AssistantAvatar() {
    return (
        <div className="size-8 md:size-10 rounded-full bg-brand-ink flex-shrink-0 flex items-center justify-center text-on-brand mt-1">
            <span className="material-symbols-outlined text-base md:text-lg icon-filled">forum</span>
        </div>
    );
}

function TypingIndicator() {
    return (
        <div className="flex gap-4 max-w-[95%] md:max-w-[85%] animate-fade-in-up">
            <AssistantAvatar />
            <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl rounded-tl-sm px-5 py-4 h-12 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400/80 rounded-full animate-bounce" style={{ animationDelay: '0ms', animationDuration: '1.4s' }} />
                <span className="w-2 h-2 bg-slate-400/80 rounded-full animate-bounce" style={{ animationDelay: '200ms', animationDuration: '1.4s' }} />
                <span className="w-2 h-2 bg-slate-400/80 rounded-full animate-bounce" style={{ animationDelay: '400ms', animationDuration: '1.4s' }} />
            </div>
        </div>
    );
}

interface EmptyStateProps {
    title: string;
    firstName: string;
    placeholder: string;
    suggestions: string[];
    onSuggestion: (s: string) => void;
    seed: SessionContextSeed | null;
}

function EmptyState({ title, firstName, placeholder, suggestions, onSuggestion, seed }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-full px-6 pt-12">
            <div className="size-14 rounded-2xl bg-brand-ink grid place-items-center text-on-brand mb-4">
                <span className="material-symbols-outlined text-2xl icon-filled">forum</span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                {title}
                {firstName ? `, ${firstName}` : ''}
            </h2>
            {seed ? (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Context:{' '}
                    {Object.entries(seed)
                        .filter(([, v]) => v)
                        .map(([k, v]) => `${k}=${String(v).slice(0, 8)}…`)
                        .join(', ')}
                </p>
            ) : (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">{placeholder}</p>
            )}
            {suggestions.length > 0 ? (
                <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-xl">
                    {suggestions.map((s) => (
                        <button
                            key={s}
                            onClick={() => onSuggestion(s)}
                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-brand hover:text-brand-ink transition-colors"
                        >
                            {s}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

interface TimelineProps {
    items: TimelineItem[];
    onFragmentAction: (id: string, actionId: string, payload?: Record<string, unknown>) => void;
    isStreaming: boolean;
}

function Timeline({ items, onFragmentAction, isStreaming }: TimelineProps) {
    // Group consecutive assistant items (text + fragments) under a single avatar.
    const blocks: { kind: 'user' | 'assistant'; items: TimelineItem[] }[] = [];
    for (const item of items) {
        const last = blocks[blocks.length - 1];
        if (item.kind === 'user_message') {
            blocks.push({ kind: 'user', items: [item] });
        } else {
            if (last && last.kind === 'assistant') last.items.push(item);
            else blocks.push({ kind: 'assistant', items: [item] });
        }
    }

    const lastBlock = blocks[blocks.length - 1];
    const showTyping =
        isStreaming &&
        (!lastBlock || lastBlock.kind === 'user' || lastBlock.items.length === 0);

    return (
        <>
            {blocks.map((b, i) =>
                b.kind === 'user' ? (
                    <UserBubble
                        key={`u-${i}`}
                        text={(b.items[0] as { text: string }).text}
                        createdAt={b.items[0].createdAt}
                    />
                ) : (
                    <AssistantBlock key={`a-${i}`} items={b.items} onFragmentAction={onFragmentAction} />
                )
            )}
            {showTyping ? <TypingIndicator /> : null}
        </>
    );
}

function UserBubble({ text, createdAt }: { text: string; createdAt: string }) {
    return (
        <div className="flex justify-end animate-fade-in-up">
            <div className="flex flex-col items-end gap-1 max-w-[85%] md:max-w-[70%]">
                <div className="bg-brand-ink text-on-brand rounded-2xl rounded-tr-sm px-5 py-3.5 shadow-md">
                    <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{text}</p>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mr-1">
                    {new Date(createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}

interface AssistantBlockProps {
    items: TimelineItem[];
    onFragmentAction: (id: string, actionId: string, payload?: Record<string, unknown>) => void;
}

function AssistantBlock({ items, onFragmentAction }: AssistantBlockProps) {
    const lastAt = items[items.length - 1]?.createdAt;
    return (
        <div className="flex gap-4 max-w-[95%] md:max-w-[85%] animate-fade-in-up">
            <AssistantAvatar />
            <div className="flex flex-col gap-2 w-full min-w-0">
                {items.map((item) => {
                    if (item.kind === 'text') {
                        return (
                            <div
                                key={item.id}
                                className="bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 rounded-2xl rounded-tl-sm px-5 py-4 text-slate-700 dark:text-slate-200"
                            >
                                <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{item.text}</p>
                            </div>
                        );
                    }
                    if (item.kind === 'fragment') {
                        return (
                            <FragmentRenderer
                                key={item.id}
                                fragment={item.component}
                                onAction={(actionId, payload) =>
                                    onFragmentAction(item.id, actionId, payload)
                                }
                            />
                        );
                    }
                    if (item.kind === 'error') {
                        return (
                            <div
                                key={item.id}
                                className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 p-3 text-xs text-red-700 dark:text-red-300"
                            >
                                [{item.code}] {item.message}
                            </div>
                        );
                    }
                    return null;
                })}
                {lastAt ? (
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-1 mt-1">
                        Keystead Assistant ·{' '}
                        {new Date(lastAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                ) : null}
            </div>
        </div>
    );
}
