import { useState } from 'react';
import { Link } from 'react-router-dom';
import MakePaymentModal from '../../../components/MakePaymentModal';
import SignLeaseRenewalModal from '../../../components/SignLeaseRenewalModal';
import MaintenanceRequestModal from '../../../components/MaintenanceRequestModal';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import StatsCard from '../../../components/common/StatsCard';
import AIAssistantWidget from '../../../components/common/AIAssistantWidget';
import { AnimatedGroup } from '../../../components/animation';

// Mock data for tenant dashboard (from Tenant Dashboard Home code.html)
const dashboardData = {
    nextPayment: {
        amount: '$2,450',
        dueDate: 'Nov 1, 2024',
        status: 'Due Soon',
    },
    lease: {
        remaining: '11 Months',
        endDate: 'Aug 31, 2025',
        status: 'Active',
    },
    openRequests: 1,
    lastUpdate: '2 hrs ago',
    applications: {
        pending: 1,
        saved: 2,
    },
    currentRental: {
        address: '5500 Highland Park, Unit 4B',
        city: 'Dallas, TX 75205',
        rent: '$2,450',
        leasePeriod: 'Sep 2024 - Aug 2025',
        leaseLength: '12 Months',
        manager: {
            name: 'Robert Johnson',
            initials: 'RJ',
        },
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
    },
    maintenanceLog: [
        {
            id: 1,
            title: 'Leaky Faucet',
            status: 'In Progress',
            statusColor: 'bg-amber-100 text-amber-700',
            icon: 'plumbing',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
            description: 'Submitted yesterday. Plumber scheduled for tomorrow 2PM.',
        },
        {
            id: 2,
            title: 'AC Filter Replacement',
            status: 'Completed',
            statusColor: 'bg-green-100 text-green-700',
            icon: 'check',
            iconBg: 'bg-green-100 dark:bg-green-900/30 text-green-600',
            description: 'Resolved on Sep 15.',
            completed: true,
        },
    ],
    applicationsList: [
        {
            id: 1,
            address: '1243 Oakwood Ave',
            city: 'Austin, TX',
            status: 'Approved',
            statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
        },
        {
            id: 2,
            address: 'Downtown Loft',
            city: 'Seattle, WA',
            status: 'Pending',
            statusColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDbn_i6RapAYYCUtbpApN4lJMQNrA0rGJZXVvlV5ZLubEMNH1omk_1mAstEefJ0spWkedOBAe5og228aYdYdVGMGx2otBaGsGAG_1DMh7rANSTYk0_MrBlyxCEDc66NFCgfMXVMcoMDPiPuhcBXg5_Iwjv_Fz2YEb4sU8vGb7xqSy9VX9nCTc1tUE2DL8uYW4jHmEa_B2GwMX24GP44NZ_TWI6Tc4Om0jvrCWW6cMyN3YxN1SrsIUBMkmeYENO3JUYvlZTV5Hn0Kqc',
        },
    ],
    savedProperties: [
        {
            id: 1,
            address: '778 Sunnyvale Dr',
            city: 'Miami, FL',
            price: '$3,200',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmzjPVnnkN0L0Df5m-edXXtRPMb0L9UALdUYVZ31ftX2hZoPcXfkk9cX0ppWUHkpAgEHDPt5z8Myghlu_sUmGC0p8uMQv-HbrXijHeC8ALkQAuqFOKKQ6BIlW3DyxKXmR68V6YLZxFKGKU5QA3f9KSaxdE-ZqCwq8CHWNZkHkt-0KyKZ6b8s_6sdVzJ5nMB7lFYMvczzRv1xvvE-i968QA_YLancFg-0dheYj1DUN0ylsh3qHXXWFqzKCnpvKn_5mHg9ar3r3Pfdeb',
        },
    ],
};

export default function TenantDashboard() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSignLeaseModalOpen, setIsSignLeaseModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    return (
        <PageContainer>
            <PageHeader
                title="Tenant Dashboard"
                subtitle="Welcome back, Sarah. Here's your rental overview."
                actions={
                    <>
                        <button
                            onClick={() => setIsMaintenanceModalOpen(true)}
                            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">build</span> Request Maintenance
                        </button>
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">payments</span> Pay Rent
                        </button>
                    </>
                }
            />

            {/* Stats Grid */}
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" stagger={0.1}>
                {/* Next Rent Payment */}
                <StatsCard
                    icon="calendar_today"
                    iconColor="blue"
                    label="Next Rent Payment"
                    value={dashboardData.nextPayment.amount}
                    animateValue
                    numericValue={2450}
                    valuePrefix="$"
                    badge={{ text: "Due Soon", variant: "warning" }}
                    subtext={`Due: ${dashboardData.nextPayment.dueDate}`}
                />

                {/* Lease Status */}
                <StatsCard
                    icon="contract"
                    iconColor="purple"
                    label="Lease Status"
                    value={dashboardData.lease.remaining}
                    badge={{ text: "Active", variant: "success" }}
                    subtext={`Ends: ${dashboardData.lease.endDate}`}
                />

                {/* Open Requests */}
                <StatsCard
                    icon="home_repair_service"
                    iconColor="amber"
                    label="Open Requests"
                    value={`${dashboardData.openRequests} Open`}
                    subtext={`Last update: ${dashboardData.lastUpdate}`}
                />

                {/* Applications */}
                <StatsCard
                    icon="description"
                    iconColor="indigo"
                    label="Applications"
                    value="1 Pending"
                    badge={{ text: "2 Saved", variant: "default" }}
                    subtext="Awaiting approval"
                />
            </AnimatedGroup>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    {/* Current Rental */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Current Rental</h2>
                        <Link to="/tenant/lease-details" className="text-sm text-[#137fec] font-semibold hover:underline">
                            View Lease Details
                        </Link>
                    </div>
                    <SectionCard padding="none">
                        <div className="relative h-64 md:h-80 w-full">
                            <img
                                alt="Current Property"
                                className="w-full h-full object-cover"
                                src={dashboardData.currentRental.image}
                            />
                            <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white shadow-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-green-500">
                                    check_circle
                                </span>
                                Verified Listing
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {dashboardData.currentRental.address}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        {dashboardData.currentRental.city}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-semibold text-sm transition-colors flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[18px]">chat</span> Message
                                        Landlord
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                                        Monthly Rent
                                    </p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                        {dashboardData.currentRental.rent}
                                    </p>
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">check</span>Auto-pay on
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                                        Lease Period
                                    </p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                                        {dashboardData.currentRental.leasePeriod}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {dashboardData.currentRental.leaseLength}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                                        Property Manager
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="size-8 rounded-full bg-[#137fec]/10 text-[#137fec] flex items-center justify-center font-bold text-xs">
                                            {dashboardData.currentRental.manager.initials}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {dashboardData.currentRental.manager.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Saved Properties */}
                    <div className="flex items-center justify-between mt-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Saved Properties</h2>
                        <Link to="/tenant/saved" className="text-sm text-[#137fec] font-semibold hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dashboardData.savedProperties.map((property) => (
                            <div
                                key={property.id}
                                className="bg-white dark:bg-[#101922] p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex gap-3 cursor-pointer hover:border-[#137fec]/50 transition-colors"
                            >
                                <img
                                    alt="Saved home"
                                    className="w-20 h-20 rounded-lg object-cover"
                                    src={property.image}
                                />
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                        {property.address}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{property.city}</p>
                                    <p className="text-sm font-bold text-[#137fec] mt-2">
                                        {property.price}
                                        <span className="text-slate-400 font-normal text-xs">/mo</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                        <Link
                            to="/search"
                            className="bg-white dark:bg-[#101922] p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex gap-3 cursor-pointer hover:border-[#137fec]/50 transition-colors"
                        >
                            <div className="w-20 h-20 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                            <div className="flex-1 flex flex-col justify-center">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Browse More</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Find your next dream home
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="flex flex-col gap-6">
                    {/* Maintenance Log */}
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Maintenance Log</h2>
                    <SectionCard padding="sm" className="flex flex-col gap-4">
                        {dashboardData.maintenanceLog.map((item, index) => (
                            <Link
                                to={`/tenant/maintenance/${item.id}`}
                                key={item.id}
                                className={`flex gap-3 items-start hover:bg-slate-50 dark:hover:bg-slate-800/50 -mx-2 px-2 py-2 rounded-lg transition-colors ${index < dashboardData.maintenanceLog.length - 1
                                    ? 'pb-4 border-b border-slate-100 dark:border-slate-800'
                                    : ''
                                    } ${item.completed ? 'opacity-70' : ''}`}
                            >
                                <div
                                    className={`size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.iconBg}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                            {item.title}
                                        </h4>
                                        <span
                                            className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${item.statusColor}`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                        {item.description}
                                    </p>
                                </div>
                            </Link>
                        ))}
                        <Link
                            to="/tenant/maintenance"
                            className="w-full py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center block"
                        >
                            View All Requests
                        </Link>
                    </SectionCard>

                    {/* Applications */}
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Applications</h2>
                    <SectionCard padding="sm" className="flex flex-col gap-4">
                        {dashboardData.applicationsList.map((app) => (
                            <div key={app.id} className="flex flex-col gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                <div className="flex gap-3 items-center">
                                    <img
                                        alt="Application property"
                                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                                        src={app.image}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                            {app.address}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{app.city}</p>
                                    </div>
                                    <span
                                        className={`text-[10px] px-2 py-1 rounded-full font-bold ${app.statusColor}`}
                                    >
                                        {app.status}
                                    </span>
                                </div>
                                {app.status === 'Approved' && (
                                    <div className="flex gap-2 ml-15">
                                        <Link
                                            to="/tenant/lease-details"
                                            className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors text-center"
                                        >
                                            View Lease
                                        </Link>
                                        <button
                                            onClick={() => setIsSignLeaseModalOpen(true)}
                                            className="flex-1 py-2 bg-[#137fec] hover:bg-[#0e64bd] text-white rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Sign Lease
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button className="w-full py-2 bg-[#137fec]/10 hover:bg-[#137fec]/20 text-[#137fec] rounded-lg text-xs font-bold transition-colors">
                            Check Status
                        </button>
                    </SectionCard>

                    {/* AI Assistant Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12">assistant</span>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Assistant</span>
                            </div>
                            <h4 className="font-bold text-lg leading-tight mb-2">Need help with your lease?</h4>
                            <p className="text-sm text-indigo-100 mb-4">You can ask HomeAI to clarify clauses or request repairs instantly.</p>
                            <button className="cursor-pointer inline-block w-full py-2 bg-white text-indigo-600 font-bold text-sm rounded-lg hover:bg-indigo-50 transition-colors text-center">Try HomeAI</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating AI Bar */}
            <AIAssistantWidget
                suggestions={['Request a repair', 'When is rent due?', 'Contact landlord']}
            />

            {/* Make Payment Modal */}
            <MakePaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />

            {/* Sign Lease Renewal Modal */}
            <SignLeaseRenewalModal
                isOpen={isSignLeaseModalOpen}
                onClose={() => setIsSignLeaseModalOpen(false)}
            />

            {/* Maintenance Request Modal */}
            <MaintenanceRequestModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
            />
        </PageContainer>
    );
}
