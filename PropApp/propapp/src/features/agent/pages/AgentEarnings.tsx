import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import { AnimatedGroup } from '../../../components/animation';

// Mock payout history data
const payoutHistory = [
    {
        id: 1,
        title: 'AC Repair - Leakage',
        jobId: '#88231',
        location: 'Lekki Phase 1',
        date: 'Oct 24, 2023',
        time: '2:30 PM',
        status: 'Paid',
        statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        amount: '₦15,000',
        icon: 'plumbing',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    },
    {
        id: 2,
        title: 'VIP Client Tour',
        jobId: '#88190',
        location: 'Victoria Island',
        date: 'Oct 22, 2023',
        time: '10:00 AM',
        status: 'Pending',
        statusColor: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
        amount: '₦25,000',
        icon: 'person',
        iconBg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    },
    {
        id: 3,
        title: 'Move-out Inspection',
        jobId: '#87992',
        location: 'Ikeja GRA',
        date: 'Oct 20, 2023',
        time: '4:30 PM',
        status: 'Paid',
        statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        amount: '₦8,000',
        icon: 'corporate_fare',
        iconBg: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
    },
    {
        id: 4,
        title: 'Monthly Bonus',
        jobId: 'Performance Incentive',
        location: 'Sept',
        date: 'Oct 01, 2023',
        time: '9:00 AM',
        status: 'Paid',
        statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        amount: '₦5,000',
        icon: 'account_balance',
        iconBg: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
    },
];

const payoutMethods = [
    { id: 1, name: 'GTBank', lastFour: '4592', icon: 'account_balance', isPrimary: true },
    { id: 2, name: 'Visa Card', lastFour: '8821', icon: 'credit_card', isPrimary: false },
];

export default function AgentEarnings() {
    const [dateFilter, setDateFilter] = useState('this-month');
    const [statusFilter, setStatusFilter] = useState('all');

    return (
        <PageContainer>
            <PageHeader
                title="Earnings Dashboard"
                subtitle="Track your income, manage payouts, and view history."
                actions={
                    <button className="px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export Report
                    </button>
                }
            />

            {/* Stats Cards */}
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" stagger={0.1}>
                {/* Available Balance */}
                <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px] text-green-600">account_balance_wallet</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Available Balance</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                            ₦42,500<span className="text-xl text-slate-400 font-medium">.00</span>
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-green-600">
                        <span className="bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">trending_up</span>
                            +12%
                        </span>
                        <span className="text-slate-400 dark:text-slate-500">vs last week</span>
                    </div>
                </div>

                {/* Pending Payouts */}
                <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px] text-orange-500">pending</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pending Payouts</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                            ₦15,000<span className="text-xl text-slate-400 font-medium">.00</span>
                        </h3>
                    </div>
                    <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-500">
                        <span className="material-symbols-outlined text-[18px] text-orange-500">info</span>
                        <span>Clearance expected in 24 hrs</span>
                    </div>
                </div>

                {/* Total Earnings (YTD) */}
                <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <span className="material-symbols-outlined text-[100px] text-[#137fec]">savings</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Earnings (YTD)</p>
                        <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white mt-2">
                            ₦845,200<span className="text-xl text-slate-400 font-medium">.00</span>
                        </h3>
                    </div>
                    <div className="mt-6 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className="bg-[#137fec] h-full rounded-full" style={{ width: '75%' }}></div>
                    </div>
                </div>
            </AnimatedGroup>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Payout History */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {/* Filters */}
                    <div className="bg-white dark:bg-[#101922] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-[20px]">calendar_month</span>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#137fec]/50 cursor-pointer appearance-none"
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
                                    className="pl-10 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-[#137fec]/50 cursor-pointer appearance-none"
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
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#137fec]/50"
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
                            <Link to="/agent/transactions" className="text-sm text-[#137fec] font-bold hover:underline">View All</Link>
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
                                    {payoutHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`size-10 rounded-full flex items-center justify-center ${item.iconBg}`}>
                                                        <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                                                        <p className="text-xs text-slate-500">Job ID: {item.jobId} • {item.location}</p>
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
                                                <p className="font-bold text-slate-900 dark:text-white">+ {item.amount}</p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#137fec] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex justify-center">
                            <button className="text-sm font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 hover:text-[#137fec] transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg">
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
                        <div className="absolute -left-10 -bottom-10 size-40 bg-[#137fec]/20 rounded-full blur-3xl"></div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <span className="material-symbols-outlined text-3xl text-white/80">contactless</span>
                                <span className="font-mono text-white/50 text-sm">Agent Wallet</span>
                            </div>
                            <div className="mb-6">
                                <p className="text-slate-400 text-sm mb-1">Total Balance</p>
                                <h2 className="text-3xl font-extrabold tracking-tight">₦42,500.00</h2>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Account Holder</span>
                                    <span className="font-medium text-sm">John Doe</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Expires</span>
                                    <span className="font-medium text-sm">12/25</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#137fec]/50 hover:bg-white dark:hover:bg-slate-700/80 transition-all group">
                                <div className="size-10 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center mb-2 group-hover:bg-[#137fec] group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">payments</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Withdraw</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#137fec]/50 hover:bg-white dark:hover:bg-slate-700/80 transition-all group">
                                <div className="size-10 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center mb-2 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">add_card</span>
                                </div>
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Top Up</span>
                            </button>
                        </div>
                    </div>

                    {/* Payout Methods */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white">Payout Methods</h3>
                            <button className="text-xs font-bold text-[#137fec] hover:underline flex items-center">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                                Add New
                            </button>
                        </div>
                        <div className="space-y-3">
                            {payoutMethods.map((method) => (
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
                                        <p className="text-xs text-slate-500">**** {method.lastFour}</p>
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
        </PageContainer>
    );
}
