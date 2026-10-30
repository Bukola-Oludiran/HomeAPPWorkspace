import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../../../components/ConfirmationModal';
import PageContainer from '../../../components/common/PageContainer';
import { maintenanceService } from '../../../lib/api/services';
import type { MaintenanceRequest, MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '../../../types/lease';

// UI types for maintenance request detail
interface UIMaintenanceRequest {
    id: string;
    title: string;
    status: string;
    statusColor: string;
    dateSubmitted: string;
    category: string;
    urgency: string;
    urgencyColor: string;
    urgencyDot: string;
    description: string;
    property: {
        name: string;
        unit: string;
        address: string;
        image: string;
    };
    vendor: {
        name: string;
        type: string;
        icon: string;
    } | null;
    manager: {
        name: string;
        initials: string;
    } | null;
    timeline: Array<{
        date: string;
        title: string;
        description: string;
        icon: string;
        iconColor: string;
    }>;
    messages: Array<{
        id: number;
        from: 'manager' | 'user' | 'vendor';
        name?: string;
        message: string;
        time: string;
    }>;
    images: string[];
}

// Category label and icon mapping
function getCategoryInfo(category: MaintenanceCategory): { label: string; icon: string } {
    const mapping: Record<MaintenanceCategory, { label: string; icon: string }> = {
        PLUMBING: { label: 'Plumbing', icon: 'plumbing' },
        ELECTRICAL: { label: 'Electrical', icon: 'lightbulb' },
        HVAC: { label: 'HVAC', icon: 'hvac' },
        APPLIANCE: { label: 'Appliance', icon: 'kitchen' },
        STRUCTURAL: { label: 'Structural', icon: 'foundation' },
        PEST_CONTROL: { label: 'Pest Control', icon: 'pest_control' },
        CLEANING: { label: 'Cleaning', icon: 'cleaning_services' },
        SECURITY: { label: 'Security', icon: 'lock_open' },
        OTHER: { label: 'Other', icon: 'build' },
    };
    return mapping[category] || { label: category, icon: 'build' };
}

// Priority/urgency mapping
function getUrgencyInfo(priority: MaintenancePriority): { label: string; color: string; dot: string } {
    const mapping: Record<MaintenancePriority, { label: string; color: string; dot: string }> = {
        LOW: { label: 'Low', color: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400' },
        MEDIUM: { label: 'Medium', color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500' },
        HIGH: { label: 'High', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
        EMERGENCY: { label: 'Emergency', color: 'text-red-700 dark:text-red-300', dot: 'bg-red-600' },
    };
    return mapping[priority] || { label: priority, color: 'text-orange-600', dot: 'bg-orange-500' };
}

// Status mapping
function getStatusInfo(status: MaintenanceStatus): { label: string; color: string } {
    const mapping: Record<MaintenanceStatus, { label: string; color: string }> = {
        SUBMITTED: { label: 'Submitted', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' },
        PENDING: { label: 'Pending', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50' },
        ACKNOWLEDGED: { label: 'Scheduled', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50' },
        ASSIGNED: { label: 'Assigned', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800/50' },
        IN_PROGRESS: { label: 'In Progress', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50' },
        ON_HOLD: { label: 'On Hold', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/50' },
        COMPLETED: { label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50' },
        CANCELLED: { label: 'Cancelled', color: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800/50' },
    };
    return mapping[status] || { label: status, color: 'bg-slate-100 text-slate-700' };
}

// Format date for display
function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
}

// Generate timeline from maintenance request status history
function generateTimeline(request: MaintenanceRequest): UIMaintenanceRequest['timeline'] {
    const timeline: UIMaintenanceRequest['timeline'] = [];

    // Always add the submission event
    timeline.push({
        date: formatDateTime(request.createdAt),
        title: 'Request Submitted',
        description: 'You submitted a new maintenance request.',
        icon: 'send',
        iconColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    });

    // Add status-based events
    if (request.status === 'ACKNOWLEDGED' || request.status === 'IN_PROGRESS' || request.status === 'COMPLETED') {
        timeline.unshift({
            date: formatDateTime(request.updatedAt),
            title: 'Request Reviewed',
            description: 'Property manager reviewed the request and assigned it to a vendor.',
            icon: 'assignment_turned_in',
            iconColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
        });
    }

    if (request.status === 'IN_PROGRESS' || request.status === 'COMPLETED') {
        timeline.unshift({
            date: formatDateTime(request.updatedAt),
            title: 'Maintenance In Progress',
            description: 'Technician is working on the issue.',
            icon: 'build',
            iconColor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
        });
    }

    if (request.status === 'COMPLETED' && request.completedAt) {
        timeline.unshift({
            date: formatDateTime(request.completedAt),
            title: 'Maintenance Completed',
            description: 'The maintenance work has been completed.',
            icon: 'check_circle',
            iconColor: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400',
        });
    }

    if (request.status === 'CANCELLED') {
        timeline.unshift({
            date: formatDateTime(request.updatedAt),
            title: 'Request Cancelled',
            description: 'This maintenance request has been cancelled.',
            icon: 'cancel',
            iconColor: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400',
        });
    }

    return timeline;
}

// Transform API data to UI format
function transformMaintenanceRequest(request: MaintenanceRequest): UIMaintenanceRequest {
    const categoryInfo = getCategoryInfo(request.category);
    const urgencyInfo = getUrgencyInfo(request.priority);
    const statusInfo = getStatusInfo(request.status);

    // Format address
    const property = request.lease?.property;
    const address = property?.address;
    const formattedAddress = address && typeof address === 'object'
        ? [address.street, address.city, address.state].filter(Boolean).join(', ')
        : '';

    return {
        id: request.id,
        title: request.title,
        status: statusInfo.label,
        statusColor: statusInfo.color,
        dateSubmitted: formatDate(request.createdAt),
        category: categoryInfo.label,
        urgency: urgencyInfo.label,
        urgencyColor: urgencyInfo.color,
        urgencyDot: urgencyInfo.dot,
        description: request.description,
        property: {
            name: property?.name || 'Property',
            unit: '',
            address: formattedAddress,
            image: '',
        },
        vendor: request.assignedAgent ? {
            name: `${request.assignedAgent.firstName} ${request.assignedAgent.lastName}`,
            type: 'Assigned Agent',
            icon: categoryInfo.icon,
        } : null,
        manager: request.lease?.landlord ? {
            name: `${request.lease.landlord.firstName} ${request.lease.landlord.lastName}`,
            initials: `${request.lease.landlord.firstName?.[0] || ''}${request.lease.landlord.lastName?.[0] || ''}`,
        } : null,
        timeline: generateTimeline(request),
        messages: [], // Messages would come from a separate API endpoint
        images: request.images || [],
    };
}

// Default empty data for loading state
const defaultRequestData: UIMaintenanceRequest = {
    id: '',
    title: 'Loading...',
    status: '',
    statusColor: 'bg-slate-100 text-slate-700',
    dateSubmitted: '',
    category: '',
    urgency: '',
    urgencyColor: '',
    urgencyDot: '',
    description: '',
    property: { name: '', unit: '', address: '', image: '' },
    vendor: null,
    manager: null,
    timeline: [],
    messages: [],
    images: [],
};

export default function TenantMaintenanceDetail() {
    const { id } = useParams();
    const [newMessage, setNewMessage] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);

    // API data state
    const [requestData, setRequestData] = useState<UIMaintenanceRequest>(defaultRequestData);
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
                    setRequestData(transformMaintenanceRequest(response.data));
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
            <PageContainer maxWidth="lg">
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
            <PageContainer maxWidth="lg">
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
        <PageContainer maxWidth="lg">
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => console.log('Request cancelled')}
                title="Cancel Maintenance Request?"
                description="Are you sure you want to cancel this maintenance request? The vendor will be notified and any scheduled visit will be cancelled."
                confirmText="Cancel Request"
                icon="cancel"
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        <Link to="/tenant/my-home" className="hover:text-brand-ink transition-colors">My Home</Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="hover:text-brand-ink transition-colors cursor-pointer">Maintenance</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white">{requestData.title} (#{requestData.id})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {requestData.title}
                        </h1>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${requestData.statusColor} border gap-1.5`}>
                            <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500"></span>
                            {requestData.status}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-canvas-dark hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-bold text-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">upload_file</span>
                        Add Files
                    </button>
                    <button className="px-4 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                        Update
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Request Details */}
                    <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-ink">description</span>
                            Request Details
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                            <div>
                                <span className="block text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Date Submitted</span>
                                <span className="font-bold text-slate-900 dark:text-white">{requestData.dateSubmitted}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Category</span>
                                <span className="font-bold text-slate-900 dark:text-white">{requestData.category}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Urgency</span>
                                <span className={`inline-flex items-center gap-1.5 font-bold ${requestData.urgencyColor}`}>
                                    <span className={`w-2 h-2 rounded-full ${requestData.urgencyDot}`}></span>
                                    {requestData.urgency}
                                </span>
                            </div>
                            <div>
                                <span className="block text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Request ID</span>
                                <span className="font-mono text-slate-500 dark:text-slate-400">#{requestData.id}</span>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Description</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                {requestData.description}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Attached Media</h3>
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {requestData.images.length > 0 ? (
                                    requestData.images.map((image, index) => (
                                        <div key={index} className="relative w-32 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group overflow-hidden cursor-pointer">
                                            <img src={image} alt={`Attachment ${index + 1}`} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                                <span className="material-symbols-outlined">visibility</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="relative w-32 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-400">image</span>
                                    </div>
                                )}
                                <button className="w-32 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-500 hover:text-brand-ink hover:border-brand hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all gap-1">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    <span className="text-xs font-bold uppercase">Add More</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-ink">history</span>
                            Activity Timeline
                        </h2>
                        <ol className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
                            {requestData.timeline.map((event, index) => (
                                <li key={index} className="ml-6">
                                    <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-[1.1rem] ring-4 ring-white dark:ring-canvas-dark ${event.iconColor}`}>
                                        <span className="material-symbols-outlined text-[18px]">{event.icon}</span>
                                    </span>
                                    <h3 className="flex items-center mb-1 text-sm font-bold text-slate-900 dark:text-white">{event.title}</h3>
                                    <time className="block mb-2 text-xs font-normal leading-none text-slate-400">{event.date}</time>
                                    <p className="text-sm font-normal text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        {event.description}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Communication Log */}
                    <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-brand-ink">forum</span>
                            Communication Log
                        </h2>
                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                            {requestData.messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {msg.from === 'manager' && (
                                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                        </div>
                                    )}
                                    {msg.from === 'user' && (
                                        <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shrink-0">
                                            <span className="material-symbols-outlined text-sm">face</span>
                                        </div>
                                    )}
                                    {msg.from === 'vendor' && (
                                        <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                            <span className="material-symbols-outlined text-sm">engineering</span>
                                        </div>
                                    )}
                                    <div className={msg.from === 'user' ? 'flex flex-col items-end' : ''}>
                                        <div className={`p-3.5 rounded-2xl text-sm ${msg.from === 'user'
                                            ? 'bg-brand/10 dark:bg-brand/20 rounded-tr-none text-slate-900 dark:text-white border border-brand/10 dark:border-brand/20'
                                            : msg.from === 'vendor'
                                                ? 'bg-purple-50 dark:bg-purple-900/20 rounded-tl-none text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-purple-800/30'
                                                : 'bg-slate-100 dark:bg-slate-800 rounded-tl-none text-slate-700 dark:text-slate-300'
                                            }`}>
                                            {msg.from === 'vendor' && (
                                                <span className="font-bold block text-purple-700 dark:text-purple-400 text-xs mb-1">{msg.name}</span>
                                            )}
                                            {msg.message}
                                        </div>
                                        <div className={`text-xs text-slate-400 mt-1 ${msg.from === 'user' ? 'pr-1' : 'pl-1'}`}>
                                            {msg.from === 'manager' ? `${msg.name} • ` : msg.from === 'vendor' ? 'System Update • ' : 'You • '}
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="relative">
                            <textarea
                                className="w-full p-3 pr-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none min-h-[50px] resize-none leading-relaxed transition-colors"
                                placeholder="Type a message or update..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button className="absolute right-2 bottom-2 size-8 flex items-center justify-center bg-brand-ink hover:bg-brand-ink/90 text-on-brand rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Property Card */}
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <div className="h-32 bg-slate-200 dark:bg-slate-700 relative">
                            <img
                                alt="Property"
                                className="w-full h-full object-cover"
                                src={requestData.property.image}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-4 text-white">
                                <h3 className="font-bold text-lg leading-tight">{requestData.property.name}</h3>
                                <p className="text-xs opacity-90">{requestData.property.unit}</p>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-3">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
                                <span>{requestData.property.address}</span>
                            </div>
                            <Link
                                to="/tenant/my-home"
                                className="w-full py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors block text-center"
                            >
                                View Property Details
                            </Link>
                        </div>
                    </div>

                    {/* Assigned Vendor */}
                    <div className="bg-white dark:bg-canvas-dark p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Assigned Vendor</h3>
                        {requestData.vendor ? (
                            <>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined">{requestData.vendor.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{requestData.vendor.name}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{requestData.vendor.type}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 bg-brand/10 hover:bg-brand/20 text-brand-ink rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px]">call</span>
                                        Call
                                    </button>
                                    <button className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                                        <span className="material-symbols-outlined text-[16px]">mail</span>
                                        Email
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500 dark:text-slate-400">No vendor assigned yet</p>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Property Manager</h3>
                            {requestData.manager ? (
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">
                                        {requestData.manager.initials}
                                    </div>
                                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">{requestData.manager.name}</h4>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 dark:text-slate-400">Not assigned</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white dark:bg-canvas-dark p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full py-2.5 px-4 rounded-lg bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30 text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Mark as Resolved
                            </button>
                            <button className="w-full py-2.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">event_busy</span>
                                Reschedule
                            </button>
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="w-full py-2.5 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-800/30 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                Cancel Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
