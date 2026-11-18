import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import EmptyState from '../../../components/common/EmptyState';
import StatusBadge from '../../../components/common/StatusBadge';
import type { ContourFragment } from '../../../components/common/ContourMotif';
import { AnimatedGroup } from '../../../components/animation';
import { agentService } from '../../../lib/api/services/agentService';
import type { AgentJob } from '../../../types/dashboard';
import { JOB_STATUS } from '../status';
import { formatCurrency, formatDateTime } from '@/lib/format';

// A short list leaves the right of the grid and the page below empty; a large fragment fills that corner of the
// layout and reaches under the cards
const CONTOUR: ContourFragment[] = [
    'top-[56%] left-[70%] -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[1100px] rotate-180',
    '-top-24 -right-48 w-[50vw] max-w-[520px]',
];

type TabType = 'all' | 'Accepted' | 'Completed' | 'Cancelled';

const TABS: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All jobs' },
    { key: 'Accepted', label: 'In progress' },
    { key: 'Completed', label: 'Completed' },
    { key: 'Cancelled', label: 'Cancelled' },
];

export default function AgentMyJobs() {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [jobs, setJobs] = useState<AgentJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [completingJobId, setCompletingJobId] = useState<string | null>(null);

    // Fetch accepted jobs on mount
    useEffect(() => {
        async function fetchJobs() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await agentService.getAcceptedJobs();
                setJobs(response.data || []);
            } catch (err) {
                console.error('Failed to fetch jobs:', err);
                setError('Failed to load your jobs');
            } finally {
                setIsLoading(false);
            }
        }

        fetchJobs();
    }, []);

    // Handle completing a job
    async function handleCompleteJob(jobId: string) {
        try {
            setCompletingJobId(jobId);
            await agentService.completeJob(jobId, {});
            // Update job status in list
            setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Completed' as const } : j));
        } catch (err) {
            console.error('Failed to complete job:', err);
            alert('Failed to complete job. Please try again.');
        } finally {
            setCompletingJobId(null);
        }
    }

    const filteredJobs = activeTab === 'all'
        ? jobs
        : jobs.filter((job: AgentJob) => job.status === activeTab);

    return (
        <PageContainer motif={CONTOUR}>
            <PageHeader
                title="My jobs"
                subtitle="Manage your schedule, track progress, and update job status."
                actions={
                    <div className="flex p-1 bg-card border border-border rounded-xl overflow-x-auto custom-scrollbar">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-5 py-2 text-sm whitespace-nowrap rounded-lg transition-all ${activeTab === tab.key
                                    ? 'bg-brand-ink text-on-brand font-bold'
                                    : 'font-medium text-slate-600 dark:text-slate-300 hover:bg-accent hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                }
            />

            {/* Jobs Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4" />
                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4" />
                            <div className="space-y-2">
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="p-6 bg-alert-bg rounded-2xl text-center">
                    <span className="material-symbols-outlined text-alert text-3xl mb-2">error</span>
                    <p className="text-alert">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-brand-ink text-on-brand font-bold rounded-lg hover:bg-brand-ink/90">
                        Retry
                    </button>
                </div>
            ) : (
                <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.08}>
                    {filteredJobs.map((job: AgentJob) => {
                        const status = JOB_STATUS[job.status] ?? JOB_STATUS.Open;
                        const isAccepted = job.status === 'Accepted';
                        const isCompleted = job.status === 'Completed';
                        const isCancelled = job.status === 'Cancelled';

                        return (
                            <div
                                key={job.id}
                                className="bg-card rounded-2xl border border-border p-6 hover:border-border-strong transition-colors flex flex-col"
                            >
                                {/* Header */}
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <span className="inline-block px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-neutral-bg text-muted-foreground">
                                        {job.type}
                                    </span>
                                    <StatusBadge status={status.label} variant={status.variant} />
                                </div>
                                <div className="flex justify-between items-start gap-3 mb-4">
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                        {job.property}
                                    </h3>
                                    <span className="text-xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                                        {formatCurrency(job.earnings)}
                                    </span>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 mb-6 text-sm text-slate-700 dark:text-slate-400">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg shrink-0">location_on</span>
                                        <span>{job.city}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg shrink-0">schedule</span>
                                        <span>{formatDateTime(job.date)}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-lg shrink-0">person</span>
                                        <span>{job.clientName}</span>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-border">
                                    {isAccepted && (
                                        <>
                                            {job.contactPhone ? (
                                                <a
                                                    href={`tel:${job.contactPhone}`}
                                                    className="p-2.5 text-slate-700 dark:text-slate-400 hover:bg-accent rounded-lg transition-colors"
                                                    title={`Call ${job.clientName}`}
                                                >
                                                    <span className="material-symbols-outlined">call</span>
                                                </a>
                                            ) : <span />}
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/agent/my-jobs/${job.id}`}
                                                    className="px-4 py-2 border border-border-strong text-slate-700 dark:text-white text-sm font-bold rounded-lg hover:bg-accent transition-colors"
                                                >
                                                    Details
                                                </Link>
                                                <button
                                                    onClick={() => handleCompleteJob(job.id)}
                                                    disabled={completingJobId === job.id}
                                                    className="px-4 py-2 bg-brand-ink text-on-brand text-sm font-bold rounded-lg hover:bg-brand-ink/90 transition-all disabled:opacity-50"
                                                >
                                                    {completingJobId === job.id ? 'Completing…' : 'Complete'}
                                                </button>
                                            </div>
                                        </>
                                    )}

                                    {(isCompleted || isCancelled) && (
                                        <>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {isCompleted ? 'Job completed' : 'Job cancelled'}
                                            </span>
                                            <Link
                                                to={`/agent/my-jobs/${job.id}`}
                                                className="px-4 py-2 border border-border-strong text-slate-700 dark:text-white text-sm font-bold rounded-lg hover:bg-accent transition-colors"
                                            >
                                                View details
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Empty State */}
                    {filteredJobs.length === 0 && (
                        <EmptyState
                            icon="work_off"
                            title="No jobs here yet"
                            description="Jobs you accept from the job board appear here."
                            action={{ label: "Browse job board", href: "/agent/jobs" }}
                            className="col-span-full"
                        />
                    )}
                </AnimatedGroup>
            )}
        </PageContainer>
    );
}
