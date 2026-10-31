import type { ReactNode } from 'react';
import ContourMotif, { type ContourFragment } from './ContourMotif';

interface PageContainerProps {
    children: ReactNode;
    /** Maximum width of the content area */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    /** Remove bottom padding (useful for pages with fixed footers) */
    noPaddingBottom?: boolean;
    /** Custom className for additional styling */
    className?: string;
    /** Contour-map fragments behind the page; positioned within the full-width container */
    motif?: ContourFragment[];
}

const maxWidthClasses = {
    sm: 'max-w-[800px]',
    md: 'max-w-[1000px]',
    lg: 'max-w-[1200px]',
    xl: 'max-w-[1400px]',
    '2xl': 'max-w-[1600px]',
    full: 'max-w-full',
};

/**
 * PageContainer - Standard page wrapper component
 * 
 * Provides consistent page layout with:
 * - Responsive horizontal padding
 * - Vertical padding with optional bottom padding
 * - Centered content with configurable max-width
 * 
 * @example
 * <PageContainer maxWidth="xl">
 *   <PageHeader title="Dashboard" />
 *   {content}
 * </PageContainer>
 */
export default function PageContainer({
    children,
    maxWidth = 'xl',
    noPaddingBottom = false,
    className = '',
    motif,
}: PageContainerProps) {
    return (
        <div
            className={`relative flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20 ${noPaddingBottom ? '' : 'pb-32'
                } ${motif ? 'min-h-[calc(100vh-6rem)]' : ''} ${className}`}
        >
            {/* The motif area reaches up behind the floating navigation (the layout's 6rem top padding) so corner
                fragments meet the page edge instead of stopping in a straight line */}
            {motif && (
                <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 bottom-0 overflow-hidden">
                    <ContourMotif fragments={motif} />
                </div>
            )}
            <div className={`relative ${maxWidthClasses[maxWidth]} w-full mx-auto`}>
                {children}
            </div>
        </div>
    );
}
