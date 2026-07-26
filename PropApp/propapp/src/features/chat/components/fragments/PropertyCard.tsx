import type { PropertyCardProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

interface Props {
    props: PropertyCardProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

export function PropertyCard({ props, onAction }: Props) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {props.heroImageUrl ? (
                <img
                    src={props.heroImageUrl}
                    alt={props.title}
                    className="mb-3 h-40 w-full rounded-xl object-cover"
                    loading="lazy"
                />
            ) : null}
            <header className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-base font-semibold">{props.title}</h3>
                    <p className="text-xs text-slate-500">
                        {props.city}
                        {props.area ? ` · ${props.area}` : ''} · {props.propertyType}
                    </p>
                </div>
                {props.verificationTier && props.verificationTier !== 'UNVERIFIED' ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {props.verificationTier}
                    </span>
                ) : null}
            </header>
            <div className="mt-2 flex items-baseline gap-3">
                <span className="text-lg font-bold text-slate-900">
                    ${props.price.amount.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">
                    {props.bedrooms ?? '—'} bed · {props.bathrooms ?? '—'} bath · {props.listingType}
                </span>
            </div>
            <FragmentActions
                actions={props.actions}
                onAction={(a, payload) => onAction(a, { ...payload, propertyId: props.propertyId })}
            />
        </article>
    );
}
