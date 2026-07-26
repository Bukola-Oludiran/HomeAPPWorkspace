import type { PaymentReceiptCardProps } from '../../types';

interface Props {
    props: PaymentReceiptCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function PaymentReceiptCard({ props }: Props) {
    return (
        <article className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4">
            <header className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-emerald-600 text-xs text-white">
                    ✓
                </span>
                <h3 className="text-sm font-semibold text-emerald-800">Payment confirmed</h3>
            </header>
            <p className="mt-3 text-2xl font-bold tabular-nums text-slate-900">
                ${props.amount.amount.toLocaleString()}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-y-1 text-sm">
                <dt className="text-slate-500">For</dt>
                <dd className="text-right text-slate-900">{props.purpose}</dd>
                <dt className="text-slate-500">To</dt>
                <dd className="truncate text-right text-slate-900">{props.recipientName}</dd>
                <dt className="text-slate-500">Paid</dt>
                <dd className="text-right text-slate-900">
                    {new Date(props.paidAt).toLocaleString()}
                </dd>
                <dt className="text-slate-500">Ref</dt>
                <dd className="truncate text-right font-mono text-xs text-slate-700">
                    {props.reference}
                </dd>
            </dl>
        </article>
    );
}
