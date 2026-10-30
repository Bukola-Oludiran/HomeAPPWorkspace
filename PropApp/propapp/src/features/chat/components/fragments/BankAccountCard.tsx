import type { BankAccountCardProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

interface Props {
    props: BankAccountCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function BankAccountCard({ props, onAction }: Props) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <header className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{props.bankName}</h3>
                    <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                        {props.maskedAccountNumber}
                    </p>
                </div>
                {props.isDefault ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        Default
                    </span>
                ) : null}
            </header>
            <p className="mt-2 text-sm text-slate-700">{props.accountName}</p>
            <FragmentActions
                actions={props.actions}
                onAction={(id, p) => onAction(id, { ...p, accountId: props.accountId })}
            />
        </article>
    );
}
