import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import ExportModal from '../../../components/ExportModal';
import SectionCard from '../../../components/common/SectionCard';
import StatusBadge from '../../../components/common/StatusBadge';
import SearchInput from '../../../components/common/SearchInput';
import DateRangeFilter from '../../../components/common/DateRangeFilter';
import AIAssistantWidget from '../../../components/common/AIAssistantWidget';
import type { ContourFragment } from '../../../components/common/ContourMotif';
import { agentService } from '../../../lib/api/services';
import type { Payout } from '../../../types/lease';
import { PAYOUT_STATUS } from '../status';
import { formatCurrency, formatDate } from '@/lib/format';

const CONTOUR: ContourFragment[] = [
    '-top-24 -right-48 w-[50vw] max-w-[520px]',
    '-bottom-28 -left-48 w-[50vw] max-w-[520px] rotate-180',
];

/** The YYYY-MM-DD of a timestamp in Lagos, to compare with the date inputs */
function lagosDay(value: string): string {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date(value));
}

export default function AgentTransactions() {
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    // API data state
    const [payouts, setPayouts] = useState<Payout[]>([]);
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
                const data = response.data || [];
                setPayouts(data);
                setTotalCount(response.meta?.total || data.length);
                setTotalPages(response.meta?.totalPages || 1);
            } catch (err) {
                console.error('Error fetching payout history:', err);
                setError('Failed to load payout history');
            } finally {
                setIsLoading(false);
            }
        }

        fetchPayouts();
    }, [page]);

    const query = searchQuery.trim().toLowerCase();
    const visible = payouts.filter((payout) => {
        const day = lagosDay(payout.createdAt);
        return (
            (!query || `${payout.description ?? ''} ${payout.reference ?? ''}`.toLowerCase().includes(query)) &&
            (statusFilter === 'all' || PAYOUT_STATUS[payout.status]?.label === statusFilter) &&
            (!startDate || day >= startDate) &&
            (!endDate || day <= endDate)
        );
    });
    const hasFilters = Boolean(query || startDate || endDate || statusFilter !== 'all');

    function clearFilters() {
        setSearchQuery('');
        setStartDate('');
        setEndDate('');
        setStatusFilter('all');
    }

    return (
        <PageContainer motif={CONTOUR}>
            {/* Back Link */}
            <div className="mb-6">
                <Link to="/agent/earnings" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-ink transition-colors">
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    Back to earnings dashboard
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Payout history</h1>
                    <p className="text-slate-700 dark:text-slate-400 mt-2 text-lg">Every withdrawal from your Keystead balance to your bank.</p>
                </div>
                <button
                    onClick={() => setIsExportModalOpen(true)}
                    className="px-5 py-2.5 rounded-lg border border-border-strong bg-card hover:bg-accent text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2 self-start md:self-auto"
                >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Export history
                </button>
            </div>

            {/* Filters */}
            <div className="bg-card p-5 rounded-xl border border-border mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide flex items-center gap-2">
                        <span className="material-symbols-outlined text-brand-ink dark:text-sky">tune</span> Filters
                    </h3>
                    {hasFilters && (
                        <button onClick={clearFilters} className="text-xs font-semibold text-brand-ink dark:text-sky hover:underline">Clear all</button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-5">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Search</label>
                        <SearchInput
                            placeholder="Description or reference"
                            value={searchQuery}
                            onChange={setSearchQuery}
                        />
                    </div>
                    <DateRangeFilter
                        className="lg:col-span-4"
                        label="Date range"
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                    />
                    <div className="lg:col-span-3">
                        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/50 focus:border-brand"
                        >
                            <option value="all">All statuses</option>
                            <option value="Paid out">Paid out</option>
                            <option value="Processing">Processing</option>
                            <option value="Failed">Failed</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Payouts Table */}
            <SectionCard padding="none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Paid to</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => (
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
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24" /></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-16" /></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl text-alert">error</span>
                                            <p className="text-sm text-alert">{error}</p>
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="px-4 py-2 rounded-lg border border-border-strong text-xs font-bold text-slate-700 dark:text-white hover:bg-accent transition-colors"
                                            >
                                                Try again
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : visible.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">receipt_long</span>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {payouts.length === 0 ? 'No payouts yet' : 'No payouts match these filters'}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : visible.map((payout) => {
                                const status = PAYOUT_STATUS[payout.status] ?? { label: payout.status, variant: 'pending' as const };
                                return (
                                    <tr key={payout.id} className="hover:bg-accent/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 rounded-full bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky flex items-center justify-center shrink-0">
                                                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{payout.description || 'Withdrawal to bank'}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Ref {payout.reference || payout.id.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                            {formatDate(payout.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                            {payout.bankAccount?.bankName
                                                ? `${payout.bankAccount.bankName} ···· ${payout.bankAccount.accountNumber?.slice(-4) ?? ''}`
                                                : 'Bank transfer'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={status.label} variant={status.variant} />
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                                            {formatCurrency(payout.amount, payout.currency, 2)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {isLoading ? (
                            <span className="animate-pulse">Loading…</span>
                        ) : hasFilters ? (
                            <>{visible.length} of {payouts.length} payouts match</>
                        ) : (
                            <>Showing {payouts.length > 0 ? (page - 1) * limit + 1 : 0}–{(page - 1) * limit + payouts.length} of {totalCount} payouts</>
                        )}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className="px-3 py-1 text-xs font-bold bg-card border border-border rounded text-slate-700 dark:text-white hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isLoading}
                            className="px-3 py-1 text-xs font-bold bg-card border border-border rounded text-slate-700 dark:text-white hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </SectionCard>

            <AIAssistantWidget suggestions={['Summarise my earnings this year', 'When was my last payout?']} />

            {/* Export Modal */}
            <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                dataType="Transactions"
            />
        </PageContainer>
    );
}
