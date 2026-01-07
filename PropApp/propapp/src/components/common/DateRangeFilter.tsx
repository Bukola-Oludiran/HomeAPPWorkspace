import React from 'react';

interface DateRangeFilterProps {
    /** Start date value */
    startDate?: string;
    /** End date value */
    endDate?: string;
    /** Change handler for start date */
    onStartDateChange?: (value: string) => void;
    /** Change handler for end date */
    onEndDateChange?: (value: string) => void;
    /** Optional label */
    label?: string;
    /** Additional className for customization */
    className?: string;
}

/**
 * DateRangeFilter - A reusable date range picker component
 * Provides consistent styling with dark mode support for transaction filters
 */
const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    label = 'Date Range',
    className = '',
}) => {
    const inputClasses = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/50 focus:border-[#137fec]';

    return (
        <div className={className}>
            {label && (
                <label className="block text-xs font-medium text-slate-500 mb-1">{label}</label>
            )}
            <div className="flex items-center gap-2">
                <input
                    type="date"
                    className={inputClasses}
                    value={startDate}
                    onChange={(e) => onStartDateChange?.(e.target.value)}
                />
                <span className="text-slate-400">-</span>
                <input
                    type="date"
                    className={inputClasses}
                    value={endDate}
                    onChange={(e) => onEndDateChange?.(e.target.value)}
                />
            </div>
        </div>
    );
};

export default DateRangeFilter;
