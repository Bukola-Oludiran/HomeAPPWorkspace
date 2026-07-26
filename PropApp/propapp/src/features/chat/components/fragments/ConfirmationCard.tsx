import type { ConfirmationCardProps } from '../../types';

const RISK_BORDER: Record<ConfirmationCardProps['riskLevel'], string> = {
    low: 'border-slate-300',
    medium: 'border-amber-400',
    high: 'border-red-500',
};

interface Props {
    props: ConfirmationCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function ConfirmationCard({ props, onAction }: Props) {
    return (
        <div
            className={`rounded-2xl border-2 ${RISK_BORDER[props.riskLevel]} bg-white p-4 shadow-sm`}
        >
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                {props.title}
            </h3>
            <p className="mt-2 text-sm text-slate-900">{props.humanSummary}</p>
            <div className="mt-4 flex justify-end gap-2">
                <button
                    type="button"
                    onClick={() => onAction(props.cancelAction.id)}
                    className="rounded-full px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900"
                >
                    {props.cancelAction.label}
                </button>
                <button
                    type="button"
                    onClick={() => onAction(props.confirmAction.id)}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                        props.riskLevel === 'high'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                >
                    {props.confirmAction.label}
                </button>
            </div>
        </div>
    );
}
