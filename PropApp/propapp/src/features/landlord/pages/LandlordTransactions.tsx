import { useState } from 'react';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import DateRangeFilter from '../../../components/common/DateRangeFilter';

// Mock transaction data for landlord (income-focused)
const transactions = [
    {
        id: 'TRX-88231',
        description: 'Rent Payment - Oct 2023',
        tenant: 'Anderson Family',
        property: 'Modern Oakwood Estate',
        date: 'Oct 01, 2023',
        time: '09:15 AM',
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: 'Received',
        amount: '+₦450,000.00',
        icon: 'home',
        iconBg: 'bg-green-50 dark:bg-green-900/20',
        iconColor: 'text-green-600 dark:text-green-400',
    },
    {
        id: 'TRX-88190',
        description: 'Rent Payment - Oct 2023',
        tenant: 'Chen Wei',
        property: 'Downtown Loft, Unit 8A',
        date: 'Oct 02, 2023',
        time: '10:00 AM',
        method: 'Auto-Debit',
        methodIcon: 'credit_card',
        status: 'Pending',
        amount: '+₦280,000.00',
        icon: 'apartment',
        iconBg: 'bg-orange-50 dark:bg-orange-900/20',
        iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
        id: 'TRX-87992',
        description: 'Platform Service Fee',
        tenant: 'PropertyApp',
        property: 'All Properties',
        date: 'Sept 30, 2023',
        time: '11:59 PM',
        method: 'Auto-Debit',
        methodIcon: 'credit_card',
        status: 'Deducted',
        amount: '-₦45,000.00',
        icon: 'payments',
        iconBg: 'bg-red-50 dark:bg-red-900/20',
        iconColor: 'text-red-600 dark:text-red-400',
    },
    {
        id: 'TRX-87800',
        description: 'Late Fee Collected',
        tenant: 'Sarah Miller',
        property: 'Riverside Condo',
        date: 'Sept 29, 2023',
        time: '01:15 PM',
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: 'Received',
        amount: '+₦15,000.00',
        icon: 'schedule',
        iconBg: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
        id: 'TRX-87654',
        description: 'Rent Payment - Sept 2023',
        tenant: 'Anderson Family',
        property: 'Modern Oakwood Estate',
        date: 'Sept 01, 2023',
        time: '11:00 AM',
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: 'Received',
        amount: '+₦450,000.00',
        icon: 'home',
        iconBg: 'bg-green-50 dark:bg-green-900/20',
        iconColor: 'text-green-600 dark:text-green-400',
    },
    {
        id: 'TRX-86500',
        description: 'Security Deposit Received',
        tenant: 'New Tenant',
        property: 'Sunset View Apt',
        date: 'Sept 15, 2023',
        time: '03:45 PM',
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: 'Held',
        amount: '+₦300,000.00',
        icon: 'security',
        iconBg: 'bg-teal-50 dark:bg-teal-900/20',
        iconColor: 'text-teal-600 dark:text-teal-400',
    },
];

const statusToVariant: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending'> = {
    Received: 'success',
    Pending: 'warning',
    Deducted: 'error',
    Held: 'info',
};

export default function LandlordTransactions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAIChat, setShowAIChat] = useState(false);

    // Calculate summary stats
    const totalIncome = transactions.filter(t => t.amount.startsWith('+')).reduce((sum, t) => {
        const amount = parseFloat(t.amount.replace(/[^0-9.]/g, ''));
        return sum + amount;
    }, 0);

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
                    <button className="px-5 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2 shadow-sm">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Export Report (CSV)
                    </button>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Total Income (Month)</p>
                    <p className="text-2xl font-extrabold text-green-600">₦{totalIncome.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Pending Payments</p>
                    <p className="text-2xl font-extrabold text-orange-600">₦280,000</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Fees & Deductions</p>
                    <p className="text-2xl font-extrabold text-red-500">₦45,000</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Net Revenue</p>
                    <p className="text-2xl font-extrabold text-[#137fec]">₦1,450,000</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#101922] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#137fec]">tune</span> Filters
                        </h3>
                        <button className="text-xs font-semibold text-[#137fec] hover:underline">Clear all</button>
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
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/50 focus:border-[#137fec]">
                                <option>All Properties</option>
                                <option>Modern Oakwood Estate</option>
                                <option>Downtown Loft, Unit 8A</option>
                                <option>Riverside Condo</option>
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/50 focus:border-[#137fec]">
                                <option>All Types</option>
                                <option>Rent Income</option>
                                <option>Late Fees</option>
                                <option>Security Deposits</option>
                                <option>Service Fees</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/50 focus:border-[#137fec]">
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
                            {transactions.map((tx) => (
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
                                        <button className="p-2 text-slate-400 hover:text-[#137fec] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title="View Receipt">
                                            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/20 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Showing 6 of 48 transactions</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">Previous</button>
                        <button className="px-3 py-1 text-xs font-bold text-[#137fec] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Next</button>
                    </div>
                </div>
            </SectionCard>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                {showAIChat && (
                    <div className="flex flex-col w-[360px] md:w-[420px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white dark:from-[#1e293b] dark:to-[#1e293b]">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Finance Assistant</h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Property Income</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAIChat(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="flex-1 p-4 h-[300px] overflow-y-auto flex flex-col gap-4 bg-slate-50/50 dark:bg-[#101922]/50">
                            <div className="flex gap-3">
                                <div className="size-8 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shrink-0 mt-1 shadow-sm">
                                    <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                                </div>
                                <div className="bg-white dark:bg-[#1e293b] border border-slate-100 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">I can help you analyze your rental income. Would you like a breakdown by property or see which tenants have pending payments?</p>
                                </div>
                            </div>
                            <div className="mt-auto">
                                <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide px-1">Suggested actions</p>
                                <div className="flex flex-wrap gap-2">
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Monthly Income Report
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Show Pending Payments
                                    </button>
                                    <button className="text-xs bg-white dark:bg-[#1e293b] hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors shadow-sm">
                                        Tax Summary
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-[#101922] border-none rounded-xl text-sm focus:ring-2 focus:ring-[#137fec]/20 text-slate-900 dark:text-white placeholder:text-slate-400 shadow-inner" placeholder="Ask about your income..." type="text" />
                                <button className="absolute right-2 p-1.5 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 transition-colors shadow-md">
                                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className={`group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300 ${showAIChat ? 'hidden' : ''}`}
                >
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">Finance Assistant</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Click for help</span>
                    </div>
                </button>
            </div>
        </PageContainer>
    );
}
