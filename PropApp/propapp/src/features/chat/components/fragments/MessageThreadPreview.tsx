import type { MessageThreadPreviewProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

interface Props {
    props: MessageThreadPreviewProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return 'now';
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
}

export function MessageThreadPreview({ props, onAction }: Props) {
    return (
        <article className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                {props.counterpartyName.slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <header className="flex items-baseline justify-between gap-2">
                    <h3 className="truncate text-sm font-semibold">{props.counterpartyName}</h3>
                    <time className="text-xs text-slate-400">{timeAgo(props.lastMessageAt)}</time>
                </header>
                <p className="line-clamp-1 text-sm text-slate-600">{props.lastMessage}</p>
                {props.unreadCount > 0 ? (
                    <span className="mt-1 inline-block rounded-full bg-slate-900 px-2 py-0.5 text-xs font-medium text-white">
                        {props.unreadCount} unread
                    </span>
                ) : null}
                <FragmentActions
                    actions={props.actions}
                    onAction={(id, p) =>
                        onAction(id, { ...p, conversationId: props.conversationId })
                    }
                />
            </div>
        </article>
    );
}
