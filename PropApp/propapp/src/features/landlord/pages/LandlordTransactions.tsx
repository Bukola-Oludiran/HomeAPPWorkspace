import { useState, useEffect } from 'react';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import DateRangeFilter from '../../../components/common/DateRangeFilter';
import { landlordService } from '../../../lib/api/services/landlordService';
import type { LandlordTransaction } from '../../../types/dashboard';

// UI transaction type
interface UITransaction {
    id: string;
    description: string;
    tenant: string;
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

// Helper to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Math.abs(amount));
}

// Helper to format date and time
function formatDateTime(dateString: string): { date: string; time: string } {
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
}

// Get icon and colors based on transaction type
function getTransactionStyle(type: string, amount: number): { icon: string; iconBg: string; iconColor: string } {
    const typeLower = type.toLowerCase();
    const isPositive = amount > 0;

    if (typeLower.includes('rent')) {
        return {
            icon: isPositive ? 'home' : 'home',
            iconBg: isPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
            iconColor: isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
        };
    }
    if (typeLower.includes('fee') || typeLower.includes('service')) {
        return {
            icon: 'payments',
            iconBg: 'bg-red-50 dark:bg-red-900/20',
            iconColor: 'text-red-600 dark:text-red-400',
        };
    }
    if (typeLower.includes('deposit')) {
        return {
            icon: 'security',
            iconBg: 'bg-teal-50 dark:bg-teal-900/20',
            iconColor: 'text-teal-600 dark:text-teal-400',
        };
    }
    if (typeLower.includes('late')) {
        return {
            icon: 'schedule',
            iconBg: 'bg-purple-50 dark:bg-purple-900/20',
            iconColor: 'text-purple-600 dark:text-purple-400',
        };
    }
    return {
        icon: isPositive ? 'arrow_downward' : 'arrow_upward',
        iconBg: isPositive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-orange-50 dark:bg-orange-900/20',
        iconColor: isPositive ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400',
    };
}

// Map API status to UI status
function mapStatus(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed' || statusLower === 'success') return 'Received';
    if (statusLower === 'pending') return 'Pending';
    if (statusLower === 'failed') return 'Failed';
    if (statusLower === 'held') return 'Held';
    return status;
}

// Transform API transaction to UI format
function transformTransaction(tx: LandlordTransaction): UITransaction {
    const { date, time } = formatDateTime(tx.createdAt);
    const isPositive = tx.amount > 0;
    const style = getTransactionStyle(tx.type, tx.amount);

    return {
        id: tx.id,
        description: tx.type,
        tenant: tx.tenantName || 'System',
        property: tx.propertyName || 'All Properties',
        date,
        time,
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: mapStatus(tx.status),
        amount: `${isPositive ? '+' : '-'}${formatCurrency(tx.amount)}`,
        ...style,
    };
}

const statusToVariant: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending'> = {
    Received: 'success',
    Pending: 'warning',
    Deducted: 'error',
    Held: 'info',
};

export default function LandlordTransactions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAIChat, setShowAIChat] = useState(false);

    // API state
    const [transactions, setTransactions] = useState<UITransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const limit = 10;

    // Fetch transactions
    useEffect(() => {
        async function fetchTransactions() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await landlordService.getTransactions({ page, limit });
                const txData = response.data || [];
                setTransactions(txData.map(transformTransaction));
                setTotalCount(response.meta?.total || 0);
            } catch (err) {
                console.error('Failed to fetch transactions:', err);
                setError('Failed to load transactions. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchTransactions();
    }, [page]);

    // Calculate summary stats from transactions
    const totalIncome = transactions.filter(t => t.amount.startsWith('+')).reduce((sum, t) => {
        const amount = parseFloat(t.amount.replace(/[^0-9.]/g, ''));
        return sum + amount;
    }, 0);

    const pendingAmount = transactions
        .filter(t => t.status === 'Pending' && t.amount.startsWith('+'))
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.]/g, '')), 0);

    const deductions = transactions
        .filter(t => t.amount.startsWith('-'))
        .reduce((sum, t) => sum + parseFloat(t.amount.replace(/[^0-9.]/g, '')), 0);

    const netRevenue = totalIncome - deductions;

    // Filter transactions based on search
    const filteredTransactions = transactions.filter(tx => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (tx.description ?? "").toLowerCase().includes(query) ||
            (tx.tenant ?? "").toLowerCase().includes(query) ||
            (tx.property ?? "").toLowerCase().includes(query) ||
            tx.id.toLowerCase().includes(query);
    });

    return (
        <PageContainer>
            {/* Back Link */}
            <PageHeader
                title="Transaction History"
                subtitle="Track all income, fees, and financial activity across your properties."
                breadcrumb={[
                    { label: 'Dashboard', href: '/landlord/dashboard' },
                    { label: 'Transactions' }
                ]}
                actions={
                    <button className="px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export Report (CSV)
                    </button>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Income (Month)</p>
                    <p className="text-2xl font-extrabold text-green-600">{isLoading ? '...' : `$${totalIncome.toLocaleString()}`}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Pending Payments</p>
                    <p className="text-2xl font-extrabold text-orange-600">{isLoading ? '...' : `$${pendingAmount.toLocaleString()}`}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Fees & Deductions</p>
                    <p className="text-2xl font-extrabold text-red-500">{isLoading ? '...' : `$${deductions.toLocaleString()}`}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Net Revenue</p>
                    <p className="text-2xl font-extrabold text-brand-ink">{isLoading ? '...' : `$${netRevenue.toLocaleString()}`}</p>
                </div>
            </div>

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
                                placeholder="e.g. Tenant name, Invoice #..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />
                        </div>
                        <DateRangeFilter className="lg:col-span-3" />
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Property</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/50 focus:border-brand">
                                <option>All Properties</option>
                                <option>Modern Oakwood Estate</option>
                                <option>Downtown Loft, Unit 8A</option>
                                <option>Riverside Condo</option>
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/50 focus:border-brand">
                                <option>All Types</option>
                                <option>Rent Income</option>
                                <option>Late Fees</option>
                                <option>Security Deposits</option>
                                <option>Service Fees</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/50 focus:border-brand">
                                <option>All</option>
                                <option>Received</option>
                                <option>Pending</option>
                                <option>Deducted</option>
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
                                <th className="px-6 py-4">Tenant / Source</th>
                                <th className="px-6 py-4">Property</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {error && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-red-500">
                                        {error}
                                    </td>
                                </tr>
                            )}
                            {!error && filteredTransactions.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                                        No transactions found
                                    </td>
                                </tr>
                            )}
                            {filteredTransactions.map((tx) => (
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
                                        {tx.tenant}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {tx.property}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                        {tx.date} <br /> <span className="text-xs text-slate-400">{tx.time}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={tx.status} variant={statusToVariant[tx.status] || 'neutral'} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <p className={`font-bold ${tx.amount.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{tx.amount}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button className="p-2 text-slate-400 hover:text-brand-ink hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="View Receipt">
                                            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        Showing {filteredTransactions.length} of {totalCount} transactions
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className={`px-3 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded transition-colors ${page === 1 ? 'text-slate-400 opacity-50 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            disabled={page * limit >= totalCount}
                            className={`px-3 py-1 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded transition-colors ${page * limit >= totalCount ? 'text-slate-400 opacity-50 cursor-not-allowed' : 'text-brand-ink hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </SectionCard>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                {showAIChat && (
                    <div className="flex flex-col w-[360px] md:w-[420px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-blue-50/50 dark:bg-[#1e293b]">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">forum</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Finance Assistant</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Property Income</p>
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
                                    <p className="text-sm text-slate-700 dark:text-slate-300">I can help you analyze your rental income. Would you like a breakdown by property or see which tenants have pending payments?</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide px-1">Suggested actions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Monthly Income Report
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Show Pending Payments
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors">
                                        Tax Summary
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-canvas-dark border-none rounded-xl text-sm focus:ring-2 focus:ring-brand/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner" placeholder="Ask about your income..." type="text" />
                                <button className="absolute right-2 p-1.5 bg-brand-ink text-on-brand rounded-lg hover:bg-brand-ink/90 transition-colors shadow-md">
                                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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
