import React from 'react';
import { Counter } from '../animation';

interface StatsCardProps {
    /** Material icon name */
    icon: string;
    /** Icon color theme */
    iconColor: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'emerald' | 'amber' | 'indigo';
    /** Label text above the value */
    label: string;
    /** Main value to display */
    value: string | number;
    /** Optional change indicator (e.g., "+12.5%") */
    change?: {
        value: string;
        isPositive: boolean;
    };
    /** Optional badge text (e.g., "4 Units Vacant") */
    badge?: {
        text: string;
        variant?: 'default' | 'success' | 'warning';
    };
    /** Optional subtext below the value (e.g., "Due: Jan 15, 2024") */
    subtext?: string;
    /** Enable rolling counter animation for numeric values */
    animateValue?: boolean;
    /** Numeric value for animation (parsed from value if not provided) */
    numericValue?: number;
    /** Prefix for animated counter (e.g., "₦", "$") */
    valuePrefix?: string;
    /** Suffix for animated counter (e.g., "/mo") */
    valueSuffix?: string;
    /** Animation delay in seconds */
    animationDelay?: number;
    /** Additional className for customization */
    className?: string;
}

const iconColorStyles = {
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
};

const badgeVariantStyles = {
    default: 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800',
    success: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    warning: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
};

/**
 * StatsCard - A reusable component for displaying statistics with icons
 * Provides consistent styling with dark mode support
 * Supports optional rolling counter animation for numeric values
 */
const StatsCard: React.FC<StatsCardProps> = ({
    icon,
    iconColor,
    label,
    value,
    change,
    badge,
    subtext,
    animateValue = false,
    numericValue,
    valuePrefix = '',
    valueSuffix = '',
    animationDelay = 0,
    className = '',
}) => {
    // Parse numeric value from string if not explicitly provided
    const getNumericValue = (): number => {
        if (numericValue !== undefined) return numericValue;
        if (typeof value === 'number') return value;
        // Extract numbers from string (e.g., "₦2,500,000" -> 2500000)
        const parsed = parseFloat(String(value).replace(/[^0-9.-]/g, ''));
        return isNaN(parsed) ? 0 : parsed;
    };

    const renderValue = () => {
        if (animateValue && typeof value !== 'string') {
            return (
                <Counter
                    end={getNumericValue()}
                    prefix={valuePrefix}
                    suffix={valueSuffix}
                    delay={animationDelay}
                    duration={1.5}
                />
            );
        }
        if (animateValue && typeof value === 'string') {
            // For string values with currency/formatting, use Counter
            return (
                <Counter
                    end={getNumericValue()}
                    prefix={valuePrefix}
                    suffix={valueSuffix}
                    delay={animationDelay}
                    duration={1.5}
                />
            );
        }
        return value;
    };

    return (
        <div
            className={`bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between ${className}`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${iconColorStyles[iconColor]}`}>
                    <span className="material-symbols-outlined">{icon}</span>
                </div>
                {change && (
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${change.isPositive
                        ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                        : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                        }`}>
                        <span className="material-symbols-outlined text-[14px] mr-0.5">
                            {change.isPositive ? 'trending_up' : 'trending_down'}
                        </span>
                        {change.value}
                    </span>
                )}
                {badge && !change && (
                    <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-md ${badgeVariantStyles[badge.variant || 'default']}`}>
                        {badge.text}
                    </span>
                )}
            </div>
            <div>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{renderValue()}</h3>
                {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
            </div>
        </div>
    );
};

export default StatsCard;

