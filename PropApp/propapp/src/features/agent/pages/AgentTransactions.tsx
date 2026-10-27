import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import ExportModal from '../../../components/ExportModal';
import SectionCard from '../../../components/common/SectionCard';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import DateRangeFilter from '../../../components/common/DateRangeFilter';
import { agentService } from '../../../lib/api/services';
import type { Payout } from '../../../types/lease';

// UI transaction type
interface UITransaction {
    id: string;
    description: string;
    property: string;
    date: string;
    time: string;
    method: string;
    methodIcon: string;
    status: string;
    amount: string;
    icon: string;
    iconBg: string;
    iconColor: string;
}

// Format currency
function formatCurrency(amount: number, currency = 'CAD'): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

// Format date and time
function formatDateTime(dateStr: string): { date: string; time: string } {
    const date = new Date(dateStr);
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
}

// Map API status to UI status
function mapStatus(status: Payout['status']): { label: string; variant: 'success' | 'warning' | 'error' } {
    const mapping: Record<Payout['status'], { label: string; variant: 'success' | 'warning' | 'error' }> = {
        COMPLETED: { label: 'Paid', variant: 'success' },
        PENDING: { label: 'Pending', variant: 'warning' },
        PROCESSING: { label: 'Pending', variant: 'warning' },
        FAILED: { label: 'Failed', variant: 'error' },
    };
    return mapping[status] || { label: status, variant: 'warning' };
}

// Get icon and styling based on status
function getTransactionStyle(status: Payout['status']): { icon: string; iconBg: string; iconColor: string } {
    switch (status) {
        case 'COMPLETED':
            return {
                icon: 'account_balance_wallet',
                iconBg: 'bg-green-50 dark:bg-green-900/20',
                iconColor: 'text-green-600 dark:text-green-400',
            };
        case 'PENDING':
        case 'PROCESSING':
            return {
                icon: 'schedule',
                iconBg: 'bg-orange-50 dark:bg-orange-900/20',
                iconColor: 'text-orange-600 dark:text-orange-400',
            };
        case 'FAILED':
            return {
                icon: 'error',
                iconBg: 'bg-red-50 dark:bg-red-900/20',
                iconColor: 'text-red-600 dark:text-red-400',
            };
        default:
            return {
                icon: 'payments',
                iconBg: 'bg-blue-50 dark:bg-blue-900/20',
                iconColor: 'text-blue-600 dark:text-blue-400',
            };
    }
}

// Transform API payout to UI format
function transformPayout(payout: Payout): UITransaction {
    const { date, time } = formatDateTime(payout.createdAt);
    const statusInfo = mapStatus(payout.status);
    const style = getTransactionStyle(payout.status);

    return {
        id: `TRX-${payout.id.slice(-5).toUpperCase()}`,
        description: payout.description || 'Withdrawal',
        property: 'N/A',
        date,
        time,
        method: payout.bankAccount?.bankName
            ? `${payout.bankAccount.bankName} **** ${payout.bankAccount.accountNumber?.slice(-4) || ''}`
            : 'Bank Transfer',
        methodIcon: 'account_balance',
        status: statusInfo.label,
        amount: formatCurrency(payout.amount, payout.currency),
        ...style,
    };
}

const statusToVariant: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending'> = {
    Paid: 'success',
    Pending: 'warning',
    Failed: 'error',
};

export default function AgentTransactions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAIChat, setShowAIChat] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // API data state
    const [transactions, setTransactions] = useState<UITransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Fetch payout history
    useEffect(() => {
        async function fetchPayouts() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await agentService.getPayoutHistory({ page, limit });

                if (response.data) {
                    let transformed = (response.data || []).map(transformPayout);

                    // Client-side search filter
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        transformed = transformed.filter(tx =>
                            (tx.description ?? "").toLowerCase().includes(query) ||
                            tx.id.toLowerCase().includes(query)
                        );
                    }

                    setTransactions(transformed);
                    setTotalCount(response.meta?.total || transformed.length);
                    setTotalPages(response.meta?.totalPages || 1);
                }
            } catch (err) {
                console.error('Error fetching payout history:', err);
                setError('Failed to load transaction history');
            } finally {
                setIsLoading(false);
            }
        }

        fetchPayouts();
    }, [page, searchQuery]);

    return (
        <PageContainer>
            {/* Back Link */}
            <div className="mb-6">
                <Link to="/agent/earnings" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-brand transition-colors">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Back to Earnings Dashboard
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">All Transaction History</h1>
                    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">View, search, and manage your complete earnings records.</p>
                </div>
                <div className="flex gap-3 items-center">
                    <button
                        onClick={() => setIsExportModalOpen(true)}
                        className="px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export History
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-canvas-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand">tune</span> Filters
                        </h3>
                        <button className="text-xs font-semibold text-brand hover:underline">Clear all</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-4 relative">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Search Transactions</label>
                            <SearchInput
                                placeholder="e.g. Commission, Bonus, Invoice #..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />
                        </div>
                        <DateRangeFilter className="lg:col-span-3" />
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Property</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/50 focus:border-brand">
                                <option>All Properties</option>
                                <option>Sunset Apartments, Unit 4B</option>
                                <option>Modern Oakwood Estate</option>
                                <option>Lakeview Condo, Unit 12A</option>
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/50 focus:border-brand">
                                <option>All Types</option>
                                <option>Commission</option>
                                <option>Bonus</option>
                                <option>Withdrawal</option>
                                <option>Referral</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/50 focus:border-brand">
                                <option>All</option>
                                <option>Paid</option>
                                <option>Pending</option>
                                <option>Failed</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <SectionCard padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Description / ID</th>
                                <th className="px-6 py-4">Property</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Payment Method</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                // Loading skeleton rows
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={`skeleton-${index}`} className="animate-pulse">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700" />
                                                <div className="space-y-2">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-32" />
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 ml-auto" /></td>
                                        <td className="px-6 py-4"><div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-8 mx-auto" /></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl text-red-400">error</span>
                                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">receipt_long</span>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">No transactions found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded-full ${tx.iconBg} flex items-center justify-center ${tx.iconColor}`}>
                                                <span className="material-symbols-outlined text-[20px]">{tx.icon}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{tx.description}</p>
                                                <p className="text-xs text-slate-500">Ref: #{tx.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                        {tx.property}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {tx.date} <br /> <span className="text-xs text-slate-400">{tx.time}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-slate-400">{tx.methodIcon}</span>
                                            <span className="text-sm text-slate-700 dark:text-slate-300">{tx.method}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={tx.status} variant={statusToVariant[tx.status] || 'neutral'} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className="font-bold text-slate-900 dark:text-white">{tx.amount}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 text-slate-400 hover:text-brand hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title={tx.status === 'Failed' ? 'Retry / View Details' : 'View Receipt'}>
                                            <span className="material-symbols-outlined text-[20px]">
                                                {tx.status === 'Failed' ? 'refresh' : tx.status === 'Pending' ? 'visibility' : 'receipt_long'}
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {isLoading ? (
                            <span className="animate-pulse">Loading...</span>
                        ) : (
                            <>Showing {transactions.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, totalCount)} of {totalCount} transactions</>
                        )}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className={`px-3 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded transition-colors ${
                                page === 1 || isLoading
                                    ? 'text-slate-500 dark:text-slate-400 opacity-50 cursor-not-allowed'
                                    : 'text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isLoading}
                            className={`px-3 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded transition-colors ${
                                page >= totalPages || isLoading
                                    ? 'text-slate-500 dark:text-slate-400 opacity-50 cursor-not-allowed'
                                    : 'text-brand hover:bg-slate-50 dark:hover:bg-slate-700'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </SectionCard>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                {/* AI Modal */}
                {showAIChat && (
                    <div className="flex flex-col w-[360px] md:w-[420px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50/50 dark:bg-[#1e293b]">
                            <div className="flex items-center gap-3">
                                <div className="size-9 bg-brand rounded-full flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-lg">forum</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Earnings Assistant</h4>
                                    <p className="text-xs text-green-500 font-semibold flex items-center gap-1">
                                        <span className="size-1.5 bg-green-500 rounded-full"></span>
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAIChat(false)}
                                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 h-[250px] overflow-y-auto">
                            <div className="flex gap-3">
                                <div className="size-7 bg-brand rounded-full flex items-center justify-center text-white text-xs shrink-0 shadow-sm font-bold">AI</div>
                                <div className="bg-white dark:bg-[#1e293b] p-3 rounded-xl rounded-tl-none shadow-sm max-w-[85%]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">Hello! I can help you analyze your earnings, find specific transactions, or generate reports. What would you like to know?</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input
                                    className="w-full pl-4 pr-12 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand/20 focus:outline-none"
                                    placeholder="Ask about your earnings..."
                                    type="text"
                                />
                                <button className="absolute right-1.5 size-8 bg-brand rounded-full flex items-center justify-center text-white hover:bg-brand/90 transition-colors">
                                    <span className="material-symbols-outlined text-lg">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* AI Toggle Button */}
                <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className="cursor-pointer group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300"
                >
                    <div className="size-10 rounded-full bg-brand flex items-center justify-center text-white shadow-md">
                        <span className="material-symbols-outlined">forum</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">Earnings Assistant</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Click for help</span>
                    </div>
                </button>
            </div>

            {/* Export Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                dataType="Transactions"
            />
        </PageContainer>
    );
}
