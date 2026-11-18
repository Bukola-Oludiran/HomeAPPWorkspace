import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AnimatedGroup, MagneticButton, SuccessCelebration } from '../../../components/animation';
import AIAssistantWidget from '../../../components/common/AIAssistantWidget';
import PageContainer from '../../../components/common/PageContainer';
import StatusBadge from '../../../components/common/StatusBadge';
import type { ContourFragment } from '../../../components/common/ContourMotif';
import { agentService } from '../../../lib/api/services/agentService';
import type { AgentJob, AgentEarnings } from '../../../types/dashboard';
import { formatCurrency, formatDateTime } from '@/lib/format';

// The job cards end high on the page; a large fragment fills the space below them and reaches under the last row
const CONTOUR: ContourFragment[] = [
    'top-[78%] left-[58%] -translate-x-1/2 -translate-y-1/2 -rotate-12 w-[90vw] max-w-[1100px]',
    '-top-24 -right-48 w-[50vw] max-w-[520px]',
];

/** An icon for each kind of job, matched on the words in its type */
function jobIcon(type: string): string {
    const t = type.toLowerCase();
    if (t.includes('inspect')) return 'fact_check';
    if (t.includes('view')) return 'visibility';
    if (t.includes('maint')) return 'build';
    if (t.includes('move')) return 'inventory';
    if (t.includes('verif')) return 'verified_user';
    if (t.includes('document')) return 'description';
    return 'work';
}

const STAT_ICON = 'size-10 rounded-lg bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky flex items-center justify-center mb-3';

export default function AgentJobBoard() {
    const [activeFilter, setActiveFilter] = useState('all');
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

    // One filter per kind of job on the board, so every filter matches something
    const jobTypes = [...new Set(jobs.map((job) => job.type))];
    const filteredJobs = activeFilter === 'all' ? jobs : jobs.filter((job) => job.type === activeFilter);

    return (
        <PageContainer motif={CONTOUR}>
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
                <Link
                    to="/agent/profile"
                    className="px-4 py-2.5 rounded-lg border border-border-strong bg-card text-slate-700 dark:text-slate-200 font-semibold text-sm hover:bg-accent transition-colors flex items-center gap-2 self-start md:self-auto"
                >
                    <span className="material-symbols-outlined text-[20px]">location_on</span> My service areas
                </Link>
            </div>

            {/* Stats Grid */}
            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-card p-5 rounded-2xl animate-pulse">
                            <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { icon: 'payments', label: 'Total earned', value: formatCurrency(earnings?.totalEarned || 0) },
                        { icon: 'account_balance_wallet', label: 'Available', value: formatCurrency(earnings?.availableBalance || 0) },
                        { icon: 'schedule', label: 'Pending', value: formatCurrency(earnings?.pendingBalance || 0) },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-card p-5 rounded-2xl border border-border">
                            <div className={STAT_ICON}>
                                <span className="material-symbols-outlined text-[22px]">{stat.icon}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">{stat.value}</h3>
                        </div>
                    ))}
                    <div className="bg-card p-5 rounded-2xl border border-border">
                        <div className={STAT_ICON}>
                            <span className="material-symbols-outlined text-[22px]">work</span>
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
            {jobTypes.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                    {['all', ...jobTypes].map((type) => (
                        <button
                            key={type}
                            onClick={() => setActiveFilter(type)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeFilter === type
                                ? 'bg-brand-ink text-on-brand'
                                : 'bg-card border border-border text-slate-600 dark:text-slate-300 hover:border-border-strong'
                                }`}
                        >
                            {type === 'all' ? 'All jobs' : type}
                        </button>
                    ))}
                </div>
            )}

            {/* Job Cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-2xl p-5 animate-pulse">
                            <div className="flex gap-4">
                                <div className="size-12 bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0" />
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
                <div className="text-center py-12 bg-card border border-border rounded-2xl">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">work_off</span>
                    <p className="text-slate-500 dark:text-slate-400">No jobs available right now</p>
                </div>
            ) : (
                <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={0.08}>
                    {filteredJobs.map((job: AgentJob) => (
                        <div
                            key={job.id}
                            className="bg-card rounded-2xl border border-border p-5 hover:border-border-strong transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                <div className="size-12 rounded-lg bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined">{jobIcon(job.type)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{job.type}</h3>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{job.property}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{job.city}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">{formatCurrency(job.earnings)}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Payout</p>
                                        </div>
                                    </div>
                                    {job.priority === 'high' && (
                                        <div className="mt-3">
                                            <StatusBadge status="High priority" variant="warning" />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-4 border-t border-border text-xs text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">schedule</span>
                                    {formatDateTime(job.date)}
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px]">person</span>
                                    {job.clientName}
                                </span>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <MagneticButton className="flex-1">
                                    <button
                                        onClick={() => handleAcceptJob(job.id)}
                                        disabled={acceptingJobId === job.id}
                                        className="w-full py-2 bg-brand-ink text-on-brand font-bold text-sm rounded-lg hover:bg-brand-ink/90 transition-colors disabled:opacity-50"
                                    >
                                        {acceptingJobId === job.id ? 'Accepting…' : 'Accept job'}
                                    </button>
                                </MagneticButton>
                                <Link
                                    to={`/agent/my-jobs/${job.id}`}
                                    className="px-4 py-2 border border-border-strong text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-lg hover:bg-accent transition-colors"
                                >
                                    Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </AnimatedGroup>
            )}

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
        </PageContainer>
    );
}
