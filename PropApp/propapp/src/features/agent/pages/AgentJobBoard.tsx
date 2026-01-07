import { useState } from 'react';
import { AnimatedGroup, MagneticButton, SuccessCelebration } from '../../../components/animation';
import AIAssistantWidget from '../../../components/common/AIAssistantWidget';

// Mock data for agent job board
const jobs = [
    {
        id: 1,
        type: 'Property Viewing',
        property: '5500 Highland Park, Unit 4B',
        city: 'Dallas, TX',
        clientName: 'Amanda Chen',
        date: 'Today, 2:00 PM',
        earnings: '$75',
        status: 'Confirmed',
        statusColor: 'bg-green-100 text-green-700',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
        priority: 'high',
    },
    {
        id: 2,
        type: 'Property Inspection',
        property: '1243 Oakwood Avenue',
        city: 'Austin, TX',
        clientName: 'Robert Wilson',
        date: 'Tomorrow, 10:00 AM',
        earnings: '$150',
        status: 'Pending Confirmation',
        statusColor: 'bg-amber-100 text-amber-700',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
        priority: 'medium',
    },
    {
        id: 3,
        type: 'Document Pickup',
        property: 'Downtown Loft',
        city: 'Seattle, WA',
        clientName: 'Jennifer Smith',
        date: 'Wed, Nov 6, 3:00 PM',
        earnings: '$50',
        status: 'Open',
        statusColor: 'bg-blue-100 text-blue-700',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDbn_i6RapAYYCUtbpApN4lJMQNrA0rGJZXVvlV5ZLubEMNH1omk_1mAstEefJ0spWkedOBAe5og228aYdYdVGMGx2otBaGsGAG_1DMh7rANSTYk0_MrBlyxCEDc66NFCgfMXVMcoMDPiPuhcBXg5_Iwjv_Fz2YEb4sU8vGb7xqSy9VX9nCTc1tUE2DL8uYW4jHmEa_B2GwMX24GP44NZ_TWI6Tc4Om0jvrCWW6cMyN3YxN1SrsIUBMkmeYENO3JUYvlZTV5Hn0Kqc',
        priority: 'low',
    },
    {
        id: 4,
        type: 'Verification Visit',
        property: '778 Sunnyvale Drive',
        city: 'Miami, FL',
        clientName: 'Michael Johnson',
        date: 'Thu, Nov 7, 11:00 AM',
        earnings: '$200',
        status: 'Open',
        statusColor: 'bg-blue-100 text-blue-700',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmzjPVnnkN0L0Df5m-edXXtRPMb0L9UALdUYVZ31ftX2hZoPcXfkk9cX0ppWUHkpAgEHDPt5z8Myghlu_sUmGC0p8uMQv-HbrXijHeC8ALkQAuqFOKKQ6BIlW3DyxKXmR68V6YLZxFKGKU5QA3f9KSaxdE-ZqCwq8CHWNZkHkt-0KyKZ6b8s_6sdVzJ5nMB7lFYMvczzRv1xvvE-i968QA_YLancFg-0dheYj1DUN0ylsh3qHXXWFqzKCnpvKn_5mHg9ar3r3Pfdeb',
        priority: 'high',
    },
];

const stats = {
    totalEarnings: '$2,450',
    earningsChange: '+18.5%',
    completedJobs: 47,
    jobsThisWeek: 5,
    rating: '4.9',
    reviewCount: 156,
    activeJobs: 3,
};

type FilterType = 'all' | 'viewing' | 'inspection' | 'verification' | 'documents';

export default function AgentJobBoard() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    const filters: { key: FilterType; label: string }[] = [
        { key: 'all', label: 'All Jobs' },
        { key: 'viewing', label: 'Viewings' },
        { key: 'inspection', label: 'Inspections' },
        { key: 'verification', label: 'Verifications' },
        { key: 'documents', label: 'Documents' },
    ];

    // Filter jobs based on active filter
    const filteredJobs = jobs.filter(job => {
        if (activeFilter === 'all') return true;
        const typeMap: Record<FilterType, string> = {
            'all': '',
            'viewing': 'Property Viewing',
            'inspection': 'Property Inspection',
            'verification': 'Verification Visit',
            'documents': 'Document Pickup',
        };
        return job.type === typeMap[activeFilter];
    });

    return (
        <div className="py-8 px-4 md:px-10 lg:px-20 pb-32">
            <div className="max-w-[1400px] w-full mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Agent Job Board
                        </h1>
                        <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
                            Find and accept property service jobs in your area.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">tune</span> Filters
                        </button>
                        <button className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">location_on</span> My Area
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Total Earnings */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="material-symbols-outlined text-green-500 text-[24px]">payments</span>
                            <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                                {stats.earningsChange}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">This Month</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {stats.totalEarnings}
                        </h3>
                    </div>

                    {/* Completed Jobs */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="material-symbols-outlined text-blue-500 text-[24px]">
                                check_circle
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Completed</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {stats.completedJobs}
                            <span className="text-sm font-normal text-slate-400 ml-1">jobs</span>
                        </h3>
                    </div>

                    {/* Rating */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="material-symbols-outlined text-amber-500 text-[24px] icon-filled">
                                star
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Rating</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {stats.rating}
                            <span className="text-sm font-normal text-slate-400 ml-1">
                                ({stats.reviewCount} reviews)
                            </span>
                        </h3>
                    </div>

                    {/* Active Jobs */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="material-symbols-outlined text-purple-500 text-[24px]">pending</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Active</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                            {stats.activeJobs}
                            <span className="text-sm font-normal text-slate-400 ml-1">in progress</span>
                        </h3>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-6 pb-2">
                    {filters.map((filter) => (
                        <button
                            key={filter.key}
                            onClick={() => setActiveFilter(filter.key)}
                            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-semibold transition-all ${activeFilter === filter.key
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                                : 'bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Job Cards */}
                <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 gap-6" stagger={0.08}>
                    {filteredJobs.map((job) => (
                        <div
                            key={job.id}
                            className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden hover:border-[#137fec]/50 transition-colors cursor-pointer"
                        >
                            <div className="flex">
                                <img
                                    alt={job.property}
                                    className="w-32 h-full object-cover shrink-0"
                                    src={job.image}
                                />
                                <div className="flex-1 p-5">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div>
                                            <span
                                                className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${job.statusColor}`}
                                            >
                                                {job.status}
                                            </span>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                                                {job.type}
                                            </h3>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-xl font-extrabold text-green-600">{job.earnings}</p>
                                            <p className="text-[10px] text-slate-400">Payout</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                        {job.property}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{job.city}</p>
                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            {job.date}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-[16px]">person</span>
                                            {job.clientName}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 mt-4">
                                        <MagneticButton className="flex-1">
                                            <button
                                                onClick={() => setIsSuccessOpen(true)}
                                                className="w-full py-2 bg-[#137fec] text-white font-bold text-sm rounded-lg hover:bg-[#137fec]/90 transition-colors"
                                            >
                                                Accept Job
                                            </button>
                                        </MagneticButton>
                                        <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </AnimatedGroup>

                {/* Load More */}
                <div className="mt-10 flex justify-center">
                    <button className="px-8 py-3 rounded-xl bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        Load More Jobs
                    </button>
                </div>
            </div>

            {/* Floating AI Bar */}
            <AIAssistantWidget
                suggestions={['Find jobs nearby', 'Check my earnings', 'Contact support']}
            />

            {/* Job Accepted Success Celebration */}
            <SuccessCelebration
                isOpen={isSuccessOpen}
                onClose={() => setIsSuccessOpen(false)}
                title="Job Accepted!"
                description="You've been added to this job. Check your schedule for details and head to the location at the scheduled time."
                buttonText="View My Jobs"
                icon="work"
            />
        </div >
    );
}
