import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import FilterDropdown from '../../../components/FilterDropdown';
import EmptyState from '../../../components/common/EmptyState';
import { AnimatedGroup } from '../../../components/animation';

// Mock job data
const jobsData = [
    {
        id: 1,
        title: 'AC Repair & Service',
        category: 'HVAC',
        categoryIcon: 'hvac',
        price: '$120',
        location: 'Lekki Phase 1, Block 4',
        distance: '5.2 km away',
        dateTime: 'Today • 2:00 PM',
        dateIcon: 'schedule',
        status: 'in-progress',
        statusLabel: 'In Progress',
        statusBg: 'bg-amber-100 dark:bg-amber-900/30',
        statusColor: 'text-amber-700 dark:text-amber-500',
        statusIcon: 'sync',
        statusIconAnimate: true,
        barColor: 'bg-amber-500',
        showComplete: true,
    },
    {
        id: 2,
        title: 'Kitchen Sink Leak',
        category: 'Plumbing',
        categoryIcon: 'plumbing',
        price: '$85',
        location: 'Victoria Island, Apt 102',
        distance: '12 km away',
        dateTime: 'Tomorrow • 10:00 AM',
        dateIcon: 'event',
        status: 'upcoming',
        statusLabel: 'Upcoming',
        statusBg: 'bg-blue-100 dark:bg-blue-900/30',
        statusColor: 'text-blue-700 dark:text-blue-500',
        barColor: 'bg-blue-500',
        showStart: true,
    },
    {
        id: 3,
        title: 'Fixture Installation',
        category: 'Electrical',
        categoryIcon: 'lightbulb',
        price: '$150',
        location: 'Ikoyi, Glover Road',
        distance: '8.5 km away',
        dateTime: 'Oct 26 • 09:00 AM',
        dateIcon: 'event',
        status: 'upcoming',
        statusLabel: 'Upcoming',
        statusBg: 'bg-blue-100 dark:bg-blue-900/30',
        statusColor: 'text-blue-700 dark:text-blue-500',
        barColor: 'bg-blue-500',
        showStart: true,
    },
    {
        id: 4,
        title: 'Door Lock Repair',
        category: 'Repair',
        categoryIcon: 'lock',
        price: '$65',
        location: 'Yaba, Tech Park',
        distance: 'Completed on Site',
        dateTime: 'Yesterday • 4:30 PM',
        dateIcon: 'event_available',
        status: 'completed',
        statusLabel: 'Completed',
        statusBg: 'bg-green-100 dark:bg-green-900/30',
        statusColor: 'text-green-700 dark:text-green-500',
        statusIcon: 'check',
        barColor: 'bg-green-500',
        isCompleted: true,
        paymentReceived: true,
    },
    {
        id: 5,
        title: 'Lawn Mowing',
        category: 'Gardening',
        categoryIcon: 'yard',
        price: '$40',
        location: 'Ikeja, GRA',
        distance: '',
        dateTime: 'Oct 20 • 11:00 AM',
        dateIcon: 'event_busy',
        status: 'canceled',
        statusLabel: 'Canceled',
        statusBg: 'bg-red-100 dark:bg-red-900/30',
        statusColor: 'text-red-700 dark:text-red-500',
        barColor: 'bg-red-500',
        isCanceled: true,
        cancelReason: 'Client canceled',
    },
];

type TabType = 'all' | 'upcoming' | 'in-progress' | 'completed';

export default function AgentMyJobs() {
    const [activeTab, setActiveTab] = useState<TabType>('all');
    const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

    const filteredJobs = activeTab === 'all'
        ? jobsData
        : jobsData.filter(job => job.status === activeTab);

    return (
        <PageContainer>
            <PageHeader
                title="My Jobs"
                subtitle="Manage your schedule, track progress, and update job status."
                actions={
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto custom-scrollbar shadow-sm">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-5 py-2 text-sm font-bold whitespace-nowrap rounded-lg transition-all ${activeTab === 'all'
                                    ? 'bg-[#137fec] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                All Jobs
                            </button>
                            <button
                                onClick={() => setActiveTab('upcoming')}
                                className={`px-5 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${activeTab === 'upcoming'
                                    ? 'bg-[#137fec] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                Upcoming
                            </button>
                            <button
                                onClick={() => setActiveTab('in-progress')}
                                className={`px-5 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${activeTab === 'in-progress'
                                    ? 'bg-[#137fec] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                In Progress
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`px-5 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${activeTab === 'completed'
                                    ? 'bg-[#137fec] text-white shadow-md'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                Completed
                            </button>
                        </div>
                        <FilterDropdown
                            label="Filter"
                            options={[
                                { id: 'hvac', label: 'HVAC', icon: 'hvac' },
                                { id: 'plumbing', label: 'Plumbing', icon: 'plumbing' },
                                { id: 'electrical', label: 'Electrical', icon: 'lightbulb' },
                                { id: 'appliances', label: 'Appliances', icon: 'kitchen' },
                                { id: 'general', label: 'General', icon: 'handyman' },
                            ]}
                            selected={selectedFilters}
                            onChange={setSelectedFilters}
                        />
                    </div>
                }
            />

            {/* Jobs Grid */}
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" stagger={0.08}>
                {filteredJobs.map((job) => (
                    <div
                        key={job.id}
                        className={`bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-lg hover:border-[#137fec]/30 transition-all group relative overflow-hidden ${job.isCompleted || job.isCanceled ? 'opacity-80 hover:opacity-100' : ''
                            }`}
                    >
                        {/* Left Border Accent */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${job.barColor}`}></div>

                        {/* Header */}
                        <div className="flex justify-between items-start mb-4 pl-2">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                        {job.category}
                                    </span>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${job.statusBg} ${job.statusColor}`}>
                                        {job.statusIcon && (
                                            <span className={`material-symbols-outlined text-[12px] ${job.statusIconAnimate ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }}>
                                                {job.statusIcon}
                                            </span>
                                        )}
                                        {job.statusLabel}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                    {job.title}
                                </h3>
                            </div>
                            <div className="text-right">
                                <span className="block text-xl font-extrabold text-slate-900 dark:text-white">
                                    {job.price}
                                </span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 mb-6 pl-2">
                            <div className="flex items-start gap-3 text-slate-800 dark:text-slate-400 text-sm">
                                <span className="material-symbols-outlined text-lg shrink-0 mt-0.5">location_on</span>
                                <span>
                                    {job.location}
                                    {job.distance && (
                                        <>
                                            <br />
                                            <span className="text-xs text-slate-400">{job.distance}</span>
                                        </>
                                    )}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-800 dark:text-slate-400 text-sm">
                                <span className="material-symbols-outlined text-lg shrink-0">{job.dateIcon}</span>
                                <span>{job.dateTime}</span>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 pl-2">
                            {job.showComplete && (
                                <>
                                    <div className="flex gap-1">
                                        <button className="p-2.5 text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Call Client">
                                            <span className="material-symbols-outlined">call</span>
                                        </button>
                                        <button className="p-2.5 text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Message">
                                            <span className="material-symbols-outlined">chat</span>
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white text-sm font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                            Issues?
                                        </button>
                                        <button className="px-4 py-2 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all">
                                            Complete
                                        </button>
                                    </div>
                                </>
                            )}

                            {job.showStart && (
                                <>
                                    <button className="p-2.5 text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                                        <span className="material-symbols-outlined">map</span>
                                    </button>
                                    <div className="flex gap-2">
                                        <Link
                                            to={`/agent/my-jobs/${job.id}`}
                                            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            Details
                                        </Link>
                                        <button className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-all">
                                            Start Job
                                        </button>
                                    </div>
                                </>
                            )}

                            {job.isCompleted && (
                                <>
                                    {job.paymentReceived && (
                                        <div className="flex items-center gap-1 text-xs font-bold text-green-600">
                                            <span className="material-symbols-outlined text-sm">verified</span>
                                            Payment Received
                                        </div>
                                    )}
                                    <Link
                                        to={`/agent/my-jobs/${job.id}`}
                                        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </>
                            )}

                            {job.isCanceled && (
                                <>
                                    <span className="text-xs text-slate-400 italic">{job.cancelReason}</span>
                                    <button className="px-4 py-2 text-slate-500 hover:text-slate-700 text-sm font-bold rounded-lg transition-colors">
                                        Archive
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {/* Empty State - hidden by default */}
                {filteredJobs.length === 0 && (
                    <EmptyState
                        icon="work_off"
                        title="No jobs found"
                        description="Try adjusting your filters or browse the job board for new opportunities."
                        action={{ label: "Browse Job Board", href: "/agent/jobs" }}
                        className="col-span-full"
                    />
                )}
            </AnimatedGroup>
        </PageContainer>
    );
}
