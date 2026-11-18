import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import StatusBadge from '../../../components/common/StatusBadge';
import type { ContourFragment } from '../../../components/common/ContourMotif';
import { AnimatedGroup } from '../../../components/animation';
import { agentService } from '../../../lib/api/services/agentService';
import { userService } from '../../../lib/api/services/userService';
import type { AgentEarnings as EarningsData } from '../../../types/dashboard';
import type { Payout, BankAccount } from '../../../types/lease';
import { PAYOUT_STATUS } from '../status';
import { formatCurrency, formatDate } from '@/lib/format';

// The payout table is short; a large fragment fills the space below it and reaches under the table
const CONTOUR: ContourFragment[] = [
    'hidden lg:block top-[80%] left-[calc(50%-260px)] -translate-x-1/2 -translate-y-1/2 rotate-180 w-[900px]',
    '-top-24 -right-48 w-[50vw] max-w-[520px]',
];

type DateFilter = 'all' | 'this-month' | 'last-month' | 'last-3-months' | 'this-year';

/** Whether a payout date falls in the chosen period */
function inPeriod(value: string, period: DateFilter): boolean {
    if (period === 'all') return true;
    const date = new Date(value);
    const now = new Date();
    const startOfMonth = (offset: number) => new Date(now.getFullYear(), now.getMonth() + offset, 1);
    switch (period) {
        case 'this-month':
            return date >= startOfMonth(0);
        case 'last-month':
            return date >= startOfMonth(-1) && date < startOfMonth(0);
        case 'last-3-months':
            return date >= startOfMonth(-2);
        case 'this-year':
            return date.getFullYear() === now.getFullYear();
    }
}

const SELECT_CLASS = 'pl-10 pr-8 py-2 bg-muted border-none rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand/50 cursor-pointer appearance-none';

export default function AgentEarnings() {
    const [dateFilter, setDateFilter] = useState<DateFilter>('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [search, setSearch] = useState('');
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

    const query = search.trim().toLowerCase();
    const visiblePayouts = payouts.filter((payout) =>
        inPeriod(payout.createdAt, dateFilter) &&
        (statusFilter === 'all' || PAYOUT_STATUS[payout.status]?.label === statusFilter) &&
        (!query || `${payout.description ?? ''} ${payout.reference ?? ''}`.toLowerCase().includes(query))
    );
    const defaultAccount = bankAccounts.find((account) => account.isDefault) ?? bankAccounts[0];

    return (
        <PageContainer motif={CONTOUR}>
            <PageHeader
                title="Earnings dashboard"
                subtitle="Track your income, manage payouts, and view history."
                actions={
                    <button className="px-5 py-2.5 rounded-lg border border-border-strong bg-card hover:bg-accent text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export report
                    </button>
                }
            />

            {/* Stats Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-card p-6 rounded-2xl animate-pulse">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
                            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="mb-8 p-6 bg-alert-bg rounded-2xl text-center">
                    <span className="material-symbols-outlined text-alert text-3xl mb-2">error</span>
                    <p className="text-alert">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-brand-ink text-on-brand font-bold rounded-lg hover:bg-brand-ink/90">
                        Retry
                    </button>
                </div>
            ) : (
                <AnimatedGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" stagger={0.1}>
                    {[
                        { label: 'Available balance', value: earnings?.availableBalance, icon: 'account_balance_wallet', note: 'Ready to withdraw' },
                        { label: 'Pending earnings', value: earnings?.pendingBalance, icon: 'schedule', note: 'Not yet available to withdraw' },
                        { label: 'Total earnings', value: earnings?.totalEarned, icon: 'savings', note: `Withdrawn so far: ${formatCurrency(earnings?.totalWithdrawn || 0)}` },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card p-6 rounded-2xl border border-border flex flex-col justify-between">
                            <div>
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</p>
                                <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2 whitespace-nowrap">
                                    {formatCurrency(stat.value || 0)}
                                </h3>
                            </div>
                            <p className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                                <span className="material-symbols-outlined text-[18px] text-brand-ink dark:text-sky">{stat.icon}</span>
                                {stat.note}
                            </p>
                        </div>
                    ))}
                </AnimatedGroup>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Payout History */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Filters */}
                    <div className="bg-card p-4 rounded-xl border border-border flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">calendar_month</span>
                                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value as DateFilter)} className={SELECT_CLASS}>
                                    <option value="all">All time</option>
                                    <option value="this-month">This month</option>
                                    <option value="last-month">Last month</option>
                                    <option value="last-3-months">Last 3 months</option>
                                    <option value="this-year">This year</option>
                                </select>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">filter_list</span>
                                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={SELECT_CLASS}>
                                    <option value="all">All statuses</option>
                                    <option value="Paid out">Paid out</option>
                                    <option value="Processing">Processing</option>
                                    <option value="Failed">Failed</option>
                                </select>
                            </div>
                        </div>
                        <div className="relative w-full md:w-64">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-2 bg-muted border-none rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-brand/50"
                                placeholder="Search by reference…"
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Payout History Table */}
                    <SectionCard padding="none">
                        <div className="p-5 border-b border-border flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Payout history</h3>
                            <Link to="/agent/transactions" className="text-sm text-brand-ink dark:text-sky font-bold hover:underline">View all</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-muted text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {visiblePayouts.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center">
                                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">receipt_long</span>
                                                <p className="text-slate-500 dark:text-slate-400">
                                                    {payouts.length === 0 ? 'No payouts yet' : 'No payouts match these filters'}
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        visiblePayouts.map((payout: Payout) => {
                                            const status = PAYOUT_STATUS[payout.status] ?? { label: payout.status, variant: 'pending' as const };
                                            return (
                                                <tr key={payout.id} className="hover:bg-accent/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="size-10 rounded-full flex items-center justify-center bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky shrink-0">
                                                                <span className="material-symbols-outlined text-[20px]">account_balance</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                                    {payout.description || 'Withdrawal to bank'}
                                                                </p>
                                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                                    Ref {payout.reference || payout.id.slice(-8).toUpperCase()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                                        {formatDate(payout.createdAt)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={status.label} variant={status.variant} />
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                                        {formatCurrency(payout.amount, payout.currency)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>
                </div>

                {/* Right Column - Withdraw & payout methods */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-card p-6 rounded-2xl border border-border">
                        <h3 className="font-bold text-slate-900 dark:text-white">Withdraw</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-4">Available to withdraw</p>
                        <p className="text-3xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">{formatCurrency(earnings?.availableBalance || 0)}</p>
                        {defaultAccount && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                To {defaultAccount.bankName} ···· {defaultAccount.accountNumber.slice(-4)}
                            </p>
                        )}
                        <button
                            disabled={!earnings?.availableBalance || !defaultAccount}
                            className="mt-5 w-full py-3 rounded-xl bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                            Withdraw to bank
                        </button>
                    </div>

                    {/* Payout Methods */}
                    <div className="bg-card p-5 rounded-2xl border border-border">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Payout methods</h3>
                            <button className="text-xs font-bold text-brand-ink dark:text-sky hover:underline flex items-center">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Add new
                            </button>
                        </div>
                        <div className="space-y-3">
                            {bankAccounts.length === 0 ? (
                                <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                                    No payout methods added yet
                                </div>
                            ) : (
                                bankAccounts.map((account) => (
                                    <div key={account.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                                        <div className="size-10 bg-neutral-bg rounded-md flex items-center justify-center">
                                            <span className="material-symbols-outlined text-muted-foreground">account_balance</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{account.bankName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">···· {account.accountNumber.slice(-4)}</p>
                                        </div>
                                        {account.isDefault && <StatusBadge status="Default" variant="neutral" showDot={false} />}
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
