import type { NotificationListProps } from '../../types';

interface Props {
    props: NotificationListProps;
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

export function NotificationList({ props, onAction }: Props) {
    if (props.items.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:text-slate-400">
                You’re all caught up.
            </div>
        );
    }
    return (
        <div className="rounded-2xl border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                <h3 className="text-sm font-semibold">Notifications</h3>
                {props.unreadCount > 0 ? (
                    <button
                        type="button"
                        onClick={() => onAction('mark_all_read')}
                        className="rounded-full px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900"
                    >
                        Mark all read · {props.unreadCount}
                    </button>
                ) : null}
            </header>
            <ul className="divide-y divide-slate-100">
                {props.items.map((n) => (
                    <li
                        key={n.notificationId}
                        className={`flex items-start gap-3 px-4 py-3 ${
                            n.isRead ? '' : 'bg-sky-50/40'
                        }`}
                    >
                        <span
                            className={`mt-1.5 inline-block h-2 w-2 rounded-full ${
                                n.isRead ? 'bg-slate-300' : 'bg-sky-500'
                            }`}
                            aria-hidden
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900">{n.title}</p>
                            <p className="line-clamp-2 text-xs text-slate-600">{n.body}</p>
                        </div>
                        <time className="text-xs text-slate-500 dark:text-slate-400">{timeAgo(n.createdAt)}</time>
                    </li>
                ))}
            </ul>
        </div>
    );
}
