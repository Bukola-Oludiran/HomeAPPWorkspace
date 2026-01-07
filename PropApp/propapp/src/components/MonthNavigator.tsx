interface MonthNavigatorProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
    showYear?: boolean;
    variant?: 'default' | 'compact' | 'minimal';
}

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export default function MonthNavigator({
    currentDate,
    onDateChange,
    minDate,
    maxDate,
    showYear = true,
    variant = 'default',
}: MonthNavigatorProps) {
    const goToPreviousMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() - 1);

        if (minDate && newDate < minDate) return;
        onDateChange(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + 1);

        if (maxDate && newDate > maxDate) return;
        onDateChange(newDate);
    };

    const goToToday = () => {
        onDateChange(new Date());
    };

    const isPrevDisabled = minDate && new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1) < minDate;
    const isNextDisabled = maxDate && new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1) > maxDate;

    const monthName = variant === 'minimal'
        ? shortMonthNames[currentDate.getMonth()]
        : monthNames[currentDate.getMonth()];

    if (variant === 'minimal') {
        return (
            <div className="flex items-center gap-1">
                <button
                    onClick={goToPreviousMonth}
                    disabled={isPrevDisabled}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[80px] text-center">
                    {monthName} {showYear && currentDate.getFullYear()}
                </span>

                <button
                    onClick={goToNextMonth}
                    disabled={isNextDisabled}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
            </div>
        );
    }

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <button
                    onClick={goToPreviousMonth}
                    disabled={isPrevDisabled}
                    className="size-7 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>

                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[100px] text-center">
                    {monthName} {showYear && currentDate.getFullYear()}
                </span>

                <button
                    onClick={goToNextMonth}
                    disabled={isNextDisabled}
                    className="size-7 rounded-full flex items-center justify-center hover:bg-white dark:hover:bg-slate-700 text-slate-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <button
                    onClick={goToPreviousMonth}
                    disabled={isPrevDisabled}
                    className="size-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined">chevron_left</span>
                </button>

                <button
                    onClick={goToNextMonth}
                    disabled={isNextDisabled}
                    className="size-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    <span className="material-symbols-outlined">chevron_right</span>
                </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {monthName} {showYear && currentDate.getFullYear()}
            </h3>

            <button
                onClick={goToToday}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#137fec] bg-[#137fec]/10 hover:bg-[#137fec]/20 transition-colors"
            >
                Today
            </button>
        </div>
    );
}
