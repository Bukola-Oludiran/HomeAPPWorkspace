import type { PropertyGridProps } from '../../types';
import { PropertyCard } from './PropertyCard';

interface Props {
    props: PropertyGridProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function PropertyGrid({ props, onAction }: Props) {
    if (props.items.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                {props.note ?? 'No properties.'}
            </div>
        );
    }
    return (
        <div className="grid gap-3 sm:grid-cols-2">
            {props.items.map((p) => (
                <PropertyCard key={p.propertyId} props={p} onAction={onAction} />
            ))}
            {typeof props.total === 'number' && props.total > props.items.length ? (
                <p className="col-span-full text-center text-xs text-slate-500">
                    Showing {props.items.length} of {props.total}.
                </p>
            ) : null}
        </div>
    );
}
