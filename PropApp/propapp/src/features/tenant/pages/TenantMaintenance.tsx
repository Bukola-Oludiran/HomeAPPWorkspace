import { useState } from 'react';
import { Link } from 'react-router-dom';
import MaintenanceRequestModal from '../../../components/MaintenanceRequestModal';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';

// Mock maintenance data matching design
const maintenanceRequests = [
    {
        id: 1,
        title: 'Leaky Faucet',
        description: 'Kitchen sink dripping constantly into the cabinet below.',
        category: 'Plumbing',
        categoryIcon: 'plumbing',
        categoryBg: 'bg-amber-100 dark:bg-amber-900/30',
        categoryColor: 'text-amber-600 dark:text-amber-500',
        property: '5500 Highland Park',
        unit: 'Unit 4B',
        dateSubmitted: 'Oct 24, 2024',
        timeSubmitted: '2:30 PM',
        urgency: 'Medium',
        urgencyColor: 'text-orange-600 dark:text-orange-400',
        urgencyDot: 'bg-orange-500',
        urgencyPing: true,
        status: 'In Progress',
        statusBg: 'bg-amber-100 dark:bg-amber-900/30',
        statusColor: 'text-amber-700 dark:text-amber-400',
        statusBorder: 'border-amber-200 dark:border-amber-800/50',
        hasPhotos: true,
        photoCount: 2,
    },
    {
        id: 2,
        title: 'AC Filter Replacement',
        description: 'Routine maintenance requested for HVAC system.',
        category: 'HVAC',
        categoryIcon: 'hvac',
        categoryBg: 'bg-purple-100 dark:bg-purple-900/30',
        categoryColor: 'text-purple-600 dark:text-purple-400',
        property: '5500 Highland Park',
        unit: 'Unit 4B',
        dateSubmitted: 'Oct 20, 2024',
        timeSubmitted: '9:15 AM',
        urgency: 'Low',
        urgencyColor: 'text-slate-600 dark:text-slate-400',
        urgencyDot: 'bg-slate-300 dark:bg-slate-600',
        urgencyPing: false,
        status: 'Scheduled',
        statusBg: 'bg-purple-100 dark:bg-purple-900/30',
        statusColor: 'text-purple-700 dark:text-purple-400',
        statusBorder: 'border-purple-200 dark:border-purple-800/50',
        scheduledDate: 'Oct 26, 2:00 PM',
        hasPhotos: false,
        photoCount: 0,
    },
    {
        id: 3,
        title: 'Dishwasher Noise',
        description: 'Making loud grinding noise during drain cycle.',
        category: 'Appliance',
        categoryIcon: 'kitchen',
        categoryBg: 'bg-blue-100 dark:bg-blue-900/30',
        categoryColor: 'text-blue-600 dark:text-blue-400',
        property: '5500 Highland Park',
        unit: 'Unit 4B',
        dateSubmitted: 'Today',
        timeSubmitted: '10:45 AM',
        urgency: 'Medium',
        urgencyColor: 'text-orange-600 dark:text-orange-400',
        urgencyDot: 'bg-orange-500',
        urgencyPing: true,
        status: 'Submitted',
        statusBg: 'bg-blue-100 dark:bg-blue-900/30',
        statusColor: 'text-blue-700 dark:text-blue-400',
        statusBorder: 'border-blue-200 dark:border-blue-800/50',
        hasPhotos: false,
        photoCount: 0,
        isNew: true,
    },
    {
        id: 4,
        title: 'Hallway Light Fixture',
        description: 'Fixture fell down, needs re-mounting.',
        category: 'Electrical',
        categoryIcon: 'lightbulb',
        categoryBg: 'bg-green-100 dark:bg-green-900/30',
        categoryColor: 'text-green-600 dark:text-green-400',
        property: '778 Sunnyvale Dr',
        unit: 'Miami, FL',
        dateSubmitted: 'Sep 15, 2024',
        timeSubmitted: '',
        urgency: 'Low',
        urgencyColor: 'text-slate-600 dark:text-slate-400',
        urgencyDot: 'bg-slate-300 dark:bg-slate-600',
        urgencyPing: false,
        status: 'Completed',
        statusBg: 'bg-green-100 dark:bg-green-900/30',
        statusColor: 'text-green-700 dark:text-green-400',
        statusBorder: 'border-green-200 dark:border-green-800/50',
        hasPhotos: false,
        photoCount: 0,
        isCompleted: true,
    },
    {
        id: 5,
        title: 'Broken Window Lock',
        description: "Front bedroom window won't lock properly.",
        category: 'Security',
        categoryIcon: 'lock_open',
        categoryBg: 'bg-red-100 dark:bg-red-900/30',
        categoryColor: 'text-red-600 dark:text-red-400',
        property: '5500 Highland Park',
        unit: 'Unit 4B',
        dateSubmitted: 'Aug 2, 2024',
        timeSubmitted: '',
        urgency: 'High',
        urgencyColor: 'text-red-600 dark:text-red-400',
        urgencyDot: 'bg-red-500',
        urgencyPing: false,
        status: 'Resolved',
        statusBg: 'bg-green-100 dark:bg-green-900/30',
        statusColor: 'text-green-700 dark:text-green-400',
        statusBorder: 'border-green-200 dark:border-green-800/50',
        hasPhotos: false,
        photoCount: 0,
        isCompleted: true,
    },
];

export default function TenantMaintenance() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [urgencyFilter, setUrgencyFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

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
                            {maintenanceRequests.map((request) => (
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
                        Showing <span className="text-slate-900 dark:text-white font-bold">1-5</span> of <span className="text-slate-900 dark:text-white font-bold">12</span> requests
                    </span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50" disabled>
                            Previous
                        </button>
                        <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all">
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
