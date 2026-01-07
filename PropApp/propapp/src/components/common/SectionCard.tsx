import React from 'react';

interface SectionCardProps {
    children: React.ReactNode;
    /** Padding options for the card content */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Optional header with title and action */
    header?: {
        title: string;
        action?: React.ReactNode;
    };
    /** Additional className for customization */
    className?: string;
}

const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

/**
 * SectionCard - A reusable card component for content sections
 * Provides consistent styling with dark mode support
 */
const SectionCard: React.FC<SectionCardProps> = ({
    children,
    padding = 'md',
    header,
    className = '',
}) => {
    return (
        <div
            className={`bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm ${padding === 'none' ? 'overflow-hidden' : paddingClasses[padding]} ${className}`}
        >
            {header && (
                <div className={`flex items-center justify-between ${padding === 'none' ? 'p-6 pb-4' : 'mb-4'}`}>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {header.title}
                    </h3>
                    {header.action && (
                        <div className="flex items-center gap-2">
                            {header.action}
                        </div>
                    )}
                </div>
            )}
            {children}
        </div>
    );
};

export default SectionCard;
