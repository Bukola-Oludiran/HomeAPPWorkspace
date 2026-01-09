import React from 'react';

interface TransactionColumn<T> {
    /** Column header label */
    header: string;
    /** Key to access data or custom render function */
    accessor?: keyof T;
    /** Custom render function for the cell */
    render?: (row: T) => React.ReactNode;
    /** Text alignment */
    align?: 'left' | 'center' | 'right';
    /** Column width class (optional) */
    className?: string;
}

interface TransactionTableProps<T> {
    /** Array of data to display */
    data: T[];
    /** Column definitions */
    columns: TransactionColumn<T>[];
    /** Unique key accessor for each row */
    keyAccessor: keyof T;
    /** Pagination info text (e.g., "Showing 6 of 48 transactions") */
    paginationInfo?: string;
    /** Has previous page */
    hasPrevious?: boolean;
    /** Has next page */
    hasNext?: boolean;
    /** Previous page handler */
    onPrevious?: () => void;
    /** Next page handler */
    onNext?: () => void;
    /** Additional className for customization */
    className?: string;
}

/**
 * TransactionTable - A reusable data table component for transactions
 * Supports configurable columns, custom cell rendering, and pagination
 */
function TransactionTable<T extends Record<string, unknown>>({
    data,
    columns,
    keyAccessor,
    paginationInfo,
    hasPrevious = false,
    hasNext = false,
    onPrevious,
    onNext,
    className = '',
}: TransactionTableProps<T>) {
    const getAlignment = (align?: 'left' | 'center' | 'right') => {
        switch (align) {
            case 'center': return 'text-center';
            case 'right': return 'text-right';
            default: return 'text-left';
        }
    };

    return (
        <div className={className}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={`px-6 py-4 ${getAlignment(col.align)} ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.map((row) => (
                            <tr
                                key={String(row[keyAccessor])}
                                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group"
                            >
                                {columns.map((col, idx) => (
                                    <td
                                        key={idx}
                                        className={`px-6 py-4 ${getAlignment(col.align)} ${col.className || ''}`}
                                    >
                                        {col.render
                                            ? col.render(row)
                                            : col.accessor
                                                ? String(row[col.accessor] ?? '')
                                                : null
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {(paginationInfo || onPrevious || onNext) && (
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between">
                    {paginationInfo && (
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            {paginationInfo}
                        </span>
                    )}
                    <div className="flex gap-2">
                        <button
                            onClick={onPrevious}
                            disabled={!hasPrevious}
                            className={`px-3 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${!hasPrevious
                                ? 'text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed'
                                : 'text-slate-500 dark:text-slate-400'
                                }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={onNext}
                            disabled={!hasNext}
                            className={`px-3 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${!hasNext
                                ? 'text-slate-400 dark:text-slate-500 opacity-50 cursor-not-allowed'
                                : 'text-[#137fec]'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TransactionTable;
export type { TransactionColumn, TransactionTableProps };
