import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import WithdrawApplicationModal from '../../../components/WithdrawApplicationModal';
import PageContainer from '../../../components/common/PageContainer';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { tenantService } from '../../../lib/api/services/tenantService';
import type { RentalApplication } from '../../../types/lease';

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function getStatusStyles(status: string) {
    switch (status) {
        case 'APPROVED':
            return { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800', icon: 'check_circle', label: 'Approved' };
        case 'REJECTED':
            return { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800', icon: 'cancel', label: 'Rejected' };
        case 'UNDER_REVIEW':
            return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800', icon: 'visibility', label: 'Under Review' };
        case 'WITHDRAWN':
            return { color: 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200 dark:border-slate-800', icon: 'undo', label: 'Withdrawn' };
        case 'PENDING':
        default:
            return { color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800', icon: 'info', label: 'Pending' };
    }
}

function formatEmploymentStatus(status: string): string {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function TenantApplicationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState<RentalApplication | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    useEffect(() => {
        async function fetchApplication() {
            if (!id) return;
            try {
                setIsLoading(true);
                setError(null);
                const response = await tenantService.getApplications();
                const applications = response.data || [];
                const found = applications.find((app: RentalApplication) => app.id === id);
                if (found) {
                    setApplication(found);
                } else {
                    setError('Application not found');
                }
            } catch (err) {
                console.error('Failed to fetch application:', err);
                setError('Failed to load application details');
            } finally {
                setIsLoading(false);
            }
        }
        fetchApplication();
    }, [id]);

    async function handleWithdraw() {
        if (!id) return;
        try {
            await tenantService.withdrawApplication(id);
            setApplication(prev => prev ? { ...prev, status: 'WITHDRAWN' as const } : prev);
            setIsWithdrawModalOpen(false);
            navigate('/tenant/applications');
        } catch (err) {
            console.error('Failed to withdraw application:', err);
            alert('Failed to withdraw application. Please try again.');
        }
    }

    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="flex flex-col items-center gap-3">
                        <div className="size-10 border-4 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-medium">Loading application...</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    if (error || !application) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                    <span className="material-symbols-outlined text-5xl text-slate-300">error</span>
                    <p className="text-slate-500 font-medium">{error || 'Application not found'}</p>
                    <Link to="/tenant/applications" className="text-[#137fec] font-bold hover:underline">Back to Applications</Link>
                </div>
            </PageContainer>
        );
    }

    const statusStyles = getStatusStyles(application.status);
    const propertyName = application.property?.name || 'Property';
    const propertyLocation = application.property?.address
        ? `${application.property.address.city}, ${application.property.address.state}`
        : '';
    const submittedDate = new Date(application.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const canWithdraw = application.status === 'PENDING' || application.status === 'UNDER_REVIEW';

    return (
        <PageContainer>
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: 'Applications', href: '/tenant/applications' },
                    { label: 'Details' },
                ]}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Your Application for {propertyName}
                        </h1>
                        <span className={`${statusStyles.color} border px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5`}>
                            <span className="material-symbols-outlined text-[16px]">{statusStyles.icon}</span>
                            {statusStyles.label}
                        </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-300 text-lg">
                        Application ID: <span className="font-mono text-slate-800 dark:text-slate-300">#{application.id}</span> • Submitted on {submittedDate}
                    </p>
                </div>
                {canWithdraw && (
                    <div className="flex gap-3">
                        <button
                            onClick={() => setIsWithdrawModalOpen(true)}
                            className="px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            Withdraw Application
                        </button>
                    </div>
                )}
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Rejection Reason Banner */}
                    {application.status === 'REJECTED' && application.rejectionReason && (
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start">
                            <div className="size-10 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined">cancel</span>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Application Rejected</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm">
                                    {application.rejectionReason}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Application Message */}
                    {application.message && (
                        <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-[#101922]">
                                <span className="material-symbols-outlined text-slate-400">comment</span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Your Message</h3>
                            </div>
                            <div className="p-6">
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    {application.message}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Submitted Information */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#101922]">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">description</span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Submitted Information</h3>
                            </div>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {/* Personal Details */}
                            {application.tenant && (
                                <div className="p-6">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 opacity-70">Personal Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Full Name</p>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{application.tenant.firstName} {application.tenant.lastName}</p>
                                        </div>
                                        {application.tenant.email && (
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email Address</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{application.tenant.email}</p>
                                            </div>
                                        )}
                                        {application.tenant.phone && (
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phone Number</p>
                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{application.tenant.phone}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Employment & Income */}
                            <div className="p-6">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 opacity-70">Employment & Income</h4>
                                <div className="flex items-start gap-4">
                                    <div className="size-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                        <span className="material-symbols-outlined">work</span>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-900 dark:text-white">{formatEmploymentStatus(application.employmentStatus)}</h5>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Monthly Income</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(application.monthlyIncome)}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Desired Move-in</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                    {new Date(application.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="flex flex-col gap-6">
                    {/* Property Card */}
                    {application.property && (
                        <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
                            {application.property.primaryImage && (
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img
                                        alt={propertyName}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={application.property.primaryImage}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                                        <h3 className="text-white font-bold text-lg">{propertyName}</h3>
                                        <p className="text-white/80 text-sm">{propertyLocation} • {application.property.bedrooms} Bed, {application.property.bathrooms} Bath</p>
                                    </div>
                                </div>
                            )}
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Price</p>
                                        <p className="text-xl font-extrabold text-slate-900 dark:text-white">{formatCurrency(application.property.price)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Per</p>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{application.property.priceUnit}</p>
                                    </div>
                                </div>
                                <Link
                                    to={`/property/${application.propertyId}`}
                                    className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors block text-center"
                                >
                                    View Full Listing
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Application Timeline */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-5">Application Timeline</h3>
                        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 size-4 rounded-full border-4 border-white dark:border-[#101922] bg-amber-500"></div>
                                <p className="text-xs text-slate-400 font-mono mb-0.5">
                                    {new Date(application.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{statusStyles.label}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Current status</p>
                            </div>
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 size-4 rounded-full border-4 border-white dark:border-[#101922] bg-slate-300 dark:bg-slate-600"></div>
                                <p className="text-xs text-slate-400 font-mono mb-0.5">{submittedDate}</p>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Application Submitted</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">You completed the application form.</p>
                            </div>
                        </div>
                    </div>

                    {/* AI Assistant Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12">assistant</span>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Assistant</span>
                            </div>
                            <h4 className="font-bold text-sm leading-tight mb-2">Have questions about this application?</h4>
                            <p className="text-xs text-indigo-100 mb-3">Ask HomeAI about typical wait times or clarification on the landlord's request.</p>
                            <button className="cursor-pointer inline-block w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold text-xs rounded-lg transition-colors text-center">Ask Assistant</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdraw Application Modal */}
            <WithdrawApplicationModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                onConfirm={handleWithdraw}
                propertyName={propertyName}
            />
        </PageContainer>
    );
}
