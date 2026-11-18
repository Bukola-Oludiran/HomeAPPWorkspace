import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import StatusBadge from '../../../components/common/StatusBadge';
import type { ContourFragment } from '../../../components/common/ContourMotif';
import { SuccessCelebration } from '../../../components/animation';
import { agentService } from '../../../lib/api/services/agentService';
import type { AgentJob } from '../../../types/dashboard';
import { JOB_STATUS } from '../status';
import { formatCurrency } from '@/lib/format';

// The details column ends early; an enlarged fragment fills the space below it, reaching under the description
// and towards the sidebar
const CONTOUR: ContourFragment[] = [
    'hidden lg:block top-[50%] left-[calc(50%-180px)] -translate-x-1/2 -translate-y-1/2 -rotate-12 w-[1050px]',
    '-top-24 -right-48 w-[50vw] max-w-[520px]',
];

/** One part of a timestamp (month, weekday, time...) in Lagos time, where the visit happens */
function lagos(date: Date, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('en-NG', { ...options, timeZone: 'Africa/Lagos' }).format(date);
}

export default function AgentJobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [job, setJob] = useState<AgentJob | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        async function fetchJobDetail() {
            if (!id) return;
            try {
                setIsLoading(true);
                setError(null);
                // Fetch accepted jobs and find the one matching the ID
                const response = await agentService.getAcceptedJobs();
                const jobs = response.data || [];
                const found = jobs.find((j: AgentJob) => j.id === id);
                if (!found) {
                    // Try available jobs too
                    const availableResponse = await agentService.getAvailableJobs();
                    const availableJobs = availableResponse.data || [];
                    const foundAvailable = availableJobs.find((j: AgentJob) => j.id === id);
                    if (foundAvailable) {
                        setJob(foundAvailable);
                    } else {
                        setError('Job not found');
                    }
                } else {
                    setJob(found);
                }
            } catch (err) {
                console.error('Failed to fetch job detail:', err);
                setError('Failed to load job details');
            } finally {
                setIsLoading(false);
            }
        }
        fetchJobDetail();
    }, [id]);

    async function handleCompleteJob() {
        if (!id) return;
        try {
            setIsCompleting(true);
            await agentService.completeJob(id, {});
            setJob(prev => prev ? { ...prev, status: 'Completed' as const } : prev);
            setIsSuccessOpen(true);
        } catch (err) {
            console.error('Failed to complete job:', err);
            alert('Failed to complete job. Please try again.');
        } finally {
            setIsCompleting(false);
        }
    }

    async function handleAcceptJob() {
        if (!id) return;
        try {
            setIsAccepting(true);
            await agentService.acceptJob(id);
            setJob(prev => prev ? { ...prev, status: 'Accepted' as const } : prev);
        } catch (err) {
            console.error('Failed to accept job:', err);
            alert('Failed to accept job. Please try again.');
        } finally {
            setIsAccepting(false);
        }
    }

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="size-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Loading job details...</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (error || !job) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <span className="material-symbols-outlined text-5xl text-slate-300">error</span>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">{error || 'Job not found'}</p>
                    <Link to="/agent/my-jobs" className="text-brand-ink font-bold hover:underline">Back to my jobs</Link>
                </div>
            </PageContainer>
        );
    }

    const status = JOB_STATUS[job.status] ?? JOB_STATUS.Open;
    const isOpen = job.status === 'Open';
    const jobDate = new Date(job.date);
    const scheduleMonth = lagos(jobDate, { month: 'short' });
    const scheduleDay = lagos(jobDate, { day: 'numeric' });
    const isToday = lagos(new Date(), { dateStyle: 'short' }) === lagos(jobDate, { dateStyle: 'short' });
    const scheduleTime = lagos(jobDate, { hour: '2-digit', minute: '2-digit', hour12: false });
    const backLink = isOpen ? { to: '/agent/jobs', label: 'Back to job board' } : { to: '/agent/my-jobs', label: 'Back to my jobs' };

    return (
        <PageContainer motif={CONTOUR}>
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link
                    to={backLink.to}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-400 hover:text-brand-ink transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    {backLink.label}
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-border pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-neutral-bg text-muted-foreground">
                            {job.type}
                        </span>
                        <StatusBadge status={status.label} variant={status.variant} />
                        <span className="text-sm text-slate-600 dark:text-slate-400">Ref {job.id.slice(-8).toUpperCase()}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {job.type} — {job.property}
                    </h1>
                </div>
                <div className="flex flex-col md:items-end">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1 font-medium">Payout</p>
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">{formatCurrency(job.earnings)}</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Paid once the job is marked complete</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Mobile Actions */}
                    {job.status === 'Accepted' && (
                        <div className="lg:hidden bg-card rounded-2xl border border-border p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Job actions</h3>
                            <div className="flex gap-3">
                                <button className="flex-1 px-5 py-3 bg-card border border-border-strong text-slate-700 dark:text-white text-sm font-bold rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">flag</span>
                                    Report issue
                                </button>
                                <button
                                    onClick={handleCompleteJob}
                                    disabled={isCompleting}
                                    className="flex-1 px-5 py-3 bg-brand-ink text-on-brand text-sm font-bold rounded-xl hover:bg-brand-ink/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">check_circle</span>
                                    {isCompleting ? 'Completing…' : 'Mark complete'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Job Description */}
                    <section className="bg-card rounded-2xl border border-border p-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">description</span>
                            Job description
                        </h2>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <p className="mb-4">{job.description || 'No description provided.'}</p>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Current Actions - Desktop */}
                    {isOpen && (
                        <div className="bg-card rounded-2xl border border-border p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Take this job</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">It will move to My jobs and your schedule.</p>
                            <button
                                onClick={handleAcceptJob}
                                disabled={isAccepting}
                                className="w-full px-5 py-3 bg-brand-ink text-on-brand text-sm font-bold rounded-xl hover:bg-brand-ink/90 transition-all disabled:opacity-50"
                            >
                                {isAccepting ? 'Accepting…' : 'Accept job'}
                            </button>
                        </div>
                    )}
                    {job.status === 'Accepted' && (
                        <div className="hidden lg:block bg-card rounded-2xl border border-border p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Current actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleCompleteJob}
                                    disabled={isCompleting}
                                    className="w-full px-5 py-3 bg-brand-ink text-on-brand text-sm font-bold rounded-xl hover:bg-brand-ink/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">check_circle</span>
                                    {isCompleting ? 'Completing…' : 'Mark as completed'}
                                </button>
                                <button className="w-full px-5 py-3 bg-card border border-border-strong text-slate-700 dark:text-white text-sm font-bold rounded-xl hover:bg-accent transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined">flag</span>
                                    Report an issue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Schedule */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">schedule</span>
                            Schedule
                        </h3>
                        <div className={`flex items-center gap-4 ${job.status === 'Accepted' ? 'mb-6' : ''}`}>
                            <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-3 w-16">
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{scheduleMonth}</span>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{scheduleDay}</span>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{isToday ? 'Today' : lagos(jobDate, { weekday: 'long' })}</p>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{scheduleTime}</p>
                            </div>
                        </div>
                        {job.status === 'Accepted' && (
                            <button className="w-full py-2.5 border border-border-strong rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-accent transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                                Request reschedule
                            </button>
                        )}
                    </div>

                    {/* Property Details */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">location_on</span>
                            Property details
                        </h3>
                        <p className="font-bold text-slate-900 dark:text-white mb-1">{job.property}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{job.city}</p>
                    </div>

                    {/* Client Details */}
                    <div className="bg-card rounded-2xl border border-border p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">person</span>
                            Client details
                        </h3>
                        <div className={`flex items-center gap-4 ${job.contactPhone ? 'mb-6' : ''}`}>
                            <div className="size-12 rounded-full bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky flex items-center justify-center font-bold text-lg">
                                {job.clientName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{job.clientName}</p>
                            </div>
                        </div>
                        {job.contactPhone && (
                            <a href={`tel:${job.contactPhone}`} className="w-full py-2.5 border border-border-strong text-slate-700 dark:text-slate-200 hover:bg-accent rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">call</span>
                                Call {job.contactPhone}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Job Complete Success Celebration */}
            <SuccessCelebration
                isOpen={isSuccessOpen}
                onClose={() => {
                    setIsSuccessOpen(false);
                    navigate('/agent/my-jobs');
                }}
                title="Job completed"
                description="Your job has been marked as complete. The payout will show in your earnings."
                buttonText="Back to my jobs"
                icon="check_circle"
            />
        </PageContainer>
    );
}
