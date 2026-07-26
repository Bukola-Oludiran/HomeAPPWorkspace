import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import { AnimatedGroup } from '../../../components/animation';
import { landlordService } from '../../../lib/api/services/landlordService';
import type { Alert, AlertType, AlertPriority } from '../../../types/dashboard';

// UI Alert interface matching the component's expected structure
interface UIAlert {
    id: string;
    type: string;
    title: string;
    description: string;
    urgency: string;
    urgencyLabel: string;
    urgencyBg: string;
    status: string;
    statusLabel: string;
    statusBg: string;
    icon: string;
    iconBg: string;
    barColor: string;
    property: string;
    propertyIcon: string;
    secondaryInfo?: string;
    secondaryIcon?: string;
    time: string;
    actions: string[];
    primaryAction?: string;
    primaryActionBg?: string;
    isResolved?: boolean;
    isAIInsight?: boolean;
    actionUrl?: string;
}

// Helper to format relative time
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
}

// Get UI styling based on alert type
function getAlertTypeStyles(type: AlertType): {
    icon: string;
    iconBg: string;
    barColor: string;
    uiType: string;
} {
    switch (type) {
        case 'MAINTENANCE_EMERGENCY':
            return {
                icon: 'plumbing',
                iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600',
                barColor: 'bg-red-500',
                uiType: 'maintenance',
            };
        case 'PAYMENT_OVERDUE':
            return {
                icon: 'payments',
                iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600',
                barColor: 'bg-red-500',
                uiType: 'financial',
            };
        case 'LEASE_EXPIRING':
            return {
                icon: 'history_edu',
                iconBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
                barColor: 'bg-orange-400',
                uiType: 'leasing',
            };
        case 'VERIFICATION_PENDING':
            return {
                icon: 'verified_user',
                iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-[#137fec]',
                barColor: 'bg-blue-500',
                uiType: 'verification',
            };
        case 'APPLICATION_NEW':
            return {
                icon: 'person_add',
                iconBg: 'bg-green-100 dark:bg-green-900/30 text-green-600',
                barColor: 'bg-green-500',
                uiType: 'application',
            };
        case 'MESSAGE_NEW':
            return {
                icon: 'chat',
                iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
                barColor: 'bg-blue-500',
                uiType: 'message',
            };
        default:
            return {
                icon: 'info',
                iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
                barColor: 'bg-slate-300',
                uiType: 'other',
            };
    }
}

// Get UI styling based on priority
function getPriorityStyles(priority: AlertPriority): {
    urgencyLabel: string;
    urgencyBg: string;
    primaryActionBg: string;
} {
    switch (priority) {
        case 'critical':
        case 'high':
            return {
                urgencyLabel: priority === 'critical' ? 'Critical' : 'High Urgency',
                urgencyBg: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800',
                primaryActionBg: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200',
            };
        case 'medium':
            return {
                urgencyLabel: 'Medium',
                urgencyBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800',
                primaryActionBg: 'bg-[#137fec] hover:bg-[#137fec]/90 text-white shadow-blue-200',
            };
        case 'low':
        default:
            return {
                urgencyLabel: 'Low',
                urgencyBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                primaryActionBg: 'bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 hover:border-[#137fec] hover:text-[#137fec] text-slate-700 dark:text-slate-300',
            };
    }
}

// Get default actions based on alert type
function getDefaultActions(type: AlertType): string[] {
    switch (type) {
        case 'MAINTENANCE_EMERGENCY':
            return ['Assign Contractor', 'Message Tenant', 'View Details'];
        case 'PAYMENT_OVERDUE':
            return ['Send Reminder', 'View Details'];
        case 'LEASE_EXPIRING':
            return ['Send Renewal Offer', 'View Lease'];
        case 'VERIFICATION_PENDING':
            return ['Review Application', 'Approve'];
        case 'APPLICATION_NEW':
            return ['Review Application', 'View Details'];
        case 'MESSAGE_NEW':
            return ['View Message', 'Reply'];
        default:
            return ['View Details'];
    }
}

// Transform API Alert to UI format
function transformAlert(alert: Alert): UIAlert {
    const typeStyles = getAlertTypeStyles(alert.type);
    const priorityStyles = getPriorityStyles(alert.priority);
    const actions = getDefaultActions(alert.type);

    return {
        id: alert.id,
        type: typeStyles.uiType,
        title: alert.title,
        description: alert.description,
        urgency: alert.priority,
        urgencyLabel: priorityStyles.urgencyLabel,
        urgencyBg: priorityStyles.urgencyBg,
        status: alert.isRead ? 'read' : 'new',
        statusLabel: alert.isRead ? 'Read' : 'New',
        statusBg: alert.isRead
            ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800',
        icon: typeStyles.icon,
        iconBg: typeStyles.iconBg,
        barColor: typeStyles.barColor,
        property: alert.relatedId || 'Property',
        propertyIcon: 'apartment',
        time: formatRelativeTime(alert.createdAt),
        actions: alert.actionLabel ? [alert.actionLabel, ...actions.slice(1)] : actions,
        primaryAction: alert.actionLabel || actions[0],
        primaryActionBg: priorityStyles.primaryActionBg,
        actionUrl: alert.actionUrl,
        isResolved: alert.isRead,
    };
}

export default function LandlordAlertCenter() {
    const [typeFilter, setTypeFilter] = useState('all');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
    const [alertsData, setAlertsData] = useState<UIAlert[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch alerts on mount
    useEffect(() => {
        async function fetchAlerts() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await landlordService.getAlerts();
                const transformed = response.data.map(transformAlert);
                setAlertsData(transformed);
            } catch (err) {
                console.error('Failed to fetch alerts:', err);
                setError('Failed to load alerts');
            } finally {
                setIsLoading(false);
            }
        }

        fetchAlerts();
    }, []);

    const toggleAlert = (id: string) => {
        setSelectedAlerts(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    // Filter alerts based on filters and search
    const filteredAlerts = alertsData.filter(alert => {
        if (typeFilter !== 'all' && alert.type !== typeFilter) return false;
        if (urgencyFilter !== 'all' && alert.urgency !== urgencyFilter) return false;
        if (statusFilter !== 'all') {
            if (statusFilter === 'new' && alert.isResolved) return false;
            if (statusFilter === 'resolved' && !alert.isResolved) return false;
        }
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                (alert.title ?? "").toLowerCase().includes(query) ||
                (alert.description ?? "").toLowerCase().includes(query) ||
                (alert.property ?? "").toLowerCase().includes(query)
            );
        }
        return true;
    });

    // Loading state
    if (isLoading) {
        return (
            <PageContainer>
                <PageHeader
                    title="Alert Center"
                    subtitle="Manage notifications and urgent tasks across your portfolio."
                />
                <div className="flex flex-col gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#101922] p-5 rounded-xl border border-slate-200 dark:border-slate-800 animate-pulse">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                <div className="flex-1">
                                    <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-4" />
                                    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </PageContainer>
        );
    }

    // Error state
    if (error) {
        return (
            <PageContainer>
                <PageHeader
                    title="Alert Center"
                    subtitle="Manage notifications and urgent tasks across your portfolio."
                />
                <div className="p-12 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-red-500 text-4xl mb-3">error</span>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                    >
                        Retry
                    </button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageHeader
                title="Alert Center"
                subtitle="Manage notifications and urgent tasks across your portfolio."
                breadcrumb={[
                    { label: 'Dashboard', href: '/landlord/dashboard' },
                    { label: 'Alert Center' }
                ]}
                actions={
                    <>
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 font-semibold text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-slate-800 dark:text-slate-400">done_all</span>
                            Mark all as read
                        </button>
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 font-semibold text-sm bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px] text-slate-800 dark:text-slate-400">settings</span>
                            Settings
                        </button>
                    </>
                }
            />

            {/* Filters */}
            <div className="bg-white dark:bg-[#101922] p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 mr-1">Filter by:</span>
                        <div className="relative">
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-slate-900 dark:text-white cursor-pointer min-w-[140px]"
                            >
                                <option value="all">All Types</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="verification">Verification</option>
                                <option value="financial">Financial</option>
                                <option value="leasing">Leasing</option>
                            </select>
                        </div>
                        <div className="relative">
                            <select
                                value={urgencyFilter}
                                onChange={(e) => setUrgencyFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-slate-900 dark:text-white cursor-pointer min-w-[120px]"
                            >
                                <option value="all">Any Urgency</option>
                                <option value="high">High</option>
                                <option value="medium">Medium</option>
                                <option value="low">Low</option>
                            </select>
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-slate-900 dark:text-white cursor-pointer min-w-[120px]"
                            >
                                <option value="new">Status: New</option>
                                <option value="acknowledged">Acknowledged</option>
                                <option value="resolved">Resolved</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 hidden md:block mx-1"></div>
                    <button
                        className={`text-slate-400 dark:text-slate-500 text-sm font-medium flex items-center gap-1 ${selectedAlerts.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        disabled={selectedAlerts.length === 0}
                    >
                        <span className="material-symbols-outlined text-[18px] text-slate-800 dark:text-slate-400">archive</span>
                        Archive Selected
                    </button>
                </div>
                <div className="relative w-full xl:w-auto min-w-[300px]">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by property, tenant, or keyword..."
                        className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-[#137fec] focus:border-[#137fec] text-slate-900 dark:text-white placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Alerts List */}
            {filteredAlerts.length === 0 ? (
                <div className="py-16 text-center bg-white dark:bg-[#101922] rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">notifications_off</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No alerts found</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        {searchQuery ? 'Try adjusting your search or filters' : 'You\'re all caught up!'}
                    </p>
                </div>
            ) : (
            <AnimatedGroup className="flex flex-col gap-4" stagger={0.08}>
                {filteredAlerts.map((alert) => (
                    <div
                        key={alert.id}
                        className={`group bg-white dark:bg-[#101922] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-[#137fec]/50 dark:hover:border-[#137fec]/50 hover:shadow-md transition-all relative overflow-hidden ${alert.isResolved ? 'opacity-75 hover:opacity-100' : ''
                            } ${alert.isAIInsight ? 'bg-gradient-to-r from-blue-50 to-white dark:from-slate-800 dark:to-[#101922] border-blue-100 dark:border-slate-700' : ''}`}
                    >
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${alert.barColor}`}></div>
                        <div className="flex flex-col md:flex-row gap-5 items-start">
                            <div className="flex items-start gap-4 shrink-0">
                                <input
                                    type="checkbox"
                                    checked={selectedAlerts.includes(alert.id)}
                                    onChange={() => toggleAlert(alert.id)}
                                    className="mt-1.5 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec] dark:border-slate-600 dark:bg-slate-800 cursor-pointer"
                                />
                                <div className={`size-12 rounded-full ${alert.iconBg} flex items-center justify-center shrink-0`}>
                                    <span className="material-symbols-outlined text-[24px]">{alert.icon}</span>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 w-full">
                                <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors flex items-center gap-2">
                                            {alert.title}
                                            {alert.isAIInsight && (
                                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-[#137fec] dark:text-blue-300 text-[10px] uppercase font-bold tracking-wide rounded">
                                                    AI Insight
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                                            <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                                <span className="material-symbols-outlined text-[16px]">{alert.propertyIcon}</span>
                                                {alert.property}
                                            </span>
                                            {alert.secondaryInfo && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">{alert.secondaryIcon}</span>
                                                        {alert.secondaryInfo}
                                                    </span>
                                                </>
                                            )}
                                            {alert.time && (
                                                <>
                                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-[16px]">schedule</span>
                                                        {alert.time}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${alert.urgencyBg}`}>
                                            {alert.urgencyLabel}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${alert.statusBg}`}>
                                            {alert.statusLabel}
                                        </span>
                                    </div>
                                </div>
                                <p className={`text-sm mt-2 mb-4 max-w-3xl ${alert.isResolved ? 'text-slate-500 dark:text-slate-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {alert.description}
                                </p>
                                <div className="flex flex-wrap gap-3">
                                    {alert.primaryAction && (
                                        <button className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shadow-sm dark:shadow-none ${alert.primaryActionBg}`}>
                                            {alert.primaryAction}
                                        </button>
                                    )}
                                    {alert.actions.filter(a => a !== alert.primaryAction).map((action, idx) => (
                                        action === 'View Details' && alert.type === 'maintenance' ? (
                                            <Link
                                                key={idx}
                                                to={`/landlord/maintenance/${alert.id}`}
                                                className="px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                            >
                                                {action}
                                            </Link>
                                        ) : (
                                            <button
                                                key={idx}
                                                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${alert.isResolved
                                                    ? 'bg-slate-50 dark:bg-slate-900 text-slate-800 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                                                    : 'bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                                                    }`}
                                            >
                                                {action}
                                            </button>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </AnimatedGroup>
            )}

            {/* Pagination */}
            {filteredAlerts.length > 0 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing <span className="font-bold text-slate-900 dark:text-white">{filteredAlerts.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{alertsData.length}</span> alerts
                </p>
            </div>
            )}
        </PageContainer>
    );
}
