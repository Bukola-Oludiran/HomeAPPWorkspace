import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending';

interface StatusBadgeProps {
    /** Status text to display */
    status: string;
    /** Visual variant for the badge */
    variant: BadgeVariant;
    /** Show a colored dot indicator */
    showDot?: boolean;
    /** Additional className for customization */
    className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string; border: string }> = {
    success: {
        bg: 'bg-green-50 dark:bg-green-900/20',
        text: 'text-green-600 dark:text-green-400',
        dot: 'bg-green-500',
        border: 'border-green-200 dark:border-green-800/30',
    },
    warning: {
        bg: 'bg-orange-50 dark:bg-orange-900/20',
        text: 'text-orange-600 dark:text-orange-400',
        dot: 'bg-orange-500',
        border: 'border-orange-200 dark:border-orange-800/30',
    },
    error: {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-600 dark:text-red-400',
        dot: 'bg-red-500',
        border: 'border-red-200 dark:border-red-800/30',
    },
    info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-600 dark:text-blue-400',
        dot: 'bg-blue-500',
        border: 'border-blue-200 dark:border-blue-800/30',
    },
    neutral: {
        bg: 'bg-slate-50 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        dot: 'bg-slate-400',
        border: 'border-slate-200 dark:border-slate-700',
    },
    pending: {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-600 dark:text-purple-400',
        dot: 'bg-purple-500',
        border: 'border-purple-200 dark:border-purple-800/30',
    },
};

/**
 * StatusBadge - A reusable component for displaying status indicators
 * Provides consistent styling with colored dot and dark mode support
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
    status,
    variant,
    showDot = true,
    className = '',
}) => {
    const styles = variantStyles[variant];

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles.bg} ${styles.text} ${styles.border} ${className}`}
        >
            {showDot && <span className={`size-1.5 rounded-full ${styles.dot}`}></span>}
            {status}
        </span>
    );
};

export default StatusBadge;
