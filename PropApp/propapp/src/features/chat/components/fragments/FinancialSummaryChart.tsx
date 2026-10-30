import type { FinancialSummaryChartProps } from '../../types';

interface Props {
    props: FinancialSummaryChartProps;
    onAction: (actionId: string, payload?: Record<string, unknown>) => void;
}

/**
 * Light-weight SVG sparkline implementation. Each series renders as a
 * smooth polyline normalized to the chart box. No external chart-lib
 * dependency — keeps the initial chat bundle small. A richer renderer
 * (e.g. Recharts) can swap in later behind the same Props shape.
 */
export function FinancialSummaryChart({ props }: Props) {
    const W = 320;
    const H = 80;
    const PADDING = 4;
    const allY = props.series.flatMap((s) => s.points.map((p) => p.y));
    const minY = Math.min(0, ...allY);
    const maxY = Math.max(1, ...allY);
    const range = maxY - minY || 1;

    const seriesColors = ['#0f172a', '#0ea5e9', '#10b981', '#f59e0b'];

    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <header className="flex items-baseline justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Financial summary</h3>
                <span className="text-xs text-slate-500">{props.period}</span>
            </header>
            <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 w-full" preserveAspectRatio="none">
                {props.series.map((s, i) => {
                    if (s.points.length === 0) return null;
                    const stepX = (W - PADDING * 2) / Math.max(1, s.points.length - 1);
                    const d = s.points
                        .map((p, idx) => {
                            const x = PADDING + idx * stepX;
                            const y =
                                H -
                                PADDING -
                                ((p.y - minY) / range) * (H - PADDING * 2);
                            return `${idx === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .join(' ');
                    return (
                        <path
                            key={s.label}
                            d={d}
                            fill="none"
                            stroke={seriesColors[i % seriesColors.length]}
                            strokeWidth={1.5}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    );
                })}
            </svg>
            <ul className="mt-3 grid grid-cols-2 gap-y-1 text-xs">
                {props.totals.map((t) => (
                    <li key={t.label} className="flex items-center justify-between">
                        <span className="text-slate-500">{t.label}</span>
                        <span className="font-semibold tabular-nums text-slate-900">
                            ${t.value.amount.toLocaleString()}
                        </span>
                    </li>
                ))}
            </ul>
        </article>
    );
}
