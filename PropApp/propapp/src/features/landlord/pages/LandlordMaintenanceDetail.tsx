import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import { maintenanceService } from '../../../lib/api/services';
import type { MaintenanceRequest, MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '../../../types/lease';

// UI types for maintenance request detail
interface UIMaintenanceRequest {
    id: string;
    title: string;
    status: string;
    statusLabel: string;
    statusColor: string;
    urgency: string;
    urgencyLabel: string;
    submittedDate: string;
    property: {
        id: string;
        name: string;
        location: string;
        image: string;
    };
    tenant: {
        id: string;
        name: string;
        initials: string;
        verified: boolean;
        leaseEnd: string;
    } | null;
    description: string;
    vendor: {
        id: string;
        phone: string;
        name: string;
        icon: string;
    } | null;
    estimatedCost: string;
    timeline: Array<{
        id: number;
        time: string;
        title: string;
        description: string;
        color: string;
    }>;
    messages: Array<{
        id: number;
        from: 'tenant' | 'landlord';
        name: string;
        initials?: string;
        time: string;
        text: string;
    }>;
    images: string[];
}

// Category icon mapping
function getCategoryIcon(category: MaintenanceCategory): string {
    const mapping: Record<MaintenanceCategory, string> = {
        PLUMBING: 'plumbing',
        ELECTRICAL: 'lightbulb',
        HVAC: 'hvac',
        APPLIANCE: 'kitchen',
        STRUCTURAL: 'foundation',
        PEST_CONTROL: 'pest_control',
        CLEANING: 'cleaning_services',
        SECURITY: 'lock_open',
        OTHER: 'build',
    };
    return mapping[category] || 'build';
}

// Priority/urgency mapping
function getUrgencyInfo(priority: MaintenancePriority): { label: string; color: string } {
    const mapping: Record<MaintenancePriority, { label: string; color: string }> = {
        LOW: { label: 'Low priority', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' },
        MEDIUM: { label: 'Medium priority', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border-orange-200 dark:border-orange-800' },
        HIGH: { label: 'High urgency', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800' },
        EMERGENCY: { label: 'Emergency', color: 'bg-red-200 text-red-800 dark:bg-red-900/60 dark:text-red-200 border-red-300 dark:border-red-700' },
    };
    return mapping[priority] || { label: priority, color: 'bg-orange-100 text-orange-700' };
}

// Status mapping
function getStatusInfo(status: MaintenanceStatus): { label: string; color: string } {
    const mapping: Record<MaintenanceStatus, { label: string; color: string }> = {
        SUBMITTED: { label: 'New', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
        PENDING: { label: 'Pending', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
        ACKNOWLEDGED: { label: 'In review', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
        ASSIGNED: { label: 'Assigned', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
        IN_PROGRESS: { label: 'In progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
        ON_HOLD: { label: 'On hold', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800' },
        COMPLETED: { label: 'Resolved', color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 border-green-200 dark:border-green-800' },
        CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300 border-gray-200 dark:border-gray-800' },
    };
    return mapping[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
}

// Format date for display
function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    if (isToday) {
        return `Today, ${timeStr}`;
    }
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${timeStr}`;
}

function formatSubmittedDate(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}

// Generate timeline from maintenance request
function generateTimeline(request: MaintenanceRequest): UIMaintenanceRequest['timeline'] {
    const timeline: UIMaintenanceRequest['timeline'] = [];
    let idCounter = 1;

    // Add events based on status progression
    if (request.status === 'COMPLETED' && request.completedAt) {
        timeline.push({
            id: idCounter++,
            time: formatDateTime(request.completedAt),
            title: 'Request resolved',
            description: 'The maintenance work has been completed.',
            color: 'bg-green-500',
        });
    }

    if (request.status === 'IN_PROGRESS' || request.status === 'COMPLETED') {
        timeline.push({
            id: idCounter++,
            time: formatDateTime(request.updatedAt),
            title: 'Maintenance in progress',
            description: 'Work is being performed on this request.',
            color: 'bg-amber-500',
        });
    }

    if (request.assignedAgent) {
        timeline.push({
            id: idCounter++,
            time: formatDateTime(request.updatedAt),
            title: 'Vendor assigned',
            description: `${request.assignedAgent.firstName} ${request.assignedAgent.lastName} has been assigned to this request.`,
            color: 'bg-blue-500',
        });
    }

    if (request.status !== 'PENDING') {
        timeline.push({
            id: idCounter++,
            time: formatDateTime(request.updatedAt),
            title: 'Viewed by landlord',
            description: "Status changed from 'New' to 'In Review'.",
            color: 'bg-slate-300 dark:bg-slate-600',
        });
    }

    // Always add submission event
    timeline.push({
        id: idCounter++,
        time: formatDateTime(request.createdAt),
        title: 'Request submitted',
        description: 'Tenant submitted a new maintenance request.',
        color: 'bg-slate-300 dark:bg-slate-600',
    });

    return timeline;
}

// Get initials from name
function getInitials(firstName?: string | null, lastName?: string | null): string {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
}

// Transform API data to UI format
function transformMaintenanceRequest(request: MaintenanceRequest): UIMaintenanceRequest {
    const statusInfo = getStatusInfo(request.status);
    const urgencyInfo = getUrgencyInfo(request.priority);

    const property = request.lease?.property;
    const tenant = request.lease?.tenant;
    const address = property?.address;

    const formattedLocation = address && typeof address === 'object'
        ? [address.city, address.state].filter(Boolean).join(', ')
        : '';

    return {
        id: request.id,
        title: request.title,
        status: request.status,
        statusLabel: statusInfo.label,
        statusColor: statusInfo.color,
        urgency: request.priority,
        urgencyLabel: urgencyInfo.label,
        submittedDate: formatSubmittedDate(request.createdAt),
        property: {
            id: property?.id || '',
            name: property?.name || 'Property',
            location: formattedLocation,
            image: property?.primaryImage || '',
        },
        tenant: tenant ? {
            id: tenant.id,
            name: `${tenant.firstName} ${tenant.lastName}`,
            initials: getInitials(tenant.firstName, tenant.lastName),
            verified: false, // Would come from full tenant data if available
            leaseEnd: '',
        } : null,
        description: `"${request.description}"`,
        vendor: request.assignedAgent ? {
            id: request.assignedAgent.id,
            phone: request.assignedAgent.phone || '',
            name: `${request.assignedAgent.firstName} ${request.assignedAgent.lastName}`,
            icon: getCategoryIcon(request.category),
        } : null,
        estimatedCost: 'TBD',
        timeline: generateTimeline(request),
        messages: [], // Messages would come from a separate API
        images: request.images || [],
    };
}

// Default empty data for loading state
const defaultMaintenanceRequest: UIMaintenanceRequest = {
    id: '',
    title: 'Loading...',
    status: '',
    statusLabel: '',
    statusColor: 'bg-slate-100 text-slate-700',
    urgency: '',
    urgencyLabel: '',
    submittedDate: '',
    property: { id: '', name: '', location: '', image: '' },
    tenant: null,
    description: '',
    vendor: null,
    estimatedCost: '',
    timeline: [],
    messages: [],
    images: [],
};

export default function LandlordMaintenanceDetail() {
    const { id } = useParams();

    // API data state
    const [maintenanceRequest, setMaintenanceRequest] = useState<UIMaintenanceRequest>(defaultMaintenanceRequest);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch maintenance request details
    useEffect(() => {
        async function fetchMaintenanceRequest() {
            if (!id) return;

            try {
                setIsLoading(true);
                setError(null);

                const response = await maintenanceService.getMaintenanceRequestById(id);
                if (response.data) {
                    setMaintenanceRequest(transformMaintenanceRequest(response.data));
                }
            } catch (err) {
                console.error('Error fetching maintenance request:', err);
                setError('Failed to load maintenance request details');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMaintenanceRequest();
    }, [id]);

    // Loading state
    if (isLoading) {
        return (
            <PageContainer>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                        <p className="text-slate-500 dark:text-slate-400">Loading maintenance request...</p>
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
                            Try again
                        </button>
                    </div>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-400 mb-6">
                <Link to="/landlord/dashboard" className="hover:text-brand-ink transition-colors">Dashboard</Link>
                <span className="material-symbols-outlined text-[16px] text-slate-800 dark:text-slate-400">chevron_right</span>
                <Link to="/landlord/alerts" className="hover:text-brand-ink transition-colors">Maintenance</Link>
                <span className="material-symbols-outlined text-[16px] text-slate-800 dark:text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">{maintenanceRequest.title}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {maintenanceRequest.title}
                        </h1>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            {maintenanceRequest.statusLabel}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">priority_high</span>
                            {maintenanceRequest.urgencyLabel}
                        </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-800">
                        Reference {maintenanceRequest.id.slice(-8).toUpperCase()} • Submitted on {maintenanceRequest.submittedDate}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 bg-slate-50">
                        <span className="material-symbols-outlined text-[20px]">cancel</span>
                        Cancel request
                    </button>
                    <button className="px-5 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Mark as Resolved
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Property & Tenant Info */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                            <div className="p-6 flex gap-4 items-start">
                                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                                    {maintenanceRequest.property.image && (
                                        <img
                                            alt={maintenanceRequest.property.name}
                                            className="w-full h-full object-cover"
                                            src={maintenanceRequest.property.image}
                                        />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Property</h3>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{maintenanceRequest.property.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{maintenanceRequest.property.location}</p>
                                    <Link to={`/landlord/properties/${maintenanceRequest.property.id}`} className="text-sm font-semibold text-brand-ink hover:underline flex items-center gap-1">
                                        View Property Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Tenant details</h3>
                                {maintenanceRequest.tenant ? (
                                    <>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                                                {maintenanceRequest.tenant.initials}
                                            </div>
                                            <div>
                                                <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                    <Link to={`/member/${maintenanceRequest.tenant.id}`} className="hover:text-brand-ink hover:underline underline-offset-2">
                                                        {maintenanceRequest.tenant.name}
                                                    </Link>
                                                    {maintenanceRequest.tenant.verified && (
                                                        <span className="material-symbols-outlined text-blue-500 text-[16px]" title="Verified tenant">verified</span>
                                                    )}
                                                </h4>
                                                {maintenanceRequest.tenant.leaseEnd && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Lease ends {maintenanceRequest.tenant.leaseEnd}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors">
                                                <span className="material-symbols-outlined text-[16px] text-slate-800 dark:text-slate-400">call</span> Call
                                            </button>
                                            <button className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors">
                                                <span className="material-symbols-outlined text-[16px] text-slate-800 dark:text-slate-400">mail</span> Message
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Tenant information not available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Request Details */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">description</span>
                            Request details
                        </h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {maintenanceRequest.description}
                            </p>
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Attached media</h4>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            <div className="relative group w-32 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700">
                                    <span className="material-symbols-outlined">image</span>
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button className="text-white hover:text-brand-ink transition-colors"><span className="material-symbols-outlined">visibility</span></button>
                                    <button className="text-white hover:text-brand-ink transition-colors"><span className="material-symbols-outlined">download</span></button>
                                </div>
                            </div>
                            <div className="relative group w-32 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                <div className="w-full h-full flex items-center justify-center text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-700">
                                    <span className="material-symbols-outlined">videocam</span>
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button className="text-white hover:text-brand-ink transition-colors"><span className="material-symbols-outlined">play_circle</span></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">history</span>
                                Activity timeline
                            </h3>
                            <button className="text-xs font-bold text-brand-ink hover:underline">Add note</button>
                        </div>
                        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
                            {maintenanceRequest.timeline.map((item) => (
                                <div key={item.id} className="relative">
                                    <div className={`absolute -left-[31px] top-1 size-4 rounded-full ${item.color} border-4 border-white dark:border-canvas-dark`}></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-0.5">{item.time}</p>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Communication Log */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">forum</span>
                            Communication log
                        </h3>
                        <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {maintenanceRequest.messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.from === 'landlord' ? 'flex-row-reverse' : ''}`}>
                                    {msg.from === 'tenant' ? (
                                        <div className="size-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-xs font-bold text-slate-600 mt-1">
                                            {msg.initials}
                                        </div>
                                    ) : (
                                        <div className="size-8 rounded-full bg-brand-ink shrink-0 flex items-center justify-center text-on-brand mt-1">
                                            <span className="material-symbols-outlined text-[16px]">person</span>
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-2xl ${msg.from === 'tenant'
                                        ? 'bg-slate-50 dark:bg-slate-800 rounded-tl-none'
                                        : 'bg-blue-50 dark:bg-blue-900/20 rounded-tr-none border border-blue-100 dark:border-blue-800'
                                        }`}>
                                        <div className="flex justify-between items-center mb-1 gap-4">
                                            <span className={`text-xs font-bold ${msg.from === 'landlord' ? 'text-brand-ink dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                                {msg.name}
                                            </span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">{msg.time}</span>
                                        </div>
                                        <p className={`text-sm ${msg.from === 'landlord' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {msg.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type a message or internal note..."
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                                <button className="absolute right-2 top-1.5 p-1.5 bg-brand-ink text-on-brand rounded-lg hover:bg-brand-ink/90 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                </button>
                            </div>
                            <div className="flex gap-4 mt-2 px-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="msg-type" defaultChecked className="text-brand-ink focus:ring-brand" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Message tenant</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="msg-type" className="text-amber-500 focus:ring-amber-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Internal note</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sticky top-24">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button className="w-full py-3 px-4 bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm rounded-xl transition-all flex items-center justify-between group">
                                Schedule maintenance
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">calendar_clock</span>
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:border-brand hover:text-brand-ink text-slate-800 dark:text-slate-300 font-bold text-sm rounded-xl transition-all flex items-center justify-between">
                                Send update to tenant
                                <span className="material-symbols-outlined text-slate-800 dark:text-slate-400">send</span>
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 text-slate-800 dark:text-slate-300 font-bold text-sm rounded-xl transition-all flex items-center justify-between">
                                Report issue with vendor
                                <span className="material-symbols-outlined text-slate-800 dark:text-slate-400">flag</span>
                            </button>
                        </div>
                        <hr className="my-5 border-slate-100 dark:border-slate-800" />

                        {/* Assigned Vendor */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assigned vendor</h3>
                                <button className="text-xs font-bold text-brand-ink hover:underline">
                                    {maintenanceRequest.vendor ? 'Change' : 'Assign'}
                                </button>
                            </div>
                            {maintenanceRequest.vendor ? (
                                <>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="size-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 shadow-sm">
                                                <span className="material-symbols-outlined">{maintenanceRequest.vendor.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                                    <Link to={`/agent/${maintenanceRequest.vendor.id}`} className="hover:text-brand-ink hover:underline underline-offset-2">
                                                        {maintenanceRequest.vendor.name}
                                                    </Link>
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Assigned agent</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {maintenanceRequest.vendor.phone && (
                                                <a href={`tel:${maintenanceRequest.vendor.phone}`} className="flex-1 py-1.5 text-center bg-card border border-border-strong rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-accent transition-colors">
                                                    Call
                                                </a>
                                            )}
                                            <Link to={`/agent/${maintenanceRequest.vendor.id}`} className="flex-1 py-1.5 text-center bg-card border border-border-strong rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-accent transition-colors">
                                                View profile
                                            </Link>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 text-center">
                                    <span className="material-symbols-outlined text-3xl text-slate-300 dark:text-slate-600 mb-2">person_add</span>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No vendor assigned yet</p>
                                    <button className="mt-3 px-4 py-2 bg-brand-ink hover:bg-brand-ink/90 text-on-brand text-xs font-bold rounded-lg transition-colors">
                                        Assign vendor
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Estimated Cost */}
                    <div className="bg-card rounded-xl border border-border p-5">
                        <h4 className="font-bold text-base text-slate-900 dark:text-white mb-1">Estimated cost</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Added once the assigned agent sends a quote.</p>
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{maintenanceRequest.estimatedCost === 'TBD' ? 'Not quoted yet' : maintenanceRequest.estimatedCost}</h3>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
