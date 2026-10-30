import { useState, useEffect } from 'react';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import DateRangeFilter from '../../../components/common/DateRangeFilter';
import { tenantService } from '../../../lib/api/services';
import type { TenantPayment } from '../../../types/dashboard';

// UI types for transactions
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
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 2,
    }).format(amount);
}

// Format date for display
function formatDate(dateStr: string): { date: string; time: string } {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const timeFormatted = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    return { date: dateFormatted, time: timeFormatted };
}

// Get status display info
function getStatusDisplay(status: TenantPayment['status']): { label: string; variant: 'success' | 'warning' | 'error' } {
    const mapping: Record<TenantPayment['status'], { label: string; variant: 'success' | 'warning' | 'error' }> = {
        paid: { label: 'Paid', variant: 'success' },
        pending: { label: 'Pending', variant: 'warning' },
        failed: { label: 'Failed', variant: 'error' },
    };
    return mapping[status] || { label: status, variant: 'warning' };
}

// Transform API payment to UI format
function transformPayment(payment: TenantPayment): UITransaction {
    const { date, time } = formatDate(payment.paidDate || payment.dueDate);
    const statusDisplay = getStatusDisplay(payment.status);

    // Determine icon based on payment context
    const icon = payment.status === 'failed' ? 'warning' : 'home';
    const iconBg = payment.status === 'failed' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-blue-50 dark:bg-blue-900/20';
    const iconColor = payment.status === 'failed' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400';

    return {
        id: `TRX-${payment.id.slice(-5).toUpperCase()}`,
        description: `Rent Payment`,
        property: 'Current Rental',
        date,
        time,
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: statusDisplay.label,
        amount: formatCurrency(payment.amount),
        icon,
        iconBg,
        iconColor,
    };
}

const statusToVariant: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending'> = {
    Paid: 'success',
    Pending: 'warning',
    Failed: 'error',
};

export default function TenantTransactions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAIChat, setShowAIChat] = useState(false);

    // API data state
    const [transactions, setTransactions] = useState<UITransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalTransactions, setTotalTransactions] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Fetch payments
    useEffect(() => {
        async function fetchPayments() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await tenantService.getPayments({ page, limit });

                if (response.data) {
                    let transformed = (response.data || []).map(transformPayment);

                    // Client-side search filter
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        transformed = transformed.filter(tx =>
                            (tx.description ?? "").toLowerCase().includes(query) ||
                            tx.id.toLowerCase().includes(query) ||
                            (tx.property ?? "").toLowerCase().includes(query)
                        );
                    }

                    setTransactions(transformed);
                    setTotalTransactions(response.meta?.total || transformed.length);
                    setTotalPages(response.meta?.totalPages || 1);
                }
            } catch (err) {
                console.error('Error fetching payments:', err);
                setError('Failed to load transaction history');
            } finally {
                setIsLoading(false);
            }
        }

        fetchPayments();
    }, [page, searchQuery]);

    return (
        <PageContainer>
            <PageHeader
                title="All Transaction History"
                subtitle="View, search, and manage your complete payment records."
                breadcrumb={[
                    { label: 'Payment Dashboard', href: '/tenant/dashboard' },
                    { label: 'Transactions' }
                ]}
                actions={
                    <button className="px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export History (CSV)
                    </button>
                }
            />

            {/* Filters */}
            <div className="bg-white dark:bg-canvas-dark p-5 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-ink">tune</span> Filters
                        </h3>
                        <button className="text-xs font-semibold text-brand-ink hover:underline">Clear all</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                        <div className="lg:col-span-4 relative">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Search Transactions</label>
                            <SearchInput
                                placeholder="e.g. Rent, Deposit, Invoice #..."
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
                                <option>Application: Lakeview Condo</option>
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/50 focus:border-brand">
                                <option>All Types</option>
                                <option>Monthly Rent</option>
                                <option>Utilities</option>
                                <option>Security Deposit</option>
                                <option>Application Fee</option>
                                <option>Late Fee</option>
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
                                        <button className="p-2 text-slate-400 hover:text-brand-ink hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title={tx.status === 'Failed' ? 'Retry / View Details' : 'View Receipt'}>
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
                            <>Showing {transactions.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, totalTransactions)} of {totalTransactions} transactions</>
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
                                    : 'text-brand-ink hover:bg-slate-50 dark:hover:bg-slate-700'
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
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">forum</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tenant Assistant</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Finance & History</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAIChat(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="flex-1 p-4 h-[300px] overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-canvas-dark/50">
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shrink-0 mt-1">
                                    <span className="material-symbols-outlined text-[16px]">forum</span>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none max-w-[85%]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">I can help you review your transaction history. Are you looking for a specific receipt or need a breakdown of utility costs?</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide px-1">Suggested actions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Find Oct Rent Receipt
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Explain Utility Charges
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Filter by Failed Payments
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-canvas-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-brand/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner" placeholder="Ask about your payments..." type="text" />
                                <button className="absolute right-2 p-1.5 bg-brand-ink text-on-brand rounded-lg hover:bg-brand-ink/90 transition-colors shadow-md">
                                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Trigger Button */}
                <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className={`group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300 ${showAIChat ? 'hidden' : ''}`}
                >
                    <div className="size-10 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md">
                        <span className="material-symbols-outlined">forum</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">Finance Assistant</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Click for help</span>
                    </div>
                </button>
            </div>
        </PageContainer>
    );
}
