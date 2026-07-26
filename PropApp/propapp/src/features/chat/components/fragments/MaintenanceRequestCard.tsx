import type { MaintenanceRequestCardProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

const PRIORITY_DOT: Record<MaintenanceRequestCardProps['priority'], string> = {
    LOW: 'bg-slate-400',
    MEDIUM: 'bg-amber-400',
    HIGH: 'bg-orange-500',
    EMERGENCY: 'bg-red-600',
};

interface Props {
    props: MaintenanceRequestCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function MaintenanceRequestCard({ props, onAction }: Props) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <header className="flex items-start gap-2">
                <span
                    className={`mt-1 inline-block h-2 w-2 rounded-full ${PRIORITY_DOT[props.priority]}`}
                    aria-hidden
                />
                <div className="flex-1">
                    <h3 className="text-sm font-semibold">{props.propertyTitle}</h3>
                    <p className="text-xs text-slate-500">
                        {props.category ?? 'Maintenance'} · {props.priority} · {props.status}
                    </p>
                </div>
                <time className="text-xs text-slate-400">
                    {new Date(props.createdAt).toLocaleDateString()}
                </time>
            </header>
            {props.description ? (
                <p className="mt-2 line-clamp-3 text-sm text-slate-700">{props.description}</p>
            ) : null}
            {props.assignedAgentName ? (
                <p className="mt-1 text-xs text-slate-500">Assigned to {props.assignedAgentName}</p>
            ) : null}
            <FragmentActions
                actions={props.actions}
                onAction={(a, payload) => onAction(a, { ...payload, requestId: props.requestId })}
            />
        </article>
    );
}
