import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import ExportModal from '../../../components/ExportModal';
import SectionCard from '../../../components/common/SectionCard';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import DateRangeFilter from '../../../components/common/DateRangeFilter';

// Mock transaction data for agent
const transactions = [
    {
        id: 'TRX-88231',
        description: 'Commission - Property Showing',
        property: 'Sunset Apartments, Unit 4B',
        date: 'Oct 01, 2023',
        time: '09:15 AM',
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: 'Paid',
        amount: '₦25,000.00',
        icon: 'handshake',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        id: 'TRX-88190',
        description: 'Commission - Lease Signing',
        property: 'Modern Oakwood Estate',
        date: 'Oct 05, 2023',
        time: '10:00 AM',
        method: 'GTBank **** 4592',
        methodIcon: 'account_balance',
        status: 'Pending',
        amount: '₦75,000.00',
        icon: 'description',
        iconBg: 'bg-orange-50 dark:bg-orange-900/20',
        iconColor: 'text-orange-600 dark:text-orange-400',
    },
    {
        id: 'TRX-87992',
        description: 'Bonus - Top Agent Award',
        property: 'N/A',
        date: 'Sept 28, 2023',
        time: '2:30 PM',
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: 'Paid',
        amount: '₦50,000.00',
        icon: 'emoji_events',
        iconBg: 'bg-purple-50 dark:bg-purple-900/20',
        iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
        id: 'TRX-87800',
        description: 'Withdrawal to Bank',
        property: 'N/A',
        date: 'Sept 29, 2023',
        time: '01:15 PM',
        method: 'GTBank **** 4592',
        methodIcon: 'account_balance',
        status: 'Failed',
        amount: '₦100,000.00',
        icon: 'account_balance_wallet',
        iconBg: 'bg-red-50 dark:bg-red-900/20',
        iconColor: 'text-red-600 dark:text-red-400',
    },
    {
        id: 'TRX-87654',
        description: 'Commission - Property Tour',
        property: 'Lakeview Condo, Unit 12A',
        date: 'Sept 01, 2023',
        time: '11:00 AM',
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: 'Paid',
        amount: '₦15,000.00',
        icon: 'home',
        iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
        id: 'TRX-86500',
        description: 'Referral Bonus',
        property: 'N/A',
        date: 'Aug 25, 2023',
        time: '03:45 PM',
        method: 'Bank Transfer',
        methodIcon: 'account_balance',
        status: 'Paid',
        amount: '₦20,000.00',
        icon: 'group_add',
        iconBg: 'bg-teal-50 dark:bg-teal-900/20',
        iconColor: 'text-teal-600 dark:text-teal-400',
    },
];

const statusToVariant: Record<string, 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending'> = {
    Paid: 'success',
    Pending: 'warning',
    Failed: 'error',
};

export default function AgentTransactions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAIChat, setShowAIChat] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    return (
        <PageContainer>
            {/* Back Link */}
            <div className="mb-6">
                <Link to="/agent/earnings" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#137fec] transition-colors">
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
                                placeholder="e.g. Commission, Bonus, Invoice #..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                            />
                        </div>
                        <DateRangeFilter className="lg:col-span-3" />
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Property</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/50 focus:border-[#137fec]">
                                <option>All Properties</option>
                                <option>Sunset Apartments, Unit 4B</option>
                                <option>Modern Oakwood Estate</option>
                                <option>Lakeview Condo, Unit 12A</option>
                            </select>
                        </div>
                        <div className="lg:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/50 focus:border-[#137fec]">
                                <option>All Types</option>
                                <option>Commission</option>
                                <option>Bonus</option>
                                <option>Withdrawal</option>
                                <option>Referral</option>
                            </select>
                        </div>
                        <div className="lg:col-span-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                            <select className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/50 focus:border-[#137fec]">
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
                                        <button className="p-2 text-slate-400 hover:text-[#137fec] hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors" title={tx.status === 'Failed' ? 'Retry / View Details' : 'View Receipt'}>
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
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Showing 6 of 24 transactions</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed">Previous</button>
                        <button className="px-3 py-1 text-xs font-bold text-[#137fec] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Next</button>
                    </div>
                </div>
            </SectionCard>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                {/* AI Modal */}
                {showAIChat && (
                    <div className="flex flex-col w-[360px] md:w-[420px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white dark:from-[#1e293b] dark:to-[#1e293b]">
                            <div className="flex items-center gap-3">
                                <div className="size-9 bg-gradient-to-tr from-[#137fec] to-blue-400 rounded-full flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-lg">smart_toy</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Earnings Assistant</h4>
                                    <p className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
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
                                <div className="size-7 bg-gradient-to-tr from-[#137fec] to-blue-400 rounded-full flex items-center justify-center text-white text-xs shrink-0 shadow-sm font-bold">AI</div>
                                <div className="bg-white dark:bg-[#1e293b] p-3 rounded-xl rounded-tl-none shadow-sm max-w-[85%]">
                                    <p className="text-sm text-slate-700 dark:text-slate-300">Hello! I can help you analyze your earnings, find specific transactions, or generate reports. What would you like to know?</p>
                                </div>
                            </div>
                        </div>
                        <div className="p-3 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-[#1e293b]">
                            <div className="relative flex items-center">
                                <input
                                    className="w-full pl-4 pr-12 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#137fec]/20 focus:outline-none"
                                    placeholder="Ask about your earnings..."
                                    type="text"
                                />
                                <button className="absolute right-1.5 size-8 bg-[#137fec] rounded-full flex items-center justify-center text-white hover:bg-[#137fec]/90 transition-colors">
                                    <span className="material-symbols-outlined text-lg">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* AI Toggle Button */}
                <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className="cursor-pointer group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300"
                >
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">Earnings Assistant</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Click for help</span>
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
