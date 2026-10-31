import React from 'react';

/**
 * A fragment of the contour map: where it sits, and optionally which part of the map it shows.
 * `zoom` centres the fragment on a point of the map (x and y as fractions of its width and height)
 * and enlarges the map by `scale`. The map is laid out larger rather than CSS-scaled, so its
 * hairline strokes stay hairline.
 */
export type ContourFragment = string | { className: string; zoom: { x: number; y: number; scale: number } };

/** Default layout: a fragment off two corners and a larger one in the middle */
export const DEFAULT_CONTOUR_FRAGMENTS: ContourFragment[] = [
    '-top-36 -right-56 w-[80vw] max-w-[680px]',
    '-bottom-24 -left-48 w-[60vw] max-w-[520px] rotate-180',
    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[860px]',
];

/**
 * Public profile pages. The left column is short, leaving a large empty area beneath it, so the main
 * fragment is big and centred on that area, reaching under the right-column cards; corners off the right.
 */
export const PROFILE_CONTOUR_FRAGMENTS: ContourFragment[] = [
    '-top-28 -right-48 w-[70vw] max-w-[620px]',
    'top-[64%] left-[28%] -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[940px] rotate-180',
    '-bottom-36 -right-24 w-[70vw] max-w-[680px]',
];

/** Points of interest on the map, for zoomed fragments */
export const CONTOUR_PEAKS = {
    /** The 412 peak: tight concentric rings, part-circled in blue */
    north: { x: 0.275, y: 0.45 },
    /** The 388 hill inside the blue contour */
    east: { x: 0.68, y: 0.58 },
    /** The small 240 hill near the top edge */
    ridge: { x: 0.9, y: 0.27 },
};

interface ContourMotifProps {
    /** Size and position of each fragment */
    fragments?: ContourFragment[];
    /** Clip the fragments to the nearest positioned parent, for containers that are not overflow-hidden */
    contained?: boolean;
}

function MapImages({ style }: { style?: React.CSSProperties }) {
    const position = style ? 'absolute max-w-none' : 'w-full';
    return (
        <>
            <img src="/images/contour-map-light.svg" alt="" style={style} className={`${position} opacity-60 dark:hidden`} />
            <img src="/images/contour-map-dark.svg" alt="" style={style} className={`${position} hidden opacity-45 dark:block`} />
        </>
    );
}

/**
 * ContourMotif - Faint fragments of the Keystead contour map behind a section, fading out at their edges.
 * Place it inside a `relative overflow-hidden` container (or pass `contained` inside any `relative` one)
 * and give the content above it `relative`. Keep text on cards or surfaces so no contour line runs under it.
 */
const ContourMotif: React.FC<ContourMotifProps> = ({ fragments = DEFAULT_CONTOUR_FRAGMENTS, contained = false }) => {
    const motif = (
    <>
        {fragments.map((fragment) => {
            const mask = '[mask-image:radial-gradient(closest-side,black_45%,transparent)]';
            if (typeof fragment === 'string') {
                return (
                    <div key={fragment} aria-hidden="true" className={`pointer-events-none absolute ${fragment} ${mask}`}>
                        <MapImages />
                    </div>
                );
            }
            const { x, y, scale } = fragment.zoom;
            // Lay the map out `scale` times larger, offset so the chosen point sits in the fragment's centre
            const style = {
                width: `${scale * 100}%`,
                left: `${(0.5 - scale * x) * 100}%`,
                top: `${(0.5 - scale * y) * 100}%`,
            };
            return (
                <div
                    key={fragment.className}
                    aria-hidden="true"
                    className={`pointer-events-none absolute aspect-[1200/420] overflow-hidden ${fragment.className} ${mask}`}
                >
                    <MapImages style={style} />
                </div>
            );
        })}
    </>
    );
    return contained ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            {motif}
        </div>
    ) : motif;
};

export default ContourMotif;
