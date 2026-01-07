import * as React from "react"
import { cn } from "@/lib/utils"
import type { VerificationTier } from "@/types"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | VerificationTier
}

const badgeVariants = {
    default: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    error: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    // Verification tiers
    bronze: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    silver: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    gold: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-300',
    platinum: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300',
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {
        return (
            <span
                className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide",
                    badgeVariants[variant],
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </span>
        )
    }
)
Badge.displayName = "Badge"

// Verification badge with icon
interface VerificationBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    tier: VerificationTier
    showLabel?: boolean
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
    tier,
    showLabel = true,
    className,
    ...props
}) => {
    const tierLabels = {
        bronze: 'Bronze',
        silver: 'Silver',
        gold: 'Gold Verified',
        platinum: 'Platinum Verified',
    }

    return (
        <div
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold",
                "bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border border-slate-100 dark:border-slate-800",
                className
            )}
            {...props}
        >
            <span className="material-symbols-outlined text-[16px] icon-filled text-primary">
                verified
            </span>
            {showLabel && <span className="text-primary">{tierLabels[tier]}</span>}
        </div>
    )
}

export { Badge, VerificationBadge }
