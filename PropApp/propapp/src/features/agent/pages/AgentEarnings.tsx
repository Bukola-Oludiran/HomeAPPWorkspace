import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import { AnimatedGroup } from '../../../components/animation';
import { useAuth } from '../../../contexts/AuthContext';
import { agentService } from '../../../lib/api/services/agentService';
import { userService } from '../../../lib/api/services/userService';
import type { AgentEarnings as EarningsData } from '../../../types/dashboard';
import type { Payout, BankAccount } from '../../../types/lease';

// Helper to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper to format date
function formatDate(dateString: string): { date: string; time: string } {
    const date = new Date(dateString);
    return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
}

// Helper to get status styles
function getPayoutStatusStyles(status: Payout['status']): { color: string; dotColor: string } {
    switch (status) {
        case 'COMPLETED':
            return { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', dotColor: 'bg-green-500' };
        case 'PENDING':
        case 'PROCESSING':
            return { color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800', dotColor: 'bg-orange-500' };
        case 'FAILED':
            return { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', dotColor: 'bg-red-500' };
        default:
            return { color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800', dotColor: 'bg-slate-500' };
    }
}

export default function AgentEarnings() {
    const { user } = useAuth();
    const [dateFilter, setDateFilter] = useState('this-month');
    const [statusFilter, setStatusFilter] = useState('all');
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [payouts, setPayouts] = useState<Payout[]>([]);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch earnings, payout history, and bank accounts on mount
    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);
                const [earningsResponse, payoutsResponse, bankAccountsResponse] = await Promise.all([
                    agentService.getEarnings(),
                    agentService.getPayoutHistory(),
                    userService.getBankAccounts(),
                ]);
                setEarnings(earningsResponse.data);
                setPayouts(payoutsResponse.data || []);
                setBankAccounts(bankAccountsResponse.data || []);
            } catch (err) {
                console.error('Failed to fetch earnings data:', err);
                setError('Failed to load earnings data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    // Format user's full name
    const accountHolderName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Agent';

    // Calculate total balance (available + pending)
    const totalBalance = (earnings?.availableBalance || 0) + (earnings?.pendingBalance || 0);

    return (
        <PageContainer>
            <PageHeader
                title="Earnings Dashboard"
                subtitle="Track your income, manage payouts, and view history."
                actions={
                    <button className="px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export Report
                    </button>
                }
            />

            {/* Stats Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-canvas-dark p-6 rounded-2xl animate-pulse">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
                            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="mb-8 p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Retry
                    </button>
                </div>
            ) : (
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" stagger={0.1}>
                {/* Available Balance */}
                <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px] text-green-600">account_balance_wallet</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Available Balance</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {formatCurrency(earnings?.availableBalance || 0)}
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-green-600">
                        <span className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                            Ready to withdraw
                        </span>
                    </div>
                </div>

                {/* Pending Payouts */}
                <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px] text-orange-500">pending</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pending Payouts</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {formatCurrency(earnings?.pendingBalance || 0)}
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <span className="material-symbols-outlined text-[18px] text-orange-500">info</span>
                        <span>Clearance expected in 24 hrs</span>
                    </div>
                </div>

                {/* Total Earnings (YTD) */}
                <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px] text-brand-ink">savings</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Earnings</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {formatCurrency(earnings?.totalEarned || 0)}
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <span className="material-symbols-outlined text-[18px] text-brand-ink">trending_up</span>
                        <span>Withdrawn: {formatCurrency(earnings?.totalWithdrawn || 0)}</span>
                    </div>
                </div>
            </AnimatedGroup>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Payout History */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Filters */}
                    <div className="bg-white dark:bg-canvas-dark p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">calendar_month</span>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/50 cursor-pointer appearance-none"
                                >
                                    <option value="this-month">This Month</option>
                                    <option value="last-month">Last Month</option>
                                    <option value="last-3-months">Last 3 Months</option>
                                    <option value="this-year">This Year</option>
                                </select>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">filter_list</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/50 cursor-pointer appearance-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
                                <input
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand/50"
                                    placeholder="Search transactions..."
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payout History Table */}
                    <SectionCard padding="none">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Payout History</h3>
                            <Link to="/agent/transactions" className="text-sm text-brand-ink font-bold hover:underline">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Job / Description</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {payouts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">receipt_long</span>
                                                <p className="text-slate-500 dark:text-slate-400">No payout history yet</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        payouts.map((payout: Payout) => {
                                            const { date, time } = formatDate(payout.createdAt);
                                            const styles = getPayoutStatusStyles(payout.status);
                                            return (
                                                <tr key={payout.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-full flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                                                <span className="material-symbols-outlined text-[20px]">payments</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                                    {payout.description || 'Payout'}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    Ref: {payout.reference || payout.id.slice(0, 8)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                        {date}<br />
                                                        <span className="text-xs text-slate-400">{time}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${styles.color}`}>
                                                            <span className={`size-1.5 rounded-full ${styles.dotColor}`}></span>
                                                            {payout.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <p className="font-bold text-slate-900 dark:text-white">+ {formatCurrency(payout.amount)}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-brand-ink hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                                            <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex justify-center">
                            <button className="text-sm font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 hover:text-brand-ink transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg">
                                Load more transactions
                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            </button>
                        </div>
                    </SectionCard>
                </div>

                {/* Right Column - Wallet & Quick Actions */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Wallet Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-black rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 size-40 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute -left-10 -bottom-10 size-40 bg-brand/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <span className="material-symbols-outlined text-3xl text-white/80">contactless</span>
                                <span className="font-mono text-white/50 text-sm">Agent Wallet</span>
                            </div>
                            <div className="mb-6">
                                <p className="text-slate-400 text-sm mb-1">Total Balance</p>
                                <h2 className="text-3xl font-extrabold tracking-tight">{formatCurrency(totalBalance)}</h2>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Account Holder</span>
                                    <span className="font-medium text-sm">{accountHolderName}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">Status</span>
                                    <span className="font-medium text-sm">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-canvas-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand/50 hover:bg-white dark:hover:bg-slate-700/80 transition-all group">
                                <div className="size-10 rounded-full bg-brand/10 text-brand-ink flex items-center justify-center mb-2 group-hover:bg-brand group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">payments</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Withdraw</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand/50 hover:bg-white dark:hover:bg-slate-700/80 transition-all group">
                                <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">add_card</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Top Up</span>
                            </button>
                        </div>
                    </div>

                    {/* Payout Methods */}
                    <div className="bg-white dark:bg-canvas-dark p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Payout Methods</h3>
                            <button className="text-xs font-bold text-brand-ink hover:underline flex items-center">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Add New
                            </button>
                        </div>
                        <div className="space-y-3">
                            {bankAccounts.length === 0 ? (
                                <div className="text-center py-4 text-slate-500 text-sm">
                                    No payout methods added yet
                                </div>
                            ) : (
                                bankAccounts.map((account) => (
                                    <div
                                        key={account.id}
                                        className={`flex items-center gap-3 p-3 rounded-lg border ${account.isDefault
                                            ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-canvas-dark opacity-70 hover:opacity-100 transition-opacity cursor-pointer'
                                            }`}
                                    >
                                        <div className="size-10 bg-white dark:bg-slate-700 rounded-md shadow-sm flex items-center justify-center">
                                            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">account_balance</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{account.bankName}</p>
                                            <p className="text-xs text-slate-500">**** {account.accountNumber.slice(-4)}</p>
                                        </div>
                                        {account.isDefault && (
                                            <div className="text-green-600 dark:text-green-400">
                                                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
