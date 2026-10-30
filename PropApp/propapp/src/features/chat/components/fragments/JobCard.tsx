import type { JobCardProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

const STATUS_COLOR: Record<string, string> = {
    OPEN: 'bg-emerald-100 text-emerald-700',
    ACCEPTED: 'bg-sky-100 text-sky-700',
    IN_PROGRESS: 'bg-amber-100 text-amber-800',
    COMPLETED: 'bg-slate-200 text-slate-600',
    CANCELLED: 'bg-red-100 text-red-700',
};

interface Props {
    props: JobCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function JobCard({ props, onAction }: Props) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">
                        {props.jobType.replace(/_/g, ' ')}
                    </h3>
                    {props.propertyTitle ? (
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{props.propertyTitle}</p>
                    ) : null}
                </div>
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLOR[props.status] ?? 'bg-slate-100 text-slate-700'
                    }`}
                >
                    {props.status}
                </span>
            </header>
            <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
                {props.scheduledAt ? (
                    <>
                        <dt className="text-slate-500 dark:text-slate-400">Scheduled</dt>
                        <dd className="text-right">
                            {new Date(props.scheduledAt).toLocaleString()}
                        </dd>
                    </>
                ) : null}
                {props.payout ? (
                    <>
                        <dt className="text-slate-500 dark:text-slate-400">Payout</dt>
                        <dd className="text-right font-semibold tabular-nums">
                            ${props.payout.amount.toLocaleString()}
                        </dd>
                    </>
                ) : null}
            </dl>
            <FragmentActions
                actions={props.actions}
                onAction={(id, p) => onAction(id, { ...p, jobId: props.jobId })}
            />
        </article>
    );
}
