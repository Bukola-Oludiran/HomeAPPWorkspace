import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../../../components/ConfirmationModal';
import PageContainer from '../../../components/common/PageContainer';
import Breadcrumb from '../../../components/common/Breadcrumb';
import { landlordService } from '../../../lib/api/services';
import type { RentalApplication, ApplicationStatus, EmploymentStatus } from '../../../types/lease';

// UI types for applicant detail
interface UIApplicantData {
    id: string;
    name: string;
    initials: string;
    status: string;
    statusColor: string;
    submittedDate: string;
    occupation: string;
    creditScore: number;
    creditRating: string;
    monthlyIncome: string;
    rentCoverage: string;
    identityVerified: boolean;
    property: {
        id: string;
        name: string;
        unit: string;
        location: string;
        rent: string;
        leaseTerm: string;
        image: string;
    };
    screening: {
        completedDate: string;
        criminal: { status: 'pass' | 'warning'; text: string };
        eviction: { status: 'pass' | 'warning'; text: string };
        reference: { status: 'pass' | 'warning'; text: string };
    };
    documents: Array<{
        id: number;
        name: string;
        icon: string;
        uploaded: string;
        status: 'ok' | 'flagged';
        flagReason?: string;
    }>;
    notes: Array<{
        id: number;
        author: string;
        message: string;
        time: string;
    }>;
    timeline: Array<{
        id: number;
        date: string;
        title: string;
        description: string;
        color: string;
    }>;
}

// Format currency
function formatCurrency(amount: number): string {
    if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(1)}k`;
    }
    return `$${amount.toLocaleString()}`;
}

// Format date
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTimelineDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === now.toDateString()) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Get initials from name
function getInitials(firstName?: string | null, lastName?: string | null): string {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

// Get status styling
function getStatusInfo(status: ApplicationStatus): { label: string; color: string } {
    const mapping: Record<ApplicationStatus, { label: string; color: string }> = {
        PENDING: { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
        UNDER_REVIEW: { label: 'Under Review', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
        APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
        REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' },
        WITHDRAWN: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
    };
    return mapping[status] || { label: status, color: 'bg-slate-100 text-slate-800' };
}

// Get occupation from employment status
function getOccupationLabel(status: EmploymentStatus): string {
    const mapping: Record<EmploymentStatus, string> = {
        EMPLOYED: 'Employed',
        SELF_EMPLOYED: 'Self-Employed',
        UNEMPLOYED: 'Unemployed',
        STUDENT: 'Student',
        RETIRED: 'Retired',
    };
    return mapping[status] || status;
}

// Transform API data to UI format
function transformApplicant(app: RentalApplication): UIApplicantData {
    const statusInfo = getStatusInfo(app.status);
    const property = app.property;
    const address = property?.address;
    const location = address && typeof address === 'object'
        ? [address.city, address.state].filter(Boolean).join(', ')
        : '';

    // Calculate rent coverage ratio
    const rentCoverage = property?.price && app.monthlyIncome > 0
        ? (app.monthlyIncome / property.price).toFixed(1)
        : 'N/A';

    return {
        id: app.id,
        name: app.tenant ? `${app.tenant.firstName} ${app.tenant.lastName}` : 'Unknown Applicant',
        initials: getInitials(app.tenant?.firstName, app.tenant?.lastName),
        status: statusInfo.label,
        statusColor: statusInfo.color,
        submittedDate: formatDate(app.createdAt),
        occupation: getOccupationLabel(app.employmentStatus),
        creditScore: 0, // Would come from a screening API
        creditRating: 'N/A', // Would come from a screening API
        monthlyIncome: formatCurrency(app.monthlyIncome),
        rentCoverage: `${rentCoverage}x`,
        identityVerified: false, // Would come from verification API
        property: {
            id: property?.id || '',
            name: property?.name || 'Property',
            unit: '',
            location,
            rent: property?.price ? `$${property.price.toLocaleString()}` : 'N/A',
            leaseTerm: '12 Mos',
            image: '',
        },
        screening: {
            completedDate: 'Pending',
            criminal: { status: 'warning', text: 'Pending' },
            eviction: { status: 'warning', text: 'Pending' },
            reference: { status: 'warning', text: 'Pending' },
        },
        documents: [],
        notes: [],
        timeline: [
            {
                id: 1,
                date: formatTimelineDate(app.createdAt),
                title: 'Application Received',
                description: 'Applicant submitted form.',
                color: 'bg-slate-300 dark:bg-slate-600',
            },
        ],
    };
}

// Default empty data for loading state
const defaultApplicantData: UIApplicantData = {
    id: '',
    name: 'Loading...',
    initials: '',
    status: '',
    statusColor: 'bg-slate-100 text-slate-700',
    submittedDate: '',
    occupation: '',
    creditScore: 0,
    creditRating: '',
    monthlyIncome: '',
    rentCoverage: '',
    identityVerified: false,
    property: { id: '', name: '', unit: '', location: '', rent: '', leaseTerm: '', image: '' },
    screening: {
        completedDate: '',
        criminal: { status: 'warning', text: '' },
        eviction: { status: 'warning', text: '' },
        reference: { status: 'warning', text: '' },
    },
    documents: [],
    notes: [],
    timeline: [],
};

export default function LandlordApplicantDetail() {
    const { id } = useParams();
    const [newNote, setNewNote] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    // API data state
    const [applicantData, setApplicantData] = useState<UIApplicantData>(defaultApplicantData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const rejectApplicant = async () => {
        if (!id) return;
        await landlordService.rejectApplicant(id, 'Application did not meet the current property requirements.');
        setApplicantData(current => ({ ...current, status: 'Rejected', statusColor: 'bg-red-100 text-red-800' }));
        setShowRejectModal(false);
    };

    // Fetch applicant details
    useEffect(() => {
        async function fetchApplicant() {
            if (!id) return;

            try {
                setIsLoading(true);
                setError(null);

                const response = await landlordService.getApplicantById(id);
                if (response.data) {
                    setApplicantData(transformApplicant(response.data));
                }
            } catch (err) {
                console.error('Error fetching applicant:', err);
                setError('Failed to load applicant details');
            } finally {
                setIsLoading(false);
            }
        }

        fetchApplicant();
    }, [id]);

    // Loading state
    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400">Loading applicant details...</p>
                    </div>
                </div>
            </PageContainer>
        );
    }

    // Error state
    if (error) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <ConfirmationModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={rejectApplicant}
                title="Reject Application?"
                description={`Are you sure you want to reject ${applicantData.name}'s application? They will be notified and removed from consideration for this property.`}
                confirmText="Reject Application"
                icon="block"
            />
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: 'Applications', href: '/landlord/tenants' },
                    { label: applicantData.name },
                ]}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{applicantData.name}</h1>
                        <span className={`${applicantData.statusColor} border px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5`}>
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                            {applicantData.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-800 dark:text-slate-400 text-sm md:text-base">
                        <p>Application ID: <span className="font-mono text-slate-700 dark:text-slate-300">#{applicantData.id}</span></p>
                        <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <p>Submitted: {applicantData.submittedDate}</p>
                        <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <Link to="#" className="text-brand hover:underline">{applicantData.property.name}, {applicantData.property.location}</Link>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowRejectModal(true)}
                        className="px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span> Reject
                    </button>
                    <button className="px-5 py-2.5 rounded-lg bg-brand hover:bg-brand/90 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">check</span> Approve Application
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Applicant Summary */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="size-16 rounded-full bg-brand/10 dark:bg-brand/20 text-brand dark:text-blue-300 flex items-center justify-center text-xl font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                                    {applicantData.initials}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Applicant Summary</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{applicantData.occupation}</p>
                                </div>
                            </div>
                            <Link to={`/landlord/tenants/${id}/profile`} className="text-brand text-sm font-bold hover:underline flex items-center gap-1">
                                View Full Profile <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Credit Score</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-extrabold text-green-600 dark:text-green-400">{applicantData.creditScore}</span>
                                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-bold">{applicantData.creditRating}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Monthly Income</p>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{applicantData.monthlyIncome}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Rent Coverage</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">{applicantData.rentCoverage}</span>
                                    <span className="text-xs text-slate-400">Rent</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Identity</p>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">Verified</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Screening */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-canvas-dark">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">policy</span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Background Screening</h3>
                            </div>
                            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2.5 py-0.5 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
                                Completed {applicantData.screening.completedDate}
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-full flex items-center justify-center ${applicantData.screening.criminal.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                                        <span className="material-symbols-outlined text-lg">{applicantData.screening.criminal.status === 'pass' ? 'check' : 'warning'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Criminal History</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{applicantData.screening.criminal.text}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-full flex items-center justify-center ${applicantData.screening.eviction.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                                        <span className="material-symbols-outlined text-lg">{applicantData.screening.eviction.status === 'pass' ? 'check' : 'warning'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Eviction History</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{applicantData.screening.eviction.text}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-full flex items-center justify-center ${applicantData.screening.reference.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                                        <span className="material-symbols-outlined text-lg">{applicantData.screening.reference.status === 'pass' ? 'check' : 'warning'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Reference Check</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{applicantData.screening.reference.text}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <button className="text-brand text-sm font-bold hover:underline flex items-center gap-1">
                                    View Detailed Report
                                </button>
                                <button className="text-slate-500 text-sm font-medium hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
                                    Download PDF <span className="material-symbols-outlined text-sm">download</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Submitted Documents */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-canvas-dark">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">folder_open</span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Submitted Documents</h3>
                            </div>
                            <button className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px]">add</span> Request Missing
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {applicantData.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className={`border rounded-lg p-3 flex items-center gap-3 transition-colors group ${doc.status === 'flagged'
                                            ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-brand/50'
                                            }`}
                                    >
                                        <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${doc.status === 'flagged' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                                            <span className="material-symbols-outlined">{doc.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                                            {doc.status === 'flagged' ? (
                                                <p className="text-xs text-red-500 font-medium">Flagged: {doc.flagReason}</p>
                                            ) : (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded {doc.uploaded}</p>
                                            )}
                                        </div>
                                        {doc.status === 'flagged' ? (
                                            <button className="text-xs font-bold text-brand hover:underline whitespace-nowrap">Resend Request</button>
                                        ) : (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-brand">
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                </button>
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-brand">
                                                    <span className="material-symbols-outlined text-lg">download</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-canvas-dark">
                            <span className="material-symbols-outlined text-slate-400">lock</span>
                            <h3 className="font-bold text-slate-900 dark:text-white">Internal Notes</h3>
                            <span className="text-xs text-slate-400 font-normal ml-auto">Visible only to team</span>
                        </div>
                        <div className="p-6">
                            <div className="space-y-4 mb-6">
                                {applicantData.notes.map((note) => (
                                    <div key={note.id} className="flex gap-3">
                                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-xs font-bold">{note.author}</div>
                                        <div className="flex-1">
                                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300">
                                                {note.message}
                                            </div>
                                            <p className="text-xs text-slate-400 mt-1 pl-1">{note.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="relative">
                                <textarea
                                    className="w-full p-3 pr-12 bg-white dark:bg-canvas-dark border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none resize-none transition-colors"
                                    placeholder="Add a private note..."
                                    rows={2}
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <button className="absolute right-2 bottom-2 p-1.5 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="flex flex-col gap-6">
                    {/* Property Card */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
                        <div className="relative h-40 w-full overflow-hidden">
                            <img
                                alt="Property"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={applicantData.property.image}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-4 text-white">
                                <h3 className="font-bold text-base shadow-sm">{applicantData.property.name}</h3>
                                <p className="text-xs opacity-90">{applicantData.property.unit} • {applicantData.property.location}</p>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
                            <div className="text-center px-2">
                                <p className="text-xs text-slate-500 uppercase font-bold">Monthly Rent</p>
                                <p className="text-base font-bold text-slate-900 dark:text-white">{applicantData.property.rent}</p>
                            </div>
                            <div className="text-center px-2">
                                <p className="text-xs text-slate-500 uppercase font-bold">Lease Term</p>
                                <p className="text-base font-bold text-slate-900 dark:text-white">{applicantData.property.leaseTerm}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider opacity-70">Quick Actions</h3>
                        <div className="flex flex-col gap-2.5">
                            <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3 group">
                                <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center group-hover:text-brand transition-colors">
                                    <span className="material-symbols-outlined text-lg">mail</span>
                                </div>
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-brand">Send Message</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3 group">
                                <div className="size-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center group-hover:text-brand transition-colors">
                                    <span className="material-symbols-outlined text-lg">calendar_month</span>
                                </div>
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-brand">Schedule Interview</span>
                            </button>
                            <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-brand hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3 group">
                                <div className="size-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center group-hover:text-brand transition-colors">
                                    <span className="material-symbols-outlined text-lg">history_edu</span>
                                </div>
                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-brand">Draft Lease</span>
                            </button>
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-5">Timeline</h3>
                        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
                            {applicantData.timeline.map((event) => (
                                <div key={event.id} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-0 size-4 ${event.color} rounded-full border-4 border-white dark:border-canvas-dark`}></div>
                                    <p className="text-xs text-slate-400 font-mono mb-0.5">{event.date}</p>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{event.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insight */}
                    <div className="bg-brand rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-yellow-300">lightbulb</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Insight</span>
                            </div>
                            <h4 className="font-bold text-sm leading-tight mb-2">Analyze Applicant Risk</h4>
                            <p className="text-xs text-blue-100 mb-3">Ask HomeAI to summarize financial health or compare with other applicants.</p>
                            <button className="cursor-pointer inline-block w-full py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold text-xs rounded-lg transition-colors text-center">Ask Assistant</button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
