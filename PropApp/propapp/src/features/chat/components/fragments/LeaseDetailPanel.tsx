import type { LeaseDetailPanelProps } from '../../types';
import { FragmentActions } from './_FragmentActions';
import { formatCurrency, yearlyRent } from '@/lib/format';

const STATUS_COLOR: Record<string, string> = {
    DRAFT: 'bg-slate-200 text-slate-700',
    PENDING_SIGNATURES: 'bg-amber-100 text-amber-800',
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    RENEWED: 'bg-sky-100 text-sky-700',
    EXPIRED: 'bg-slate-200 text-slate-500 dark:text-slate-400',
    TERMINATED: 'bg-red-100 text-red-700',
};

interface Props {
    props: LeaseDetailPanelProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function LeaseDetailPanel({ props, onAction }: Props) {
    const fmtDate = (iso?: string) =>
        iso ? new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' }) : '—';
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <header className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold">{props.propertyTitle}</h3>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        lease · {props.leaseId.slice(0, 8)}…
                    </p>
                </div>
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLOR[props.status] ?? 'bg-slate-100 text-slate-700'
                    }`}
                >
                    {props.status}
                </span>
            </header>
            <dl className="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                {props.monthlyRent ? (
                    <>
                        <dt className="text-slate-500 dark:text-slate-400">Rent per year</dt>
                        <dd className="text-right font-semibold">
                            {formatCurrency(yearlyRent(props.monthlyRent.amount), props.monthlyRent.currency)}
                        </dd>
                    </>
                ) : null}
                <dt className="text-slate-500 dark:text-slate-400">Start</dt>
                <dd className="text-right">{fmtDate(props.startDate)}</dd>
                <dt className="text-slate-500 dark:text-slate-400">End</dt>
                <dd className="text-right">{fmtDate(props.endDate)}</dd>
                {props.nextPaymentDue ? (
                    <>
                        <dt className="text-slate-500 dark:text-slate-400">Next payment</dt>
                        <dd className="text-right">{fmtDate(props.nextPaymentDue)}</dd>
                    </>
                ) : null}
            </dl>
            <FragmentActions
                actions={props.actions}
                onAction={(id, payload) => onAction(id, { ...payload, leaseId: props.leaseId })}
            />
        </article>
    );
}
