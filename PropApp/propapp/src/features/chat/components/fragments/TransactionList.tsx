import type { TransactionListProps } from '../../types';

const STATUS_COLOR: Record<string, string> = {
    PENDING: 'text-amber-600',
    COMPLETED: 'text-emerald-700',
    FAILED: 'text-red-600',
    REFUNDED: 'text-slate-500 dark:text-slate-400',
    CANCELLED: 'text-slate-500 dark:text-slate-400',
};

interface Props {
    props: TransactionListProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function TransactionList({ props }: Props) {
    if (props.items.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:text-slate-400">
                No transactions yet.
            </div>
        );
    }
    return (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
            {props.items.map((t) => (
                <li key={t.transactionId} className="flex items-center gap-3 px-4 py-3">
                    <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                            {t.kind}
                            {t.counterpartyName ? (
                                <span className="text-slate-500 dark:text-slate-400"> · {t.counterpartyName}</span>
                            ) : null}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(t.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold tabular-nums">
                            ${t.amount.amount.toLocaleString()}
                        </p>
                        <p
                            className={`text-xs ${
                                STATUS_COLOR[t.status] ?? 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            {t.status}
                        </p>
                    </div>
                </li>
            ))}
            {typeof props.total === 'number' && props.total > props.items.length ? (
                <li className="px-4 py-2 text-center text-xs text-slate-500 dark:text-slate-400">
                    Showing {props.items.length} of {props.total}.
                </li>
            ) : null}
        </ul>
    );
}
