import type { ErrorCardProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

interface Props {
    props: ErrorCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function ErrorCard({ props, onAction }: Props) {
    return (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-700">{props.title}</h3>
            <p className="mt-1 text-sm text-red-900">{props.message}</p>
            {props.code ? (
                <p className="mt-1 font-mono text-[10px] text-red-500">code: {props.code}</p>
            ) : null}
            {props.retryAction ? (
                <FragmentActions actions={[props.retryAction]} onAction={onAction} />
            ) : null}
        </div>
    );
}
