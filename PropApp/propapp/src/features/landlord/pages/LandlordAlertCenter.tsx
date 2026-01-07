import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import { AnimatedGroup } from '../../../components/animation';

// Mock alerts data
const alertsData = [
    {
        id: 1,
        type: 'maintenance',
        title: 'Emergency Maintenance: Major Water Leak',
        description: 'Tenant reported active water leak in the master bathroom ceiling. Maintenance request #4092 created automatically. Requires immediate contractor assignment.',
        urgency: 'high',
        urgencyLabel: 'High Urgency',
        urgencyBg: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-200 dark:border-red-800',
        status: 'new',
        statusLabel: 'New',
        statusBg: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800',
        icon: 'plumbing',
        iconBg: 'bg-red-100 dark:bg-red-900/30 text-red-600',
        barColor: 'bg-red-500',
        property: 'Downtown Loft, Unit 402',
        propertyIcon: 'apartment',
        time: '25 mins ago',
        actions: ['Assign Contractor', 'Message Tenant', 'View Details'],
        primaryAction: 'Assign Contractor',
        primaryActionBg: 'bg-red-600 hover:bg-red-700 text-white shadow-red-200',
    },
    {
        id: 2,
        type: 'verification',
        title: 'Tenant Verification Complete',
        description: 'Comprehensive background check, credit report, and employment verification are now available for review. Score: 780.',
        urgency: 'medium',
        urgencyLabel: 'Medium',
        urgencyBg: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        status: 'new',
        statusLabel: 'New',
        statusBg: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800',
        icon: 'verified_user',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30 text-[#137fec]',
        barColor: 'bg-blue-500',
        property: 'Sarah Johnson',
        propertyIcon: 'person',
        secondaryInfo: '1243 Oakwood Avenue',
        secondaryIcon: 'home',
        time: '2 hours ago',
        actions: ['Review Application', 'Approve'],
        primaryAction: 'Review Application',
        primaryActionBg: 'bg-[#137fec] hover:bg-[#137fec]/90 text-white shadow-blue-200',
    },
    {
        id: 3,
        type: 'leasing',
        title: 'Lease Expiring Soon',
        description: 'Current lease ends in 30 days. Automated renewal offer has been drafted but requires your approval to send. AI suggests a 3% rent increase.',
        urgency: 'medium',
        urgencyLabel: 'Medium',
        urgencyBg: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-200 dark:border-orange-800',
        status: 'pending',
        statusLabel: 'Pending Action',
        statusBg: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        icon: 'history_edu',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
        barColor: 'bg-orange-400',
        property: '5500 Highland Park, Unit 4B',
        propertyIcon: 'apartment',
        secondaryInfo: 'Expires: Nov 30, 2024',
        secondaryIcon: 'calendar_month',
        time: '',
        actions: ['Send Renewal Offer', 'Prepare Move-out'],
        primaryAction: 'Send Renewal Offer',
        primaryActionBg: 'bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 hover:border-[#137fec] hover:text-[#137fec] text-slate-700 dark:text-slate-300',
    },
    {
        id: 4,
        type: 'financial',
        title: 'Late Payment Notification',
        description: 'Tenant missed the rent due date of Oct 1st. Payment was received successfully on Oct 2nd with late fee included. No further action needed.',
        urgency: 'low',
        urgencyLabel: 'Low',
        urgencyBg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        status: 'resolved',
        statusLabel: 'Resolved',
        statusBg: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-100 dark:border-green-800',
        icon: 'payments',
        iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
        barColor: 'bg-slate-300 dark:bg-slate-600',
        property: 'Michael Chen',
        propertyIcon: 'person',
        time: 'Yesterday',
        actions: ['View Receipt', 'Archive'],
        isResolved: true,
    },
    {
        id: 5,
        type: 'ai-insight',
        title: 'Market Opportunity Detected',
        description: 'Rental rates in the Austin area have increased by 5% this month. You have 1 property currently listed below market value.',
        urgency: 'opportunity',
        urgencyLabel: 'Opportunity',
        urgencyBg: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        status: 'new',
        statusLabel: 'New',
        statusBg: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800',
        icon: 'smart_toy',
        iconBg: 'bg-gradient-to-tr from-[#137fec] to-blue-400 text-white shadow-sm',
        barColor: 'bg-[#137fec]',
        property: 'Austin Area Portfolio',
        propertyIcon: 'location_on',
        time: 'Today',
        actions: ['View Analysis', 'Update Listing'],
        primaryAction: 'View Analysis',
        primaryActionBg: 'bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 hover:border-[#137fec] hover:text-[#137fec] text-slate-700 dark:text-slate-300',
        isAIInsight: true,
    },
];

export default function LandlordAlertCenter() {
    const [typeFilter, setTypeFilter] = useState('all');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('new');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);

    const toggleAlert = (id: number) => {
        setSelectedAlerts(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

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
            <AnimatedGroup className="flex flex-col gap-4" stagger={0.08}>
                {alertsData.map((alert) => (
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

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Showing <span className="font-bold text-slate-900 dark:text-white">1-5</span> of <span className="font-bold text-slate-900 dark:text-white">12</span> alerts
                </p>
                <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 cursor-not-allowed" disabled>
                        Previous
                    </button>
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        Next
                    </button>
                </div>
            </div>
        </PageContainer>
    );
}
