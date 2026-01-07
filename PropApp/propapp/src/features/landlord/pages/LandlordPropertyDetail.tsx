import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PhotoGalleryModal from '../../../components/PhotoGalleryModal';
import ScheduleMaintenanceModal from '../../../components/ScheduleMaintenanceModal';
import { AnimatedGroup } from '../../../components/animation';

// Mock property data for landlord view
const propertyData = {
    id: 1,
    name: 'Modern Oakwood Estate',
    address: '1243 Oakwood Avenue, Austin, TX 78704',
    targetRent: '$4,800',
    marketComparison: '+5%',
    status: 'Active Listing',
    onlineDays: 2,
    verified: 'Platinum Verified',
    verificationPending: true, // Set to true to show verification pending banner
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
    photoCount: 12,
    beds: 4,
    baths: 3,
    sqft: '2,400',
    yearBuilt: 2021,
    metrics: {
        views: 1245,
        viewsChange: '+12%',
        applicants: 5,
        newApplicants: 3,
        maintenance: 0,
        yield: '5.8%',
    },
    tenant: {
        name: 'The Anderson Family',
        since: 2021,
        leaseEnd: 'Nov 30, 2024',
        paymentStatus: 'Paid',
        monthlyRent: '$4,650',
    },
    financials: {
        grossRevenue: '$45,600',
        expenses: '$8,450',
        noi: '$37,150',
        revenuePercent: 85,
        expensePercent: 18,
    },
    description: `Stunning modern estate located in the heart of Austin's most desirable neighborhood. This architectural masterpiece features floor-to-ceiling windows that flood the open-concept living space with natural light.`,
    insights: [
        {
            icon: 'trending_up',
            iconColor: 'text-green-500',
            title: 'Market Rent Opportunity:',
            text: 'Similar units in Travis Heights are listing for $5,100/mo. Consider a 6% increase for the next lease.',
        },
        {
            icon: 'calendar_clock',
            iconColor: 'text-blue-500',
            title: 'Seasonal Timing:',
            text: 'Listing now aligns with peak relocation season in Austin (May-July). Expect lower vacancy time.',
        },
        {
            icon: 'home_repair_service',
            iconColor: 'text-orange-500',
            title: 'Preventative Maintenance:',
            text: 'HVAC system is 3 years old. Schedule a check-up before summer heat to avoid emergency calls.',
        },
    ],
    tasks: [
        { id: 1, title: 'Approve Lease Renewal', due: 'Due in 5 days' },
        { id: 2, title: 'Schedule Gutter Cleaning', due: 'Recommended for Nov' },
    ],
};

export default function LandlordPropertyDetail() {
    const { id } = useParams();
    const property = propertyData;
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // Gallery images
    const galleryImages = [
        property.image,
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCjSrFpmEFzY7DuSYzvGMyJ6_AbhHnvodMyset9lUUft__qqjtpv9mHHcZ_G89QxFqf2R2dKoTB_fJz4U92uCsFUL3184Bj0EySgXTcecuQVsdTPcTR-TEh34WNcFyDdaft0v9SsIZVgNjqHkcAVrUnkmB4ERkwtSLbgbP8lvDFna76LCjamOuHb71kIA10Hd2U-QwIyYE8BfDzezNODnKbjf1aE1aWwURtZm-0bYkj-A3IN-FzxBdGE2Vxyue4rROjFp2w4T6q4RmT',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuD1hNQWLqnlQOLYZ9f-8d7fV5L-8lvqQqH6fKMEVvKNT5RfVS45bLpjNr_JKmg9AoX3Jfz2VOzM0XSBBZNiZZFDN2dLJEZqBPP8gMKrqVA7JJfC6mV-8xQZHHpJLH2vLkHT_m3D2w5v2X6a',
    ];

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden pb-[140px]">
            {/* Hero Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-slate-200 overflow-hidden">
                <img
                    alt={property.name}
                    className="w-full h-full object-cover"
                    src={property.image}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10"></div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-white shadow-sm' : 'bg-white/50 hover:bg-white transition-colors cursor-pointer'}`}
                        ></div>
                    ))}
                </div>
                <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-white dark:hover:bg-black/80 transition-colors shadow-sm text-slate-900 dark:text-white"
                >
                    <span className="material-symbols-outlined text-[18px]">photo_library</span>
                    Manage Photos ({property.photoCount})
                </button>
            </div>

            {/* Main Content */}
            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column */}
                    <div className="flex-1 min-w-0">
                        {/* Verification Pending Banner */}
                        {property.verificationPending && (
                            <div className="mb-8 rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-900/20 shadow-sm relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <span className="material-symbols-outlined text-orange-200 dark:text-orange-900/40 text-[120px] -mr-8 -mt-8 rotate-12">gpp_maybe</span>
                                </div>
                                <div className="relative z-10 flex flex-col sm:flex-row gap-5">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 ring-4 ring-white dark:ring-slate-800 shadow-sm">
                                        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                Action Required: Verification Pending
                                                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">Urgent</span>
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed max-w-2xl">
                                            This property requires an updated <strong>Certificate of Occupancy (C of O)</strong> to maintain its active listing status and appear in search results. Please upload the document to the Verification Hub.
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link
                                                to="/landlord/verification"
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-orange-600/30 hover:-translate-y-0.5"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                                                Go to Verification Hub
                                            </Link>
                                            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                                                Remind Me Later
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Property Header */}
                        <div className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-md">
                                            {property.status}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                                            <span className="size-2 rounded-full bg-green-500"></span>
                                            Online for {property.onlineDays} days
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                                        {property.name}
                                    </h1>
                                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-[20px] mr-1.5">
                                            location_on
                                        </span>
                                        <p className="text-lg">{property.address}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">
                                        Target Rent
                                    </p>
                                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                        {property.targetRent}
                                        <span className="text-lg font-medium text-slate-500">/mo</span>
                                    </h2>
                                    <p className="text-green-600 dark:text-green-400 text-sm font-semibold flex items-center mt-1">
                                        <span className="material-symbols-outlined text-[16px] mr-0.5">
                                            trending_up
                                        </span>
                                        {property.marketComparison} &gt; Market Avg
                                    </p>
                                </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <div className="group relative cursor-pointer">
                                    <div className="bg-gradient-to-r from-slate-200 via-white to-slate-300 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 text-slate-900 dark:text-white text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-sm border border-slate-300 dark:border-slate-500">
                                        <span className="material-symbols-outlined text-[20px] icon-filled text-[#137fec]">
                                            verified
                                        </span>
                                        {property.verified.toUpperCase()}
                                    </div>
                                </div>
                                <Link
                                    to="/landlord/verification"
                                    className="flex items-center gap-1 text-sm font-bold text-[#137fec] hover:text-[#0e64bd] transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-[#137fec]/10"
                                >
                                    Open Verification Hub
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-green-500 text-[18px] icon-filled">
                                        check_circle
                                    </span>
                                    Inspection Passed
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
                                Performance Metrics
                            </h3>
                            <AnimatedGroup className="grid grid-cols-2 md:grid-cols-4 gap-4" stagger={0.1}>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 font-medium">Total Views (30d)</span>
                                        <span className="material-symbols-outlined text-blue-500 text-[20px]">
                                            visibility
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {property.metrics.views.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-green-500 font-medium flex items-center">
                                        <span className="material-symbols-outlined text-[14px] mr-0.5">
                                            arrow_upward
                                        </span>
                                        {property.metrics.viewsChange}
                                    </span>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1 ring-2 ring-[#137fec]/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 font-medium">Applicants</span>
                                        <span className="material-symbols-outlined text-[#137fec] text-[20px]">
                                            group
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {property.metrics.applicants}
                                    </span>
                                    <span className="text-xs text-[#137fec] font-medium">
                                        {property.metrics.newApplicants} New this week
                                    </span>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 font-medium">Maintenance</span>
                                        <span className="material-symbols-outlined text-orange-500 text-[20px]">
                                            build
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {property.metrics.maintenance}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">All systems operational</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 font-medium">Est. Yield</span>
                                        <span className="material-symbols-outlined text-green-500 text-[20px]">
                                            payments
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {property.metrics.yield}
                                    </span>
                                    <span className="text-xs text-slate-400 font-medium">Based on asking</span>
                                </div>
                            </AnimatedGroup>
                        </div>

                        {/* Current Tenant */}
                        <div className="mb-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined">person</span>
                                    Current Tenant Information
                                </h3>
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded uppercase">
                                    Lease Ending
                                </span>
                            </div>
                            <div className="flex flex-col md:flex-row gap-6">
                                <Link to="/landlord/tenants/1/profile" className="flex items-center gap-4 group cursor-pointer">
                                    <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:ring-2 group-hover:ring-[#137fec] transition-all">
                                        <span className="material-symbols-outlined">face</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">{property.tenant.name}</p>
                                        <p className="text-sm text-slate-500">Occupants since {property.tenant.since}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors text-[18px]">chevron_right</span>
                                </Link>
                                <div className="h-px md:h-auto w-full md:w-px bg-slate-200 dark:bg-slate-700"></div>
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                    <span className="text-slate-500">Lease Ends:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {property.tenant.leaseEnd}
                                    </span>
                                    <span className="text-slate-500">Payment Status:</span>
                                    <span className="font-medium text-green-600 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px] icon-filled">
                                            check_circle
                                        </span>
                                        {property.tenant.paymentStatus}
                                    </span>
                                    <span className="text-slate-500">Monthly Rent:</span>
                                    <span className="font-medium text-slate-900 dark:text-white">
                                        {property.tenant.monthlyRent}
                                    </span>
                                </div>
                                <div className="flex-1 flex md:justify-end items-center">
                                    <Link to="/landlord/leases/1" className="text-[#137fec] font-semibold text-sm hover:underline">
                                        View Lease Details
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Property Stats */}
                        <AnimatedGroup className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" stagger={0.1}>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">bed</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {property.beds}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Beds</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">bathtub</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {property.baths}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Baths</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">
                                    square_foot
                                </span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {property.sqft}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Sq Ft</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[20px]">
                                    calendar_month
                                </span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {property.yearBuilt}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Built</span>
                            </div>
                        </AnimatedGroup>

                        {/* Description */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Listing Description
                                </h3>
                                <button className="text-[#137fec] text-sm font-semibold flex items-center gap-1 hover:underline">
                                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit Text
                                </button>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm">
                                <p className="mb-2 line-clamp-2">{property.description}</p>
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="mb-10 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 border border-blue-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-8 rounded-full bg-[#137fec] flex items-center justify-center text-white shadow-lg shadow-[#137fec]/30">
                                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Management Insights
                                </h3>
                            </div>
                            <ul className="space-y-3">
                                {property.insights.map((insight, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                                    >
                                        <span
                                            className={`material-symbols-outlined ${insight.iconColor} text-[20px] mt-0.5`}
                                        >
                                            {insight.icon}
                                        </span>
                                        <span>
                                            <strong>{insight.title}</strong> {insight.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="hidden lg:block w-[360px] shrink-0">
                        <div className="sticky top-24 space-y-6">
                            {/* Financial Snapshot */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                                    Financial Snapshot (YTD)
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">Gross Revenue</span>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {property.financials.grossRevenue}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className="bg-green-500 h-2 rounded-full"
                                                style={{ width: `${property.financials.revenuePercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-slate-500">Expenses</span>
                                            <span className="font-bold text-slate-900 dark:text-white">
                                                {property.financials.expenses}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                            <div
                                                className="bg-red-400 h-2 rounded-full"
                                                style={{ width: `${property.financials.expensePercent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                            Net Operating Income
                                        </span>
                                        <span className="text-xl font-bold text-[#137fec]">
                                            {property.financials.noi}
                                        </span>
                                    </div>
                                    <button className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">finance</span>
                                        View Full Report
                                    </button>
                                </div>
                            </div>

                            {/* Upcoming Tasks */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                                    Upcoming Tasks
                                </h4>
                                <ul className="space-y-4">
                                    {property.tasks.map((task) => (
                                        <li key={task.id} className="flex gap-3">
                                            <div className="mt-0.5 size-5 rounded-full border-2 border-slate-300 hover:border-[#137fec] cursor-pointer flex-shrink-0"></div>
                                            <div className="text-sm">
                                                <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                                                <p className="text-slate-500 text-xs">{task.due}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <Link to={`/landlord/properties/${id}/tasks`} className="mt-4 text-[#137fec] text-sm font-semibold hover:underline block">
                                    View all tasks
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating AI Bar */}
            <div className="fixed bottom-[90px] left-0 right-0 flex justify-center z-30 px-4 pointer-events-none">
                <div className="w-full max-w-2xl bg-white/95 dark:bg-[#101922]/95 backdrop-blur-xl border border-[#137fec]/20 shadow-2xl shadow-[#137fec]/10 rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto [box-shadow:0_0_15px_rgba(19,127,236,0.4)] transition-all hover:scale-[1.01]">
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                    </div>
                    <div className="flex-1 overflow-hidden h-10 flex items-center">
                        <p className="text-slate-600 dark:text-slate-300 text-sm truncate animate-pulse">
                            Draft a lease renewal email, check recent maintenance costs, or analyze comps...
                        </p>
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">mic</span>
                    </button>
                    <button className="size-10 rounded-full bg-[#137fec] hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-[#137fec]/30">
                        <span className="material-symbols-outlined text-white">arrow_upward</span>
                    </button>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full z-20 bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-slate-800 p-4 md:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                                Listing Status
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="font-bold text-slate-900 dark:text-white">Active</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                                Applicant Queue
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {property.metrics.applicants} Applicants
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 md:flex-none flex gap-3 w-full md:w-auto">
                        <Link
                            to={`/landlord/properties/${id}/edit`}
                            className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            Edit Listing
                        </Link>
                        <button
                            onClick={() => setIsMaintenanceModalOpen(true)}
                            className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border-2 border-[#137fec] text-[#137fec] font-bold hover:bg-blue-50 dark:hover:bg-[#137fec]/10 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                            Schedule Maint.
                        </button>
                        <Link
                            to="/landlord/tenants"
                            className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-[#137fec] text-white font-bold hover:bg-[#0e64bd] transition-colors shadow-lg shadow-[#137fec]/25 whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">person_search</span>
                            View Applicants ({property.metrics.applicants})
                        </Link>
                    </div>
                </div>
            </div>

            {/* Photo Gallery Modal */}
            <PhotoGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                property={{ name: property.name, address: property.address }}
                images={galleryImages}
            />

            {/* Schedule Maintenance Modal */}
            <ScheduleMaintenanceModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                propertyAddress={property.address}
            />
        </div>
    );
}
