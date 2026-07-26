import type { ApplicationStatusCardProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

const STATUS_COLOR: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800',
    UNDER_REVIEW: 'bg-sky-100 text-sky-800',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    WITHDRAWN: 'bg-slate-100 text-slate-500',
    LEASE_OFFERED: 'bg-violet-100 text-violet-700',
};

interface Props {
    props: ApplicationStatusCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function ApplicationStatusCard({ props, onAction }: Props) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <header className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="truncate text-sm font-semibold text-slate-900">
                        {props.propertyTitle}
                    </h3>
                    <p className="text-xs text-slate-500">
                        Submitted {new Date(props.submittedAt).toLocaleDateString()}
                        {props.landlordName ? ` · ${props.landlordName}` : ''}
                    </p>
                </div>
                <span
                    className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLOR[props.status] ?? 'bg-slate-100 text-slate-700'
                    }`}
                >
                    {props.status.replace(/_/g, ' ')}
                </span>
            </header>
            <FragmentActions
                actions={props.actions}
                onAction={(id, p) => onAction(id, { ...p, applicationId: props.applicationId })}
            />
        </article>
    );
}
