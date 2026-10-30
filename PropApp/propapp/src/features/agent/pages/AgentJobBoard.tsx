import { useState, useEffect } from 'react';
import { AnimatedGroup, MagneticButton, SuccessCelebration } from '../../../components/animation';
import AIAssistantWidget from '../../../components/common/AIAssistantWidget';
import { agentService } from '../../../lib/api/services/agentService';
import type { AgentJob, AgentEarnings } from '../../../types/dashboard';
import { formatCurrency, formatDateTime } from '@/lib/format';

// Helper to format currency
// Helper to get status color
function getStatusColor(status: string): string {
    switch (status) {
        case 'Open':
            return 'bg-blue-100 text-blue-700';
        case 'Accepted':
            return 'bg-green-100 text-green-700';
        case 'Completed':
            return 'bg-slate-100 text-slate-700';
        case 'Cancelled':
            return 'bg-red-100 text-red-700';
        default:
            return 'bg-slate-100 text-slate-700';
    }
}

// Placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';

type FilterType = 'all' | 'viewing' | 'inspection' | 'verification' | 'documents';

export default function AgentJobBoard() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [jobs, setJobs] = useState<AgentJob[]>([]);
    const [earnings, setEarnings] = useState<AgentEarnings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acceptingJobId, setAcceptingJobId] = useState<string | null>(null);

    // Fetch jobs and earnings on mount
    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                setError(null);
                const [jobsResponse, earningsResponse] = await Promise.all([
                    agentService.getAvailableJobs(),
                    agentService.getEarnings(),
                ]);
                setJobs(jobsResponse.data || []);
                setEarnings(earningsResponse.data);
            } catch (err) {
                console.error('Failed to fetch agent data:', err);
                setError('Failed to load job board data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    // Handle accepting a job
    async function handleAcceptJob(jobId: string) {
        try {
            setAcceptingJobId(jobId);
            await agentService.acceptJob(jobId);
            // Remove accepted job from list
            setJobs(prev => prev.filter(j => j.id !== jobId));
            setIsSuccessOpen(true);
        } catch (err) {
            console.error('Failed to accept job:', err);
            alert('Failed to accept job. Please try again.');
        } finally {
            setAcceptingJobId(null);
        }
    }

    const filters: { key: FilterType; label: string }[] = [
        { key: 'all', label: 'All jobs' },
        { key: 'viewing', label: 'Viewings' },
        { key: 'inspection', label: 'Inspections' },
        { key: 'verification', label: 'Verifications' },
        { key: 'documents', label: 'Documents' },
    ];

    // Filter jobs based on active filter
    const filteredJobs = jobs.filter((job: AgentJob) => {
        if (activeFilter === 'all') return true;
        const typeMap: Record<FilterType, string> = {
            'all': '',
            'viewing': 'Property Viewing',
            'inspection': 'Property Inspection',
            'verification': 'Verification Visit',
            'documents': 'Document Pickup',
        };
        return job.type === typeMap[activeFilter];
    });

    return (
        <div className="py-8 px-4 md:px-10 lg:px-20 pb-32">
            <div className="max-w-[1400px] w-full mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Agent job board
                        </h1>
                        <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
                            Find and accept property service jobs in your area.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">tune</span> Filters
                        </button>
                        <button className="px-5 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">location_on</span> My Area
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-canvas-dark p-5 rounded-2xl animate-pulse">
                                <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Total Earnings */}
                    <div className="bg-white dark:bg-canvas-dark p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="material-symbols-outlined text-green-500 text-[24px]">payments</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total earned</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(earnings?.totalEarned || 0)}
                        </h3>
                    </div>

                    {/* Available Balance */}
                    <div className="bg-white dark:bg-canvas-dark p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="material-symbols-outlined text-blue-500 text-[24px]">
                                account_balance_wallet
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(earnings?.availableBalance || 0)}
                        </h3>
                    </div>

                    {/* Pending Balance */}
                    <div className="bg-white dark:bg-canvas-dark p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="material-symbols-outlined text-amber-500 text-[24px]">
                                schedule
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pending</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {formatCurrency(earnings?.pendingBalance || 0)}
                        </h3>
                    </div>

                    {/* Available Jobs */}
                    <div className="bg-white dark:bg-canvas-dark p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                            <span className="material-symbols-outlined text-purple-500 text-[24px]">work</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Available jobs</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {jobs.length}
                            <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">open</span>
                        </h3>
                    </div>
                </div>
                )}

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeFilter === filter.key
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                                : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Job Cards */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="bg-white dark:bg-canvas-dark rounded-2xl p-5 animate-pulse">
                                <div className="flex gap-4">
                                    <div className="w-32 h-32 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-canvas-dark rounded-2xl">
                        <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">work_off</span>
                        <p className="text-slate-500 dark:text-slate-400">No jobs available</p>
                    </div>
                ) : (
                <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={0.08}>
                    {filteredJobs.map((job: AgentJob) => (
                        <div
                            key={job.id}
                            className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:border-brand/50 transition-colors cursor-pointer"
                        >
                            <div className="flex">
                                <img
                                    alt={job.property}
                                    className="w-32 h-full object-cover shrink-0"
                                    src={PLACEHOLDER_IMAGE}
                                />
                                <div className="flex-1 p-5">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div>
                                            <span
                                                className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded ${getStatusColor(job.status)}`}
                                            >
                                                {job.status}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                                                {job.type}
                                            </h3>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xl font-extrabold text-green-600">{formatCurrency(job.earnings)}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Payout</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                        {job.property}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{job.city}</p>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            {formatDateTime(job.date)}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[16px]">person</span>
                                            {job.clientName}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <MagneticButton className="flex-1">
                                            <button
                                                onClick={() => handleAcceptJob(job.id)}
                                                disabled={acceptingJobId === job.id}
                                                className="w-full py-2 bg-brand-ink text-on-brand font-bold text-sm rounded-lg hover:bg-brand-ink/90 transition-colors disabled:opacity-50"
                                            >
                                                {acceptingJobId === job.id ? 'Accepting...' : 'Accept Job'}
                                            </button>
                                        </MagneticButton>
                                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </AnimatedGroup>
                )}

                {/* Load More */}
                <div className="mt-10 flex justify-center">
                    <button className="px-8 py-3 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Load more jobs
                    </button>
                </div>
            </div>

            {/* Floating AI Bar */}
            <AIAssistantWidget
                suggestions={['Find jobs nearby', 'Check my earnings', 'Contact support']}
            />

            {/* Job Accepted Success Celebration */}
            <SuccessCelebration
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="Job accepted"
                description="You've been added to this job. Check your schedule for details and head to the location at the scheduled time."
                buttonText="View my jobs"
                icon="work"
            />
        </div >
    );
}
