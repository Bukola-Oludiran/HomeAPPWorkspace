import type { VerificationStatusCardProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

const TIER_COLOR: Record<string, string> = {
    UNVERIFIED: 'bg-slate-200 text-slate-600',
    BRONZE: 'bg-amber-100 text-amber-800',
    SILVER: 'bg-slate-100 text-slate-700',
    GOLD: 'bg-yellow-100 text-yellow-800',
    PLATINUM: 'bg-violet-100 text-violet-800',
};

interface Props {
    props: VerificationStatusCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function VerificationStatusCard({ props, onAction }: Props) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <header className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Verification</h3>
                <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        TIER_COLOR[props.tier] ?? 'bg-slate-100 text-slate-700'
                    }`}
                >
                    {props.tier}
                </span>
            </header>
            {props.stepsComplete.length > 0 ? (
                <div className="mt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Completed
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-slate-700">
                        {props.stepsComplete.map((s) => (
                            <li key={s} className="flex items-center gap-2">
                                <span className="text-emerald-600">✓</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
            {props.stepsPending.length > 0 ? (
                <div className="mt-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                        Outstanding
                    </p>
                    <ul className="mt-1 space-y-1 text-sm text-slate-700">
                        {props.stepsPending.map((s) => (
                            <li key={s} className="flex items-center gap-2">
                                <span className="text-amber-500">○</span>
                                {s}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}
            <FragmentActions actions={props.actions} onAction={onAction} />
        </article>
    );
}
