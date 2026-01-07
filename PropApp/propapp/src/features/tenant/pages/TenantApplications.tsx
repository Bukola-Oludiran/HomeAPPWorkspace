import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WithdrawApplicationModal from '../../../components/WithdrawApplicationModal';
import SignLeaseRenewalModal from '../../../components/SignLeaseRenewalModal';
import PageContainer from '../../../components/common/PageContainer';
import { AnimatedGroup } from '../../../components/animation';

// Mock applications data
const applicationsData = [
    {
        id: 1,
        propertyName: '5500 Highland Park, Unit 4B',
        location: 'Dallas, TX 75205',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
        beds: 2,
        baths: 2,
        sqft: '1,250',
        price: '$2,450/mo',
        status: 'Approved',
        statusColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        statusDotColor: 'bg-green-600',
        statusIcon: 'check_circle',
        statusIconColor: 'text-green-500',
        statusMessage: 'Background check completed',
        lastUpdated: 'Today, 9:30 AM',
        primaryAction: { label: 'Proceed to Lease', icon: 'arrow_forward' },
        showWithdraw: false,
    },
    {
        id: 2,
        propertyName: '1243 Oakwood Ave',
        location: 'Austin, TX 78704',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
        beds: 1,
        baths: 1,
        sqft: '850',
        price: '$1,800/mo',
        status: 'Pending Review',
        statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        statusDotColor: 'bg-blue-600 animate-pulse',
        statusIcon: 'hourglass_top',
        statusIconColor: 'text-blue-500',
        statusMessage: 'Awaiting landlord decision',
        lastUpdated: 'Oct 24, 2:15 PM',
        primaryAction: null,
        showWithdraw: true,
    },
    {
        id: 3,
        propertyName: 'Downtown Loft',
        location: 'Seattle, WA 98101',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDbn_i6RapAYYCUtbpApN4lJMQNrA0rGJZXVvlV5ZLubEMNH1om_1mAstEefJ0spWkedOBAe5og228aYdYdVGMGx2otBaGsGAG_1DMh7rANSTYk0_MrBlyxCEDc66NFCgfMXVMcoMDPiPuhcBXg5_Iwjv_Fz2YEb4sU8vGb7xqSy9VX9nCTc1tUE2DL8uYW4jHmEa_B2GwMX24GP44NZ_TWI6Tc4Om0jvrCWW6cMyN3YxN1SrsIUBMkmeYENO3JUYvlZTV5Hn0Kqc',
        beds: 'Studio',
        baths: 1,
        sqft: '600',
        price: '$2,100/mo',
        status: 'Escrow',
        statusColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        statusDotColor: 'bg-purple-600',
        statusIcon: 'payments',
        statusIconColor: 'text-purple-500',
        statusMessage: 'Deposit processing',
        lastUpdated: 'Oct 20, 4:45 PM',
        primaryAction: { label: 'Sign Lease', icon: 'history_edu' },
        showWithdraw: false,
    },
    {
        id: 4,
        propertyName: '778 Sunnyvale Dr',
        location: 'Miami, FL 33101',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmzjPVnnkN0L0Df5m-edXXtRPMb0L9UALdUYVZ31ftX2hZoPcXfkk9cX0ppWUHkpAgEHDPt5z8Myghlu_sUmGC0p8uMQv-HbrXijHeC8ALkQAuqFOKKQ6BIlW3DyxKXmR68V6YLZxFKGKU5QA3f9KSaxdE-ZqCwq8CHWNZkHkt-0KyKZ6b8s_6sdVzJ5nMB7lFYMvczzRv1xvvE-i968QA_YLancFg-0dheYj1DUN0ylsh3qHXXWFqzKCnpvKn_5mHg9ar3r3Pfdeb',
        beds: 3,
        baths: 2,
        sqft: '1,800',
        price: '$3,200/mo',
        status: 'Rejected',
        statusColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
        statusDotColor: 'bg-slate-500',
        statusIcon: 'cancel',
        statusIconColor: 'text-slate-400',
        statusMessage: 'Application declined by landlord',
        lastUpdated: 'Oct 15, 11:00 AM',
        primaryAction: null,
        showWithdraw: false,
        isRejected: true,
    },
];

type FilterTab = 'all' | 'pending' | 'approved';

export default function TenantApplications() {
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<{ id: number; propertyName: string } | null>(null);
    const [isSignLeaseModalOpen, setIsSignLeaseModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredApplications = applicationsData.filter((app) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pending') return app.status === 'Pending Review' || app.status === 'Escrow';
        if (activeFilter === 'approved') return app.status === 'Approved';
        return true;
    });

    return (
        <PageContainer maxWidth="lg">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Applications Tracker
                    </h1>
                    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
                        Manage and track the status of your rental applications.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Filter Tabs */}
                    <div className="flex bg-white dark:bg-[#101922] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeFilter === 'all'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFilter('pending')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === 'pending'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveFilter('approved')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === 'approved'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            Approved
                        </button>
                    </div>
                    {/* Sort Dropdown */}
                    <div className="relative" ref={sortDropdownRef}>
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101922] text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">sort</span>
                            Sort by: {sortBy === 'date' ? 'Date' : sortBy === 'name' ? 'Name' : 'Status'}
                        </button>
                        {showSortDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1">
                                {[{ id: 'date', label: 'Date' }, { id: 'name', label: 'Name' }, { id: 'status', label: 'Status' }].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            setSortBy(option.id as 'date' | 'name' | 'status');
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${sortBy === option.id ? 'text-[#137fec] font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                    >
                                        {option.label}
                                        {sortBy === option.id && (
                                            <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Applications List */}
            <AnimatedGroup className="flex flex-col gap-6" stagger={0.08}>
                {filteredApplications.map((app) => (
                    <div
                        key={app.id}
                        className={`bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 flex flex-col md:flex-row gap-6 hover:border-[#137fec]/30 transition-all duration-300 ${app.isRejected ? 'opacity-80 hover:opacity-100' : ''
                            }`}
                    >
                        {/* Property Image */}
                        <div className={`w-full md:w-64 h-48 md:h-auto shrink-0 relative rounded-xl overflow-hidden group ${app.isRejected ? 'grayscale hover:grayscale-0 transition-all' : ''}`}>
                            <img
                                alt={app.propertyName}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                src={app.image}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                        </div>

                        {/* Application Details */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {app.propertyName}
                                        </h3>
                                        <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${app.statusColor}`}>
                                            <span className={`size-1.5 rounded-full ${app.statusDotColor} mr-1.5`}></span>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        {app.location}
                                    </p>
                                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">bed</span>
                                            {app.beds} {typeof app.beds === 'number' ? 'Beds' : ''}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">bathtub</span>
                                            {app.baths} Baths
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">square_foot</span>
                                            {app.sqft} sqft
                                        </span>
                                        <span className="font-bold text-[#137fec] ml-2">{app.price}</span>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                                    <span className={`md:hidden inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${app.statusColor}`}>
                                        {app.status}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Last Updated</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{app.lastUpdated}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 w-full md:w-auto">
                                    <span className={`material-symbols-outlined ${app.statusIconColor}`}>{app.statusIcon}</span>
                                    {app.statusMessage}
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    {app.showWithdraw && (
                                        <button
                                            onClick={() => {
                                                setSelectedApp({ id: app.id, propertyName: app.propertyName });
                                                setIsWithdrawModalOpen(true);
                                            }}
                                            className="flex-1 md:flex-none px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                        >
                                            Withdraw Application
                                        </button>
                                    )}
                                    <Link
                                        to={`/tenant/applications/${app.id}`}
                                        className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
                                    >
                                        View Details
                                    </Link>
                                    {app.primaryAction && (
                                        <button
                                            onClick={() => {
                                                if (app.primaryAction?.label === 'Proceed to Lease') {
                                                    navigate('/tenant/lease-details');
                                                } else if (app.primaryAction?.label === 'Sign Lease') {
                                                    setIsSignLeaseModalOpen(true);
                                                }
                                            }}
                                            className="flex-1 md:flex-none px-5 py-2 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {app.primaryAction.label}
                                            <span className="material-symbols-outlined text-[18px]">{app.primaryAction.icon}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </AnimatedGroup>

            {/* Load More Button */}
            <div className="flex justify-center mt-12">
                <button className="px-6 py-3 rounded-xl bg-white dark:bg-[#101922] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                    Load More Applications
                    <span className="material-symbols-outlined">expand_more</span>
                </button>
            </div>

            {/* Withdraw Application Modal */}
            <WithdrawApplicationModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                propertyName={selectedApp?.propertyName}
            />

            {/* Sign Lease Renewal Modal */}
            <SignLeaseRenewalModal
                isOpen={isSignLeaseModalOpen}
                onClose={() => setIsSignLeaseModalOpen(false)}
            />
        </PageContainer>
    );
}
