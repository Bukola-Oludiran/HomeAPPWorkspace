import type { ReactNode } from 'react';

interface PageContainerProps {
    children: ReactNode;
    /** Maximum width of the content area */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
    /** Remove bottom padding (useful for pages with fixed footers) */
    noPaddingBottom?: boolean;
    /** Custom className for additional styling */
    className?: string;
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
}: PageContainerProps) {
    return (
        <div
            className={`flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20 ${noPaddingBottom ? '' : 'pb-32'
                } ${className}`}
        >
            <div className={`${maxWidthClasses[maxWidth]} w-full mx-auto`}>
                {children}
            </div>
        </div>
    );
}
