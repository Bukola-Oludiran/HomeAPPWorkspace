import type { PropertyComparisonProps } from '../../types';
import { FragmentActions } from './_FragmentActions';

interface Props {
    props: PropertyComparisonProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

/**
 * Side-by-side comparison table — strongest when 2-4 properties are
 * available. Renders as horizontally-scrolling cards on mobile and a
 * grid on wider viewports.
 */
export function PropertyComparison({ props, onAction }: Props) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div
                className="grid gap-3"
                style={{ gridTemplateColumns: `repeat(${props.items.length}, minmax(220px, 1fr))` }}
            >
                {props.items.map((p) => (
                    <article
                        key={p.propertyId}
                        className="flex flex-col rounded-xl border border-slate-100 bg-slate-50 p-3"
                    >
                        {p.heroImageUrl ? (
                            <img
                                src={p.heroImageUrl}
                                alt={p.title}
                                className="mb-2 h-24 w-full rounded-lg object-cover"
                                loading="lazy"
                            />
                        ) : null}
                        <h3 className="truncate text-sm font-semibold">{p.title}</h3>
                        <p className="text-xs text-slate-500">{p.city}</p>
                        <dl className="mt-2 grid grid-cols-2 gap-y-0.5 text-xs">
                            <dt className="text-slate-500">Price</dt>
                            <dd className="text-right font-semibold tabular-nums">
                                ${p.price.amount.toLocaleString()}
                            </dd>
                            <dt className="text-slate-500">Beds</dt>
                            <dd className="text-right">{p.bedrooms ?? '—'}</dd>
                            <dt className="text-slate-500">Baths</dt>
                            <dd className="text-right">{p.bathrooms ?? '—'}</dd>
                            <dt className="text-slate-500">Type</dt>
                            <dd className="text-right">{p.propertyType}</dd>
                        </dl>
                        <div className="mt-auto pt-2">
                            <FragmentActions
                                actions={p.actions}
                                onAction={(id, payload) =>
                                    onAction(id, { ...payload, propertyId: p.propertyId })
                                }
                            />
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}
