import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MakePaymentModal from '../../../components/MakePaymentModal';
import BillingDetailsModal from '../../../components/BillingDetailsModal';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import { AnimatedGroup, MagneticButton, SuccessCelebration } from '../../../components/animation';
import { tenantService } from '../../../lib/api/services/tenantService';
import type { TenantPayment } from '../../../types/dashboard';

// UI transaction interface matching the component's expected structure
interface UITransaction {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    status: string;
    statusColor: string;
    amount: string;
    icon: string;
    iconBg: string;
}

// Helper to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper to format date
function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}

// Helper to get month name from date
function getMonthYear(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Transform API TenantPayment to UI format
function transformPayment(payment: TenantPayment): UITransaction {
    const isPaid = payment.status === 'paid';
    const isPending = payment.status === 'pending';

    return {
        id: payment.id,
        title: 'Monthly Rent',
        description: getMonthYear(payment.dueDate),
        date: formatDate(payment.dueDate),
        time: payment.paidDate ? 'Auto-Pay' : (isPending ? 'Due Now' : 'Manual'),
        status: isPaid ? 'Paid' : isPending ? 'Pending' : 'Failed',
        statusColor: isPaid
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800'
            : isPending
                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
        amount: formatCurrency(payment.amount),
        icon: 'home',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    };
}

// Default payment methods (would come from user service in full implementation)
const paymentMethods = [
    { id: '1', name: 'Visa Card', lastFour: '4592', icon: 'credit_card', isPrimary: true },
    { id: '2', name: 'GTBank', lastFour: '8821', icon: 'account_balance', isPrimary: false },
];

export default function TenantPayments() {
    const [yearFilter, setYearFilter] = useState('this-year');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [transactionHistory, setTransactionHistory] = useState<UITransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState({
        upcomingDue: 0,
        lastPayment: 0,
        lastPaymentDate: '',
        totalPaidYTD: 0,
    });

    // Fetch payments on mount
    useEffect(() => {
        async function fetchPayments() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await tenantService.getPayments({ limit: 50 });
                const payments = response.data.data;
                const transformed = payments.map(transformPayment);
                setTransactionHistory(transformed);

                // Calculate stats
                const paidPayments = payments.filter(p => p.status === 'paid');
                const pendingPayments = payments.filter(p => p.status === 'pending');
                const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
                const lastPaid = paidPayments.sort((a, b) =>
                    new Date(b.paidDate || b.dueDate).getTime() - new Date(a.paidDate || a.dueDate).getTime()
                )[0];
                const nextDue = pendingPayments.sort((a, b) =>
                    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
                )[0];

                setStats({
                    upcomingDue: nextDue?.amount || 0,
                    lastPayment: lastPaid?.amount || 0,
                    lastPaymentDate: lastPaid?.paidDate || lastPaid?.dueDate || '',
                    totalPaidYTD: totalPaid,
                });
            } catch (err) {
                console.error('Failed to fetch payments:', err);
                setError('Failed to load payment history');
            } finally {
                setIsLoading(false);
            }
        }

        fetchPayments();
    }, []);

    // Filter transactions based on status
    const filteredTransactions = transactionHistory.filter(t => {
        if (statusFilter === 'all') return true;
        if (statusFilter === 'paid') return t.status === 'Paid';
        if (statusFilter === 'pending') return t.status === 'Pending';
        if (statusFilter === 'overdue') return t.status === 'Failed';
        return true;
    });

    // Loading state
    if (isLoading) {
        return (
            <PageContainer>
                <PageHeader
                    title="Payments & History"
                    subtitle="Manage your rent, view history, and handle transactions."
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                        </div>
                    ))}
                </div>
            </PageContainer>
        );
    }

    // Error state
    if (error) {
        return (
            <PageContainer>
                <PageHeader
                    title="Payments & History"
                    subtitle="Manage your rent, view history, and handle transactions."
                />
                <div className="p-12 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-red-500 text-4xl mb-3">error</span>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                    >
                        Retry
                    </button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Payments & History"
                subtitle="Manage your rent, view history, and handle transactions."
                actions={
                    <button
                        onClick={() => setIsBillingModalOpen(true)}
                        className="px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm"
                    >
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Statement
                    </button>
                }
            />

            {/* Stats Cards */}
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" stagger={0.1}>
                {/* Upcoming Due */}
                <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px] text-orange-500">calendar_clock</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Upcoming Due</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {formatCurrency(stats.upcomingDue)}
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-orange-600 dark:text-orange-400">
                        <span className="bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">event_upcoming</span>
                            {stats.upcomingDue > 0 ? 'Due Soon' : 'No Pending'}
                        </span>
                    </div>
                </div>

                {/* Last Payment */}
                <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px] text-green-600">check_circle</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Last Payment</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {formatCurrency(stats.lastPayment)}
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">done</span>
                            Paid
                        </span>
                        {stats.lastPaymentDate && <span>on {formatDate(stats.lastPaymentDate)}</span>}
                    </div>
                </div>

                {/* Total Paid (YTD) */}
                <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px] text-[#137fec]">pie_chart</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Paid (YTD)</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                            {formatCurrency(stats.totalPaidYTD)}
                        </h3>
                    </div>
                    <div className="mt-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#137fec] h-full rounded-full" style={{ width: `${Math.min((transactionHistory.filter(t => t.status === 'Paid').length / 12) * 100, 100)}%` }}></div>
                    </div>
                </div>
            </AnimatedGroup>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Transaction History */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Payment Activity Heatmap */}
                    <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Payment Activity</h3>
                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                <span>Less</span>
                                <div className="flex gap-1">
                                    <div className="size-3 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                                    <div className="size-3 rounded-sm bg-[#137fec]/20"></div>
                                    <div className="size-3 rounded-sm bg-[#137fec]/50"></div>
                                    <div className="size-3 rounded-sm bg-[#137fec]"></div>
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 overflow-x-auto pb-2">
                            <div className="flex justify-between text-xs text-slate-400 font-medium px-1">
                                <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                            </div>
                            <div className="grid grid-cols-12 gap-1 h-[80px]">
                                {/* Jan-Dec heatmap columns */}
                                {[
                                    ['bg-[#137fec]', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/50', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/20'],
                                    ['bg-[#137fec]/50', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/20'],
                                    ['bg-[#137fec]', 'bg-[#137fec]/50', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/20', 'bg-slate-100 dark:bg-slate-800'],
                                    ['bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]', 'bg-[#137fec]/50', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/20'],
                                    ['bg-[#137fec]', 'bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/50', 'bg-[#137fec]'],
                                    ['bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/20', 'bg-[#137fec]', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/50'],
                                    ['bg-[#137fec]', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/50', 'bg-[#137fec]/20', 'bg-slate-100 dark:bg-slate-800'],
                                    ['bg-[#137fec]/50', 'bg-[#137fec]', 'bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/20'],
                                    ['bg-[#137fec]', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/50', 'bg-[#137fec]', 'bg-slate-100 dark:bg-slate-800'],
                                    ['bg-[#137fec]/20', 'bg-[#137fec]', 'bg-slate-100 dark:bg-slate-800', 'bg-[#137fec]/50', 'bg-[#137fec]/80'],
                                    ['bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800'],
                                    ['bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800', 'bg-slate-100 dark:bg-slate-800'],
                                ].map((column, colIndex) => (
                                    <div key={colIndex} className="flex flex-col gap-1">
                                        {column.map((cellClass, rowIndex) => (
                                            <div key={rowIndex} className={`flex-1 rounded-sm ${cellClass}`}></div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white dark:bg-[#101922] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">calendar_month</span>
                                <select
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                    className="pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#137fec]/50 cursor-pointer appearance-none"
                                >
                                    <option value="this-year">This Year</option>
                                    <option value="last-year">Last Year</option>
                                    <option value="all-time">All Time</option>
                                </select>
                            </div>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">filter_list</span>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#137fec]/50 cursor-pointer appearance-none"
                                >
                                    <option value="all">All Status</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="relative w-full">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">search</span>
                                <input
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#137fec]/50"
                                    placeholder="Search payments..."
                                    type="text"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transaction History Table */}
                    <SectionCard padding="none">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Transaction History</h3>
                            <Link to="/tenant/transactions" className="text-sm text-[#137fec] font-bold hover:underline">View All</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredTransactions.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
                                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                                                        <p className="text-xs text-slate-500">{item.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {item.date}<br />
                                                <span className="text-xs text-slate-400">{item.time}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${item.statusColor}`}>
                                                    <span className={`size-1.5 rounded-full ${item.status === 'Paid' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-bold text-slate-900 dark:text-white">{item.amount}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 text-slate-400 hover:text-[#137fec] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex justify-center">
                            <button className="text-sm font-bold text-slate-500 hover:text-[#137fec] transition-colors flex items-center gap-2">
                                Load more transactions
                                <span className="material-symbols-outlined text-[16px]">expand_more</span>
                            </button>
                        </div>
                    </SectionCard>
                </div>

                {/* Right Column - Payment Card & Quick Actions */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    {/* Payment Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-black rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute -right-10 -top-10 size-40 bg-white/5 rounded-full blur-3xl"></div>
                        <div className="absolute -left-10 -bottom-10 size-40 bg-[#137fec]/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="material-symbols-outlined text-3xl text-white/80">assured_workload</span>
                                <div className="px-2 py-1 bg-white/10 rounded-md backdrop-blur-sm border border-white/10">
                                    <span className="font-mono text-white/80 text-xs">Auto-Pay Active</span>
                                </div>
                            </div>
                            <div className="mb-6">
                                <p className="text-slate-400 text-sm mb-1">Next Payment Due</p>
                                <h2 className="text-3xl font-extrabold tracking-tight">{formatCurrency(stats.upcomingDue)}</h2>
                                <p className="text-sm text-slate-400 mt-1">{stats.upcomingDue > 0 ? 'Awaiting Payment' : 'No Pending Payments'}</p>
                            </div>
                            <MagneticButton>
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="w-full py-3 rounded-xl bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold transition-colors shadow-lg shadow-[#137fec]/20 flex items-center justify-center gap-2"
                                >
                                    Pay Now
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </button>
                            </MagneticButton>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#137fec]/50 hover:bg-white dark:hover:bg-slate-700/80 transition-all group"
                            >
                                <div className="size-10 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center mb-2 group-hover:bg-[#137fec] group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">payments</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Make Payment</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#137fec]/50 hover:bg-white dark:hover:bg-slate-700/80 transition-all group">
                                <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">autorenew</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Auto-Pay</span>
                            </button>
                            <button
                                onClick={() => setIsBillingModalOpen(true)}
                                className="col-span-2 flex items-center justify-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#137fec]/50 hover:bg-white dark:hover:bg-slate-700/80 transition-all group"
                            >
                                <span className="material-symbols-outlined text-slate-500 text-[20px] group-hover:text-[#137fec] transition-colors">description</span>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">View Billing Statements</span>
                            </button>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Payment Methods</h3>
                            <button className="text-xs font-bold text-[#137fec] hover:underline flex items-center">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Add New
                            </button>
                        </div>
                        <div className="space-y-3">
                            {paymentMethods.map((method) => (
                                <div
                                    key={method.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border ${method.isPrimary
                                        ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50'
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101922] opacity-70 hover:opacity-100 transition-opacity cursor-pointer'
                                        }`}
                                >
                                    <div className="size-10 bg-white dark:bg-slate-700 rounded-md shadow-sm flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">{method.icon}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{method.name}</p>
                                        <p className="text-xs text-slate-500">**** {method.lastFour} {method.isPrimary && '(Primary)'}</p>
                                    </div>
                                    {method.isPrimary && (
                                        <div className="text-green-600 dark:text-green-400">
                                            <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Make Payment Modal */}
            <MakePaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={() => setIsSuccessOpen(true)}
            />

            {/* Payment Success Celebration */}
            <SuccessCelebration
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="Payment Successful!"
                description="Your rent payment has been processed. A confirmation receipt has been sent to your email."
                buttonText="View Receipt"
                icon="check_circle"
            />

            {/* Billing Details Modal */}
            <BillingDetailsModal
                isOpen={isBillingModalOpen}
                onClose={() => setIsBillingModalOpen(false)}
            />
        </PageContainer>
    );
}
