import React from 'react';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending';

interface StatusBadgeProps {
    /** Status text to display */
    status: string;
    /** Visual variant for the badge */
    variant: BadgeVariant;
    /** Show the variant's icon before the text */
    showDot?: boolean;
    /** Additional className for customization */
    className?: string;
}

/**
 * Keystead status colours. Each variant pairs its colour with an icon, because colour
 * must never be the only signal: success = Verified (check), pending/warning = Check in
 * progress (clock), error = Issue found (!), neutral = Not yet checked (dash).
 */
const variantStyles: Record<BadgeVariant, { chip: string; icon: string }> = {
    success: { chip: 'bg-verified-bg text-verified', icon: 'check' },
    warning: { chip: 'bg-pending-bg text-pending', icon: 'schedule' },
    pending: { chip: 'bg-pending-bg text-pending', icon: 'schedule' },
    error: { chip: 'bg-alert-bg text-alert', icon: 'priority_high' },
    info: { chip: 'bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky', icon: 'info' },
    neutral: { chip: 'bg-neutral-bg text-muted-foreground', icon: 'remove' },
};

/**
 * StatusBadge - A reusable component for displaying status indicators
 * Keystead StatusChip: pill, 13px bold, icon plus words
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
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-bold ${styles.chip} ${className}`}
        >
            {showDot && (
                <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden="true">
                    {styles.icon}
                </span>
            )}
            {status}
        </span>
    );
};

export default StatusBadge;
