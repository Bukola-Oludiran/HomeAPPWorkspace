import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MaintenanceRequestModal from '../../../components/MaintenanceRequestModal';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import { maintenanceService } from '../../../lib/api/services';
import type { MaintenanceRequest, MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from '../../../types/lease';

// UI types for maintenance requests
interface UIMaintenanceRequest {
    id: string;
    title: string;
    description: string;
    category: string;
    categoryIcon: string;
    categoryBg: string;
    categoryColor: string;
    property: string;
    unit: string;
    dateSubmitted: string;
    timeSubmitted: string;
    urgency: string;
    urgencyColor: string;
    urgencyDot: string;
    urgencyPing: boolean;
    status: string;
    statusBg: string;
    statusColor: string;
    statusBorder: string;
    hasPhotos: boolean;
    photoCount: number;
    scheduledDate?: string;
    isNew?: boolean;
    isCompleted?: boolean;
}

// Category mapping for icons and colors
function getCategoryStyle(category: MaintenanceCategory): { icon: string; bg: string; color: string; label: string } {
    const styles: Record<MaintenanceCategory, { icon: string; bg: string; color: string; label: string }> = {
        PLUMBING: { icon: 'plumbing', bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-500', label: 'Plumbing' },
        ELECTRICAL: { icon: 'lightbulb', bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400', label: 'Electrical' },
        HVAC: { icon: 'hvac', bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400', label: 'HVAC' },
        APPLIANCES: { icon: 'kitchen', bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400', label: 'Appliance' },
        STRUCTURAL: { icon: 'foundation', bg: 'bg-slate-100 dark:bg-slate-900/30', color: 'text-slate-600 dark:text-slate-400', label: 'Structural' },
        PEST_CONTROL: { icon: 'pest_control', bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400', label: 'Pest Control' },
        CLEANING: { icon: 'cleaning_services', bg: 'bg-cyan-100 dark:bg-cyan-900/30', color: 'text-cyan-600 dark:text-cyan-400', label: 'Cleaning' },
        SECURITY: { icon: 'lock_open', bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400', label: 'Security' },
        OTHER: { icon: 'build', bg: 'bg-gray-100 dark:bg-gray-900/30', color: 'text-gray-600 dark:text-gray-400', label: 'Other' },
    };
    return styles[category] || styles.OTHER;
}

// Priority/urgency mapping
function getUrgencyStyle(priority: MaintenancePriority): { label: string; color: string; dot: string; ping: boolean } {
    const styles: Record<MaintenancePriority, { label: string; color: string; dot: string; ping: boolean }> = {
        LOW: { label: 'Low', color: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-300 dark:bg-slate-600', ping: false },
        MEDIUM: { label: 'Medium', color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-500', ping: true },
        HIGH: { label: 'High', color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500', ping: true },
        EMERGENCY: { label: 'Emergency', color: 'text-red-700 dark:text-red-300', dot: 'bg-red-600', ping: true },
    };
    return styles[priority] || styles.MEDIUM;
}

// Status mapping
function getStatusStyle(status: MaintenanceStatus): { label: string; bg: string; color: string; border: string; isCompleted: boolean } {
    const styles: Record<MaintenanceStatus, { label: string; bg: string; color: string; border: string; isCompleted: boolean }> = {
        PENDING: { label: 'Submitted', bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800/50', isCompleted: false },
        ACKNOWLEDGED: { label: 'Scheduled', bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800/50', isCompleted: false },
        IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800/50', isCompleted: false },
        COMPLETED: { label: 'Completed', bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-700 dark:text-green-400', border: 'border-green-200 dark:border-green-800/50', isCompleted: true },
        CANCELLED: { label: 'Cancelled', bg: 'bg-gray-100 dark:bg-gray-900/30', color: 'text-gray-700 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800/50', isCompleted: true },
    };
    return styles[status] || styles.PENDING;
}

// Format date for display
function formatDate(dateStr: string): { date: string; time: string } {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    const dateFormatted = isToday
        ? 'Today'
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const timeFormatted = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

    return { date: dateFormatted, time: timeFormatted };
}

// Transform API MaintenanceRequest to UI format
function transformMaintenanceRequest(req: MaintenanceRequest): UIMaintenanceRequest {
    const categoryStyle = getCategoryStyle(req.category);
    const urgencyStyle = getUrgencyStyle(req.priority);
    const statusStyle = getStatusStyle(req.status);
    const { date, time } = formatDate(req.createdAt);

    // Check if request is new (submitted within last 24 hours and still pending)
    const createdDate = new Date(req.createdAt);
    const isNew = req.status === 'PENDING' && (Date.now() - createdDate.getTime()) < 24 * 60 * 60 * 1000;

    return {
        id: req.id,
        title: req.title,
        description: req.description,
        category: categoryStyle.label,
        categoryIcon: categoryStyle.icon,
        categoryBg: categoryStyle.bg,
        categoryColor: categoryStyle.color,
        property: req.lease?.property?.name || 'N/A',
        unit: typeof req.lease?.property?.address === 'object'
            ? `${req.lease?.property?.address?.city || ''}, ${req.lease?.property?.address?.state || ''}`.trim().replace(/^,\s*|,\s*$/g, '')
            : '',
        dateSubmitted: date,
        timeSubmitted: time,
        urgency: urgencyStyle.label,
        urgencyColor: urgencyStyle.color,
        urgencyDot: urgencyStyle.dot,
        urgencyPing: urgencyStyle.ping && !statusStyle.isCompleted,
        status: statusStyle.label,
        statusBg: statusStyle.bg,
        statusColor: statusStyle.color,
        statusBorder: statusStyle.border,
        hasPhotos: (req.images?.length || 0) > 0,
        photoCount: req.images?.length || 0,
        isNew,
        isCompleted: statusStyle.isCompleted,
    };
}

export default function TenantMaintenance() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // API data state
    const [maintenanceRequests, setMaintenanceRequests] = useState<UIMaintenanceRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [totalRequests, setTotalRequests] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const limit = 10;

    // Map filter values to API status values
    const mapStatusFilter = (filter: string): MaintenanceStatus | undefined => {
        const mapping: Record<string, MaintenanceStatus> = {
            'submitted': 'PENDING',
            'in-progress': 'IN_PROGRESS',
            'scheduled': 'ACKNOWLEDGED',
            'completed': 'COMPLETED',
            'canceled': 'CANCELLED',
        };
        return mapping[filter];
    };

    const mapUrgencyFilter = (filter: string): MaintenancePriority | undefined => {
        const mapping: Record<string, MaintenancePriority> = {
            'low': 'LOW',
            'medium': 'MEDIUM',
            'high': 'HIGH',
            'critical': 'EMERGENCY',
        };
        return mapping[filter];
    };

    // Fetch maintenance requests
    useEffect(() => {
        async function fetchMaintenanceRequests() {
            try {
                setIsLoading(true);
                setError(null);

                const params: { page: number; limit: number; status?: MaintenanceStatus; priority?: MaintenancePriority } = {
                    page,
                    limit,
                };

                if (statusFilter !== 'all') {
                    const mappedStatus = mapStatusFilter(statusFilter);
                    if (mappedStatus) params.status = mappedStatus;
                }

                if (urgencyFilter !== 'all') {
                    const mappedPriority = mapUrgencyFilter(urgencyFilter);
                    if (mappedPriority) params.priority = mappedPriority;
                }

                const response = await maintenanceService.getMaintenanceRequests(params);

                if (response.data?.data) {
                    const transformed = response.data.data.map(transformMaintenanceRequest);

                    // Client-side sorting
                    let sorted = [...transformed];
                    if (sortOrder === 'newest') {
                        sorted.sort((a, b) => new Date(b.dateSubmitted).getTime() - new Date(a.dateSubmitted).getTime());
                    } else if (sortOrder === 'oldest') {
                        sorted.sort((a, b) => new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime());
                    }

                    // Client-side search filter
                    if (searchQuery) {
                        const query = searchQuery.toLowerCase();
                        sorted = sorted.filter(req =>
                            req.title.toLowerCase().includes(query) ||
                            req.description.toLowerCase().includes(query) ||
                            req.id.toLowerCase().includes(query)
                        );
                    }

                    setMaintenanceRequests(sorted);
                    setTotalRequests(response.data.pagination?.total || sorted.length);
                    setTotalPages(response.data.pagination?.totalPages || 1);
                }
            } catch (err) {
                console.error('Error fetching maintenance requests:', err);
                setError('Failed to load maintenance requests');
            } finally {
                setIsLoading(false);
            }
        }

        fetchMaintenanceRequests();
    }, [page, statusFilter, urgencyFilter, sortOrder, searchQuery]);

    return (
        <PageContainer>
            <PageHeader
                title="Maintenance Requests"
                subtitle="View and manage support tickets for your properties."
                breadcrumb={[
                    { label: 'My Home', href: '/tenant/my-home' },
                    { label: 'Maintenance' }
                ]}
                actions={
                    <button
                        onClick={() => setIsMaintenanceModalOpen(true)}
                        className="px-5 py-3 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2 group"
                    >
                        <span className="material-symbols-outlined text-[20px] group-hover:rotate-90 transition-transform">add</span>
                        New Request
                    </button>
                }
            />

            {/* Search and Filters */}
            <div className="bg-white dark:bg-[#101922] p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm mb-6 flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by issue, ID, or keyword..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] transition-colors"
                    />
                </div>
                <div className="flex gap-3 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0">
                    <div className="relative min-w-[150px]">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#137fec] appearance-none cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <option value="all">All Statuses</option>
                            <option value="submitted">Submitted</option>
                            <option value="in-progress">In Progress</option>
                            <option value="scheduled">Scheduled</option>
                            <option value="completed">Completed</option>
                            <option value="canceled">Canceled</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                    </div>
                    <div className="relative min-w-[140px]">
                        <select
                            value={urgencyFilter}
                            onChange={(e) => setUrgencyFilter(e.target.value)}
                            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#137fec] appearance-none cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <option value="all">Any Urgency</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="critical">Critical</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                    </div>
                    <div className="relative min-w-[160px]">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-[#137fec] appearance-none cursor-pointer font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="updated">Last Updated</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">sort</span>
                    </div>
                </div>
            </div>

            {/* Table */}
            <SectionCard padding="none" className="flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                <th className="p-5 pl-6 w-[35%]">Request Details</th>
                                <th className="p-5 w-[20%]">Property</th>
                                <th className="p-5 w-[15%]">Date Submitted</th>
                                <th className="p-5 w-[10%]">Urgency</th>
                                <th className="p-5 w-[10%]">Status</th>
                                <th className="p-5 pr-6 w-[10%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                // Loading skeleton rows
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={`skeleton-${index}`} className="animate-pulse">
                                        <td className="p-5 pl-6">
                                            <div className="flex items-start gap-4">
                                                <div className="size-11 rounded-xl bg-slate-200 dark:bg-slate-700" />
                                                <div className="space-y-2 flex-1">
                                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-1" />
                                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                        </td>
                                        <td className="p-5">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                                        </td>
                                        <td className="p-5">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                        </td>
                                        <td className="p-5">
                                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-20" />
                                        </td>
                                        <td className="p-5 pr-6">
                                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl text-red-400">error</span>
                                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                            <button
                                                onClick={() => window.location.reload()}
                                                className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : maintenanceRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">build</span>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">No maintenance requests found</p>
                                            <button
                                                onClick={() => setIsMaintenanceModalOpen(true)}
                                                className="px-4 py-2 rounded-lg bg-[#137fec] text-xs font-bold text-white hover:bg-[#137fec]/90 transition-colors"
                                            >
                                                Submit New Request
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : maintenanceRequests.map((request) => (
                                <tr
                                    key={request.id}
                                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group ${request.isCompleted ? 'opacity-80 hover:opacity-100' : ''}`}
                                >
                                    <td className="p-5 pl-6">
                                        <div className="flex items-start gap-4">
                                            <div className={`size-11 rounded-xl ${request.categoryBg} ${request.categoryColor} flex items-center justify-center shrink-0`}>
                                                <span className="material-symbols-outlined">{request.categoryIcon}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">
                                                    {request.title}
                                                </h4>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                                    {request.description}
                                                </p>
                                                {request.hasPhotos && (
                                                    <div className="flex items-center gap-1 mt-1.5">
                                                        <span className="material-symbols-outlined text-[14px] text-slate-400">image</span>
                                                        <span className="text-[10px] font-medium text-slate-400">{request.photoCount} photos attached</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{request.property}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{request.unit}</div>
                                    </td>
                                    <td className="p-5">
                                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{request.dateSubmitted}</div>
                                        {request.timeSubmitted && (
                                            <div className="text-xs text-slate-400 mt-0.5">{request.timeSubmitted}</div>
                                        )}
                                    </td>
                                    <td className="p-5">
                                        <div className="flex items-center gap-1.5">
                                            {request.urgencyPing ? (
                                                <span className="relative flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                                                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${request.urgencyDot}`}></span>
                                                </span>
                                            ) : (
                                                <span className={`size-2.5 rounded-full ${request.urgencyDot}`}></span>
                                            )}
                                            <span className={`text-xs font-bold ${request.urgencyColor}`}>{request.urgency}</span>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${request.statusBg} ${request.statusColor} border ${request.statusBorder}`}>
                                            {request.status}
                                        </span>
                                        {request.scheduledDate && (
                                            <div className="text-[10px] text-purple-600 dark:text-purple-400 mt-1 font-medium">{request.scheduledDate}</div>
                                        )}
                                    </td>
                                    <td className="p-5 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {request.isNew ? (
                                                <>
                                                    <button className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                                        Cancel
                                                    </button>
                                                    <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                                        Edit
                                                    </button>
                                                </>
                                            ) : request.isCompleted ? (
                                                <Link
                                                    to={`/tenant/maintenance/${request.id}`}
                                                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                                >
                                                    View Log
                                                </Link>
                                            ) : (
                                                <>
                                                    <button className="size-8 flex items-center justify-center rounded-lg hover:bg-[#137fec]/10 text-slate-400 hover:text-[#137fec] transition-colors" title="Message Landlord">
                                                        <span className="material-symbols-outlined text-[18px]">chat</span>
                                                    </button>
                                                    <Link
                                                        to={`/tenant/maintenance/${request.id}`}
                                                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                                    >
                                                        Details
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Pagination */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-[#101922]">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {isLoading ? (
                            <span className="animate-pulse">Loading...</span>
                        ) : (
                            <>
                                Showing <span className="text-slate-900 dark:text-white font-bold">{maintenanceRequests.length > 0 ? (page - 1) * limit + 1 : 0}-{Math.min(page * limit, totalRequests)}</span> of <span className="text-slate-900 dark:text-white font-bold">{totalRequests}</span> requests
                            </>
                        )}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isLoading}
                            className={`px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all ${
                                page === 1 || isLoading
                                    ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                                    : 'text-slate-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'
                            }`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page >= totalPages || isLoading}
                            className={`px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold transition-all ${
                                page >= totalPages || isLoading
                                    ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
                                    : 'text-slate-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </SectionCard>

            {/* Maintenance Request Modal */}
            <MaintenanceRequestModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
            />
        </PageContainer>
    );
}
