import React from 'react';

/** Default layout: a fragment off two corners and a larger one in the middle */
export const DEFAULT_CONTOUR_FRAGMENTS = [
    '-top-36 -right-56 w-[80vw] max-w-[680px]',
    '-bottom-24 -left-48 w-[60vw] max-w-[520px] rotate-180',
    'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[860px]',
];

interface ContourMotifProps {
    /** Size and position classes for each fragment */
    fragments?: string[];
}

/**
 * ContourMotif - Faint fragments of the Keystead contour map behind a section, fading out at their edges.
 * Place it inside a `relative overflow-hidden` container and give the content above it `relative`.
 * Keep text on cards or surfaces so no contour line runs under it.
 */
const ContourMotif: React.FC<ContourMotifProps> = ({ fragments = DEFAULT_CONTOUR_FRAGMENTS }) => (
    <>
        {fragments.map((fragment) => (
            <div
                key={fragment}
                aria-hidden="true"
                className={`pointer-events-none absolute ${fragment} [mask-image:radial-gradient(closest-side,black_45%,transparent)]`}
            >
                <img src="/images/contour-map-light.svg" alt="" className="w-full opacity-60 dark:hidden" />
                <img src="/images/contour-map-dark.svg" alt="" className="hidden w-full opacity-45 dark:block" />
            </div>
        ))}
    </>
);

export default ContourMotif;
