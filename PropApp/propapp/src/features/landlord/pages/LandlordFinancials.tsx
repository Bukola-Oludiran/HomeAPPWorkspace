import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DocumentViewerModal from '../../../components/DocumentViewerModal';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import StatsCard from '../../../components/common/StatsCard';
import SearchInput from '../../../components/common/SearchInput';
import { AnimatedGroup } from '../../../components/animation';
import { landlordService } from '../../../lib/api/services/landlordService';
import type { LandlordFinancials as LandlordFinancialsType, LandlordTransaction } from '../../../types/dashboard';
import { formatCurrency } from '@/lib/format';

// UI transaction type
interface UITransaction {
    id: string;
    date: string;
    property: string;
    category: string;
    categoryColor: string;
    description: string;
    amount: string;
    amountColor: string;
    status: string;
}

// Helper to format currency
// Helper to format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// Get category color based on transaction type
function getCategoryColor(type: string): string {
    const typeLower = type.toLowerCase();
    if (typeLower.includes('rent')) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    if (typeLower.includes('maintenance')) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    if (typeLower.includes('tax')) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    if (typeLower.includes('fee')) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    if (typeLower.includes('deposit')) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
}

// Transform API transaction to UI format
function transformTransaction(tx: LandlordTransaction): UITransaction {
    const isPositive = tx.amount > 0;
    return {
        id: tx.id,
        date: formatDate(tx.createdAt),
        property: tx.propertyName || 'N/A',
        category: tx.type,
        categoryColor: getCategoryColor(tx.type),
        description: tx.tenantName ? `From ${tx.tenantName}` : tx.type,
        amount: `${isPositive ? '+' : ''}${formatCurrency(tx.amount)}`,
        amountColor: isPositive ? 'text-green-600' : 'text-slate-900 dark:text-white',
        status: (tx.status ?? "").toLowerCase(),
    };
}

type TimePeriod = 'monthly' | 'quarterly' | 'annually';

export default function LandlordFinancials() {
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
    const [searchQuery, setSearchQuery] = useState('');
    const [propertyFilter, setPropertyFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showDocumentViewer, setShowDocumentViewer] = useState(false);

    // API state
    const [financials, setFinancials] = useState<LandlordFinancialsType | null>(null);
    const [transactions, setTransactions] = useState<UITransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch financial data
    useEffect(() => {
        async function fetchFinancials() {
            try {
                setIsLoading(true);
                setError(null);

                const [financialsRes, transactionsRes] = await Promise.all([
                    landlordService.getFinancials(),
                    landlordService.getTransactions({ limit: 10 }),
                ]);

                const finData = financialsRes.data;
                setFinancials(finData);
                // Transform transactions — endpoint returns array directly or paginated { data, meta }
                const txRaw = transactionsRes.data;
                const txData = Array.isArray(txRaw) ? txRaw : (txRaw as unknown as { data: LandlordTransaction[] })?.data || [];
                setTransactions(txData.map(transformTransaction));
            } catch (err) {
                console.error('Failed to fetch financials:', err);
                setError('Failed to load financial data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchFinancials();
    }, [timePeriod]);

    // Calculate derived values from API data
    const totalRevenue = financials?.totalRevenue || 0;
    const totalExpenses = 0; // No expense data from API yet (see APIInadequacies.md)
    const netOperatingIncome = totalRevenue - totalExpenses;
    const cashFlow = financials?.availableBalance || 0;

    // Revenue by property (sorted by revenue descending, excluding zero-revenue)
    const revenueByProperty = (financials?.revenueByProperty || [])
        .filter(p => p.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue);
    const allProperties = financials?.revenueByProperty || [];

    // Revenue breakdown by transaction type from recent transactions
    const revenueByType: Record<string, number> = {};
    for (const tx of financials?.recentTransactions || []) {
        const type = tx.type || 'OTHER';
        revenueByType[type] = (revenueByType[type] || 0) + tx.amount;
    }
    const revenueTypeEntries = Object.entries(revenueByType).sort((a, b) => b[1] - a[1]);
    const rentRevenue = revenueByType['RENT_PAYMENT'] || 0;
    const otherRevenue = totalRevenue - rentRevenue;
    const rentPercent = totalRevenue > 0 ? Math.round((rentRevenue / totalRevenue) * 100) : 0;

    // Filter transactions based on search and filters
    const filteredTransactions = transactions.filter(tx => {
        const matchesSearch = !searchQuery ||
            (tx.property ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (tx.description ?? "").toLowerCase().includes(searchQuery.toLowerCase());
        const matchesProperty = propertyFilter === 'all' ||
            (tx.property ?? "").toLowerCase().includes(propertyFilter.toLowerCase());
        const matchesCategory = categoryFilter === 'all' ||
            (tx.category ?? "").toLowerCase().includes(categoryFilter.toLowerCase());
        return matchesSearch && matchesProperty && matchesCategory;
    });

    const reportDocument = {
        title: 'Monthly Financial Report - October 2024',
        type: 'pdf' as const,
        property: 'All Properties',
        modifiedTime: 'Oct 28, 2024',
        status: 'Generated',
        totalPages: 8,
    };

    return (
        <PageContainer>
            <PageHeader
                title="Financial Overview"
                subtitle="Track revenue, expenses, and cash flow across your portfolio."
                actions={
                    <>
                        {/* Time Period Toggle */}
                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex items-center">
                            <button
                                onClick={() => setTimePeriod('monthly')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${timePeriod === 'monthly' ? 'bg-white dark:bg-canvas-dark shadow-sm text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setTimePeriod('quarterly')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${timePeriod === 'quarterly' ? 'bg-white dark:bg-canvas-dark shadow-sm text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                Quarterly
                            </button>
                            <button
                                onClick={() => setTimePeriod('annually')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${timePeriod === 'annually' ? 'bg-white dark:bg-canvas-dark shadow-sm text-slate-900 dark:text-white font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                Annually
                            </button>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">file_upload</span> Export
                            </button>
                            <button
                                onClick={() => setShowDocumentViewer(true)}
                                className="px-4 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span> Report
                            </button>
                        </div>
                    </>
                }
            />

            {/* Stats Cards */}
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" stagger={0.1}>
                {/* Total Revenue */}
                <StatsCard
                    icon="payments"
                    iconColor="blue"
                    label="Total Revenue"
                    value={isLoading ? '...' : formatCurrency(totalRevenue)}
                    animateValue={!isLoading}
                    numericValue={totalRevenue}
                    valuePrefix="₦"
                />

                {/* Total Expenses */}
                <StatsCard
                    icon="request_quote"
                    iconColor="red"
                    label="Total Expenses"
                    value={isLoading ? '...' : formatCurrency(totalExpenses)}
                    animateValue={!isLoading}
                    numericValue={totalExpenses}
                    valuePrefix="₦"
                />

                {/* Net Operating Income */}
                <StatsCard
                    icon="account_balance_wallet"
                    iconColor="emerald"
                    label="Net Operating Income"
                    value={isLoading ? '...' : formatCurrency(netOperatingIncome)}
                    animateValue={!isLoading}
                    numericValue={netOperatingIncome}
                    valuePrefix="₦"
                />

                {/* Cash Flow */}
                <StatsCard
                    icon="savings"
                    iconColor="purple"
                    label="Available Balance"
                    value={isLoading ? '...' : formatCurrency(cashFlow)}
                    animateValue={!isLoading}
                    numericValue={cashFlow}
                    valuePrefix="₦"
                    badge={{ text: "vs last period", variant: "default" }}
                />
            </AnimatedGroup>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Revenue Sources */}
                <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Revenue Sources</h3>
                        <button className="text-slate-500 dark:text-slate-400 hover:text-brand-ink transition-colors">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        {/* Donut Chart */}
                        <div className="relative size-40 shrink-0">
                            <div className="size-full rounded-full" style={{ background: `conic-gradient(var(--color-brand) 0% ${rentPercent}%, #e2e8f0 ${rentPercent}% 100%)` }}></div>
                            <div className="absolute inset-4 bg-white dark:bg-canvas-dark rounded-full flex flex-col items-center justify-center">
                                <span className="text-xs text-slate-500 dark:text-slate-400">Total</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">{isLoading ? '...' : formatCurrency(totalRevenue)}</span>
                            </div>
                        </div>
                        {/* Legend */}
                        <div className="w-full space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                                        <span className="size-3 rounded-full bg-brand"></span> Rent Collected
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(rentRevenue)}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-brand h-2 rounded-full" style={{ width: `${rentPercent}%` }}></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                                        <span className="size-3 rounded-full bg-slate-200 dark:bg-slate-600"></span> Other Income
                                    </span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(otherRevenue)}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div className="bg-slate-300 dark:bg-slate-600 h-2 rounded-full" style={{ width: `${100 - rentPercent}%` }}></div>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 pl-5">
                                    {revenueTypeEntries.filter(([t]) => t !== 'RENT_PAYMENT').map(([t]) => t.replace(/_/g, ' ').toLowerCase()).join(', ') || 'Deposits, fees, and other income'}
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Top Performing Properties */}
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Top Performing Properties</h4>
                        <div className="space-y-4">
                            {revenueByProperty.length > 0 ? revenueByProperty.slice(0, 3).map((p) => (
                                <div key={p.propertyId} className="flex items-center justify-between text-sm">
                                    <span className="text-slate-700 dark:text-slate-300">{p.propertyName}</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(p.revenue)}</span>
                                </div>
                            )) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">No revenue data yet</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Expense Categories */}
                <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Expense Categories</h3>
                        <button className="text-slate-500 dark:text-slate-400 hover:text-brand-ink transition-colors">
                            <span className="material-symbols-outlined">more_horiz</span>
                        </button>
                    </div>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 mb-4">receipt_long</span>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">No expense data available</p>
                        <p className="text-xs text-slate-500 dark:text-slate-500">Expense tracking will appear here once the backend supports expense categorization.</p>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
                        <Link to="/landlord/transactions" className="text-sm text-brand-ink font-bold hover:underline">View All</Link>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {/* Search */}
                        <SearchInput
                            placeholder="Search transactions..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            variant="compact"
                        />
                        {/* Property Filter */}
                        <select
                            className="pl-3 pr-8 py-1.5 text-sm bg-white dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-brand focus:border-brand text-slate-700 dark:text-slate-300"
                            value={propertyFilter}
                            onChange={(e) => setPropertyFilter(e.target.value)}
                        >
                            <option value="all">All Properties</option>
                            {allProperties.map(p => (
                                <option key={p.propertyId} value={p.propertyName}>{p.propertyName}</option>
                            ))}
                        </select>
                        {/* Category Filter */}
                        <select
                            className="pl-3 pr-8 py-1.5 text-sm bg-white dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-brand focus:border-brand text-slate-700 dark:text-slate-300"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            <option value="all">All Categories</option>
                            {revenueTypeEntries.map(([type]) => (
                                <option key={type} value={type.toLowerCase()}>{type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}</option>
                            ))}
                        </select>
                        {/* Date Button */}
                        <button className="px-3 py-1.5 bg-white dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:border-brand hover:text-brand-ink transition-colors flex items-center gap-1 text-sm font-medium">
                            <span className="material-symbols-outlined text-[18px]">calendar_month</span> Date
                        </button>
                    </div>
                </div>

                {/* Table */}
                <SectionCard padding="none">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Property</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4"></th>
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
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                            No transactions found
                                        </td>
                                    </tr>
                                )}
                                {filteredTransactions.map((transaction) => (
                                    <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{transaction.date}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{transaction.property}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.categoryColor}`}>
                                                {transaction.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{transaction.description}</td>
                                        <td className={`px-6 py-4 text-sm text-right font-bold ${transaction.amountColor}`}>{transaction.amount}</td>
                                        <td className="px-6 py-4 text-center">
                                            {transaction.status === 'completed' ? (
                                                <span className="material-symbols-outlined text-green-500 text-[20px]" title="Completed">check_circle</span>
                                            ) : (
                                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]" title="Pending">pending</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-slate-500 dark:text-slate-400 hover:text-brand-ink opacity-0 group-hover:opacity-100 transition-all">
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Showing {filteredTransactions.length} transactions</p>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50">
                                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                            </button>
                            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-ink dark:hover:text-brand-ink">
                                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </SectionCard>
            </div>

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={showDocumentViewer}
                onClose={() => setShowDocumentViewer(false)}
                document={reportDocument}
            />
        </PageContainer>
    );
}
