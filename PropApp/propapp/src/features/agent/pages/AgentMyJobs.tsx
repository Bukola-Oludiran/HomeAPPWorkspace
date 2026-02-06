import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import FilterDropdown from '../../../components/FilterDropdown';
import EmptyState from '../../../components/common/EmptyState';
import { AnimatedGroup } from '../../../components/animation';
import { agentService } from '../../../lib/api/services/agentService';
import type { AgentJob } from '../../../types/dashboard';

// Helper to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper to get status styles
function getStatusStyles(status: AgentJob['status']): { bg: string; text: string; bar: string; icon?: string; animate?: boolean } {
    switch (status) {
        case 'Accepted':
            return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-500', bar: 'bg-amber-500', icon: 'sync', animate: true };
        case 'Completed':
            return { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-500', bar: 'bg-green-500', icon: 'check' };
        case 'Cancelled':
            return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-500', bar: 'bg-red-500' };
        case 'Open':
        default:
            return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-500', bar: 'bg-blue-500' };
    }
}

type TabType = 'all' | 'Accepted' | 'Completed' | 'Cancelled';

export default function AgentMyJobs() {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
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
        <PageContainer>
            <PageHeader
                title="My Jobs"
                subtitle="Manage your schedule, track progress, and update job status."
                actions={
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto custom-scrollbar shadow-sm">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-5 py-2 text-sm font-bold whitespace-nowrap rounded-lg transition-all ${activeTab === 'all'
                                    ? 'bg-[#137fec] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                All Jobs
                            </button>
                            <button
                                onClick={() => setActiveTab('Accepted')}
                                className={`px-5 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${activeTab === 'Accepted'
                                    ? 'bg-[#137fec] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                In Progress
                            </button>
                            <button
                                onClick={() => setActiveTab('Completed')}
                                className={`px-5 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${activeTab === 'Completed'
                                    ? 'bg-[#137fec] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                Completed
                            </button>
                            <button
                                onClick={() => setActiveTab('Cancelled')}
                                className={`px-5 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${activeTab === 'Cancelled'
                                    ? 'bg-[#137fec] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                Cancelled
                            </button>
                        </div>
                        <FilterDropdown
                            label="Filter"
                            options={[
                                { id: 'hvac', label: 'HVAC', icon: 'hvac' },
                                { id: 'plumbing', label: 'Plumbing', icon: 'plumbing' },
                                { id: 'electrical', label: 'Electrical', icon: 'lightbulb' },
                                { id: 'appliances', label: 'Appliances', icon: 'kitchen' },
                                { id: 'general', label: 'General', icon: 'handyman' },
                            ]}
                            selected={selectedFilters}
                            onChange={setSelectedFilters}
                        />
                    </div>
                }
            />

            {/* Jobs Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#101922] rounded-2xl p-6 animate-pulse">
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
                <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Retry
                    </button>
                </div>
            ) : (
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.08}>
                {filteredJobs.map((job: AgentJob) => {
                    const styles = getStatusStyles(job.status);
                    const isAccepted = job.status === 'Accepted';
                    const isCompleted = job.status === 'Completed';
                    const isCancelled = job.status === 'Cancelled';

                    return (
                        <div
                            key={job.id}
                            className={`bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg hover:border-[#137fec]/30 transition-all group relative overflow-hidden ${isCompleted || isCancelled ? 'opacity-80 hover:opacity-100' : ''}`}
                        >
                            {/* Left Border Accent */}
                            <div className={`absolute top-0 left-0 w-1 h-full ${styles.bar}`}></div>

                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 pl-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                            {job.type}
                                        </span>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${styles.bg} ${styles.text}`}>
                                            {styles.icon && (
                                                <span className={`material-symbols-outlined text-[12px] ${styles.animate ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
                                                    {styles.icon}
                                                </span>
                                            )}
                                            {job.status}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                        {job.property}
                                    </h3>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xl font-extrabold text-slate-900 dark:text-white">
                                        {formatCurrency(job.earnings)}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="space-y-3 mb-6 pl-2">
                                <div className="flex items-start gap-3 text-slate-800 dark:text-slate-400 text-sm">
                                    <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">location_on</span>
                                    <span>{job.city}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-800 dark:text-slate-400 text-sm">
                                    <span className="material-symbols-outlined text-lg shrink-0">schedule</span>
                                    <span>{job.date}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-800 dark:text-slate-400 text-sm">
                                    <span className="material-symbols-outlined text-lg shrink-0">person</span>
                                    <span>{job.clientName}</span>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 pl-2">
                                {isAccepted && (
                                    <>
                                        <div className="flex gap-1">
                                            <button className="p-2.5 text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Call Client">
                                                <span className="material-symbols-outlined">call</span>
                                            </button>
                                            <button className="p-2.5 text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Message">
                                                <span className="material-symbols-outlined">chat</span>
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/agent/my-jobs/${job.id}`}
                                                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Details
                                            </Link>
                                            <button
                                                onClick={() => handleCompleteJob(job.id)}
                                                disabled={completingJobId === job.id}
                                                className="px-4 py-2 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all disabled:opacity-50"
                                            >
                                                {completingJobId === job.id ? 'Completing...' : 'Complete'}
                                            </button>
                                        </div>
                                    </>
                                )}

                                {isCompleted && (
                                    <>
                                        <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                                            <span className="material-symbols-outlined text-sm">verified</span>
                                            Completed
                                        </div>
                                        <Link
                                            to={`/agent/my-jobs/${job.id}`}
                                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </>
                                )}

                                {isCancelled && (
                                    <>
                                        <span className="text-xs text-slate-400 italic">Job cancelled</span>
                                        <button className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold rounded-lg transition-colors">
                                            Archive
                                        </button>
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
                        title="No jobs found"
                        description="Try adjusting your filters or browse the job board for new opportunities."
                        action={{ label: "Browse Job Board", href: "/agent/jobs" }}
                        className="col-span-full"
                    />
                )}
            </AnimatedGroup>
            )}
        </PageContainer>
    );
}
