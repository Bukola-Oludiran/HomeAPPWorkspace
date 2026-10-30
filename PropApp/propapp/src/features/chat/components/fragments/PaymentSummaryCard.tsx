import type { PaymentSummaryCardProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

interface Props {
    props: PaymentSummaryCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function PaymentSummaryCard({ props, onAction }: Props) {
    return (
        <article className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                Payment summary
            </h3>
            <p className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                ${props.amount.amount.toLocaleString()}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-slate-500 dark:text-slate-400">For</dt>
                <dd className="text-right text-slate-900">{props.purpose}</dd>
                <dt className="text-slate-500 dark:text-slate-400">To</dt>
                <dd className="truncate text-right text-slate-900">{props.recipientName}</dd>
                {props.dueDate ? (
                    <>
                        <dt className="text-slate-500 dark:text-slate-400">Due</dt>
                        <dd className="text-right text-slate-900">
                            {new Date(props.dueDate).toLocaleDateString()}
                        </dd>
                    </>
                ) : null}
            </dl>
            <FragmentActions actions={props.actions} onAction={onAction} />
        </article>
    );
}
