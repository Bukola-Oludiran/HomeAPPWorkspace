import type { QuickActionGroupProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

interface Props {
    props: QuickActionGroupProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function QuickActionGroup({ props, onAction }: Props) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-sm text-slate-700">{props.prompt}</p>
            <FragmentActions actions={props.actions} onAction={onAction} />
        </div>
    );
}
