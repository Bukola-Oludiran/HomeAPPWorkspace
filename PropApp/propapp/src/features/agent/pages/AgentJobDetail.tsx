import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import { SuccessCelebration } from '../../../components/animation';
import { agentService } from '../../../lib/api/services/agentService';
import type { AgentJob } from '../../../types/dashboard';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function getStatusStyles(status: string) {
    switch (status) {
        case 'Accepted':
            return { bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-700 dark:text-amber-500', border: 'border-amber-200 dark:border-amber-800', label: 'In Progress', icon: 'sync', animate: true };
        case 'Completed':
            return { bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-700 dark:text-green-500', border: 'border-green-200 dark:border-green-800', label: 'Completed', icon: 'check_circle', animate: false };
        case 'Cancelled':
            return { bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-700 dark:text-red-500', border: 'border-red-200 dark:border-red-800', label: 'Cancelled', icon: 'cancel', animate: false };
        case 'Open':
        default:
            return { bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-700 dark:text-blue-500', border: 'border-blue-200 dark:border-blue-800', label: 'Open', icon: 'schedule', animate: false };
    }
}

export default function AgentJobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);
    const [job, setJob] = useState<AgentJob | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCompleting, setIsCompleting] = useState(false);

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

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="size-10 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Loading job details...</p>
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
                    <p className="text-slate-500 font-medium">{error || 'Job not found'}</p>
                    <Link to="/agent/my-jobs" className="text-[#137fec] font-bold hover:underline">Back to My Jobs</Link>
                </div>
            </PageContainer>
        );
    }

    const statusStyles = getStatusStyles(job.status);
    const jobDate = new Date(job.date);
    const scheduleMonth = jobDate.toLocaleDateString('en-US', { month: 'short' });
    const scheduleDay = jobDate.getDate().toString();
    const isToday = new Date().toDateString() === jobDate.toDateString();
    const scheduleTime = jobDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    return (
        <PageContainer>
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link
                    to="/agent/my-jobs"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-400 hover:text-[#137fec] transition-colors"
                >
                    <span className="material-symbols-outlined text-lg text-slate-800 dark:text-slate-400">arrow_back</span>
                    Back to My Jobs
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                            {job.type}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusStyles.bg} ${statusStyles.color} border ${statusStyles.border}`}>
                            <span className={`material-symbols-outlined text-[14px]${statusStyles.animate ? ' animate-spin' : ''}`} style={statusStyles.animate ? { animationDuration: '3s' } : undefined}>{statusStyles.icon}</span>
                            {statusStyles.label}
                        </span>
                        <span className="text-sm text-slate-800">Job ID: #{job.id}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {job.type} — {job.property}
                    </h1>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-sm text-slate-800 dark:text-slate-400 mb-1 font-medium">Total Payment</p>
                    <span className="text-3xl font-extrabold text-[#137fec]">{formatCurrency(job.earnings)}</span>
                    <p className="text-xs text-slate-800 mt-1">Payment released upon completion</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Mobile Actions */}
                    {job.status === 'Accepted' && (
                        <div className="lg:hidden bg-white dark:bg-[#101922] rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6 shadow-sm">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Job Actions</h3>
                            <div className="flex gap-3">
                                <button className="flex-1 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">warning</span>
                                    Report Issue
                                </button>
                                <button
                                    onClick={handleCompleteJob}
                                    disabled={isCompleting}
                                    className="flex-1 px-5 py-3 bg-[#137fec] text-white text-sm font-bold rounded-xl hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">check_circle</span>
                                    {isCompleting ? 'Completing...' : 'Mark Complete'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Job Description */}
                    <section className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">description</span>
                            Job Description
                        </h2>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <p className="mb-4">{job.description || 'No description provided.'}</p>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Current Actions - Desktop */}
                    {job.status === 'Accepted' && (
                        <div className="hidden lg:block bg-white dark:bg-[#101922] rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Current Actions</h3>
                            <div className="space-y-3">
                                <button
                                    onClick={handleCompleteJob}
                                    disabled={isCompleting}
                                    className="w-full px-5 py-3 bg-[#137fec] text-white text-sm font-bold rounded-xl hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">check_circle</span>
                                    {isCompleting ? 'Completing...' : 'Mark as Completed'}
                                </button>
                                <button className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-amber-500">warning</span>
                                    Report an Issue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Schedule */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">schedule</span>
                            Schedule
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-3 w-16">
                                <span className="text-xs font-bold text-slate-500 uppercase">{scheduleMonth}</span>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{scheduleDay}</span>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{isToday ? 'Today' : jobDate.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{scheduleTime}</p>
                            </div>
                        </div>
                        <button className="w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-slate-800 dark:text-slate-400">calendar_clock</span>
                            Request Reschedule
                        </button>
                    </div>

                    {/* Property Details */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">location_on</span>
                            Property Details
                        </h3>
                        <p className="font-bold text-slate-900 dark:text-white mb-1">{job.property}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{job.city}</p>
                    </div>

                    {/* Client Details */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">person</span>
                            Client Details
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                {job.clientName.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{job.clientName}</p>
                            </div>
                        </div>
                        {job.contactPhone && (
                            <div className="flex gap-3">
                                <a href={`tel:${job.contactPhone}`} className="flex-1 py-2.5 bg-[#137fec]/10 text-[#137fec] hover:bg-[#137fec]/20 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">call</span>
                                    Call
                                </a>
                                <button className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px] text-slate-800 dark:text-slate-400">chat</span>
                                    Message
                                </button>
                            </div>
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
                title="Job Completed!"
                description="Great work! Your job has been marked as complete. Payment will be released within 24-48 hours."
                buttonText="Back to My Jobs"
                icon="check_circle"
            />
        </PageContainer>
    );
}
