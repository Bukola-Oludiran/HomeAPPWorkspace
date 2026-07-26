import type { FragmentAction } from '../../types';

const KIND_CLASS: Record<FragmentAction['kind'], string> = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    subtle: 'text-slate-500 hover:text-slate-900',
};

interface Props {
    actions: FragmentAction[];
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function FragmentActions({ actions, onAction }: Props) {
    if (!actions.length) return null;
    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {actions.map((a) => (
                <button
                    key={a.id}
                    type="button"
                    onClick={() => onAction(a.id, a.payload)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${KIND_CLASS[a.kind]}`}
                >
                    {a.label}
                </button>
            ))}
        </div>
    );
}
