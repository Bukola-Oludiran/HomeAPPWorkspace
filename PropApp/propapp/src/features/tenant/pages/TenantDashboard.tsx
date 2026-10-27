import { useState, useEffect } from 'react';
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
import { useAuth } from '../../../contexts/AuthContext';
import { tenantService } from '../../../lib/api/services/tenantService';
import type { TenantDashboard as DashboardData } from '../../../types/dashboard';

// Helper to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'CAD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper to format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}


// Placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';

export default function TenantDashboardPage() {
    const { user } = useAuth();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isSignLeaseModalOpen, setIsSignLeaseModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get user's first name for greeting
    const userName = user?.firstName || 'there';

    // Fetch dashboard data on mount
    useEffect(() => {
        async function fetchDashboard() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await tenantService.getDashboard();
                setDashboardData(response.data);
            } catch (err) {
                console.error('Failed to fetch tenant dashboard:', err);
                setError('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboard();
    }, []);

    return (
        <PageContainer>
            <PageHeader
                title="Tenant Dashboard"
                subtitle={`Welcome back, ${userName}. Here's your rental overview.`}
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
                            className="px-5 py-2.5 rounded-lg bg-brand hover:bg-brand/90 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">payments</span> Pay Rent
                        </button>
                    </>
                }
            />

            {/* Stats Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-canvas-dark p-6 rounded-2xl animate-pulse">
                            <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
                            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="mb-10 p-6 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-red-500 text-3xl mb-2">error</span>
                    <p className="text-red-600 dark:text-red-400">{error}</p>
                    <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                        Retry
                    </button>
                </div>
            ) : dashboardData ? (
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" stagger={0.1}>
                {/* Next Rent Payment */}
                <StatsCard
                    icon="calendar_today"
                    iconColor="blue"
                    label="Next Rent Payment"
                    value={formatCurrency(dashboardData.nextPayment.amount)}
                    animateValue
                    numericValue={dashboardData.nextPayment.amount}
                    valuePrefix="$"
                    badge={{ text: dashboardData.nextPayment.status, variant: dashboardData.nextPayment.status === 'Paid' ? 'success' : 'warning' }}
                    subtext={`Due: ${formatDate(dashboardData.nextPayment.dueDate)}`}
                />

                {/* Lease Status */}
                <StatsCard
                    icon="contract"
                    iconColor="purple"
                    label="Lease Status"
                    value={dashboardData.lease.remaining}
                    badge={{ text: dashboardData.lease.status, variant: dashboardData.lease.status === 'Active' ? 'success' : 'warning' }}
                    subtext={`Ends: ${formatDate(dashboardData.lease.endDate)}`}
                />

                {/* Open Requests */}
                <StatsCard
                    icon="home_repair_service"
                    iconColor="amber"
                    label="Maintenance Requests"
                    value={`${dashboardData.maintenanceRequests} Open`}
                    subtext="Active maintenance items"
                />

                {/* Applications */}
                <StatsCard
                    icon="description"
                    iconColor="indigo"
                    label="Applications"
                    value={`${dashboardData.applicationsList?.length || 0} Total`}
                    badge={{ text: `${dashboardData.savedProperties?.length || 0} Saved`, variant: "default" }}
                    subtext="Property applications"
                />
            </AnimatedGroup>
            ) : null}

            {/* Main Content Grid */}
            {dashboardData && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Main Column */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    {/* Current Rental */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Current Rental</h2>
                        <Link to="/tenant/lease-details" className="text-sm text-brand font-semibold hover:underline">
                            View Lease Details
                        </Link>
                    </div>
                    {dashboardData.property ? (
                    <SectionCard padding="none">
                        <div className="relative h-64 md:h-80 w-full">
                            <img
                                alt="Current Property"
                                className="w-full h-full object-cover"
                                src={dashboardData.property.image || PLACEHOLDER_IMAGE}
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
                                        {dashboardData.property.name}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        {dashboardData.property.address}
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
                                        {formatCurrency(dashboardData.property.monthlyRent)}
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
                                        {formatDate(dashboardData.property.leaseStart)} - {formatDate(dashboardData.property.leaseEnd)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                                        Property Manager
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {dashboardData.property.landlordAvatar ? (
                                            <img src={dashboardData.property.landlordAvatar} alt="" className="size-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="size-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                                                {dashboardData.property.landlordName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                                {dashboardData.property.landlordName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SectionCard>
                    ) : (
                        <SectionCard className="text-center py-12">
                            <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">home</span>
                            <p className="text-slate-500 dark:text-slate-400">No active rental</p>
                            <Link to="/search" className="mt-4 inline-block px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90">
                                Browse Properties
                            </Link>
                        </SectionCard>
                    )}

                    {/* Saved Properties */}
                    <div className="flex items-center justify-between mt-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Saved Properties</h2>
                        <Link to="/tenant/saved" className="text-sm text-brand font-semibold hover:underline">
                            View All
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {dashboardData.savedProperties.map((property) => (
                            <div
                                key={property.id}
                                className="bg-white dark:bg-canvas-dark p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex gap-3 cursor-pointer hover:border-brand/50 transition-colors"
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
                                    <p className="text-sm font-bold text-brand mt-2">
                                        {property.price}
                                        <span className="text-slate-400 font-normal text-xs">/mo</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                        <Link
                            to="/search"
                            className="bg-white dark:bg-canvas-dark p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex gap-3 cursor-pointer hover:border-brand/50 transition-colors"
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
                                            className={`text-xs px-1.5 py-0.5 rounded font-bold ${item.statusColor}`}
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
                                        className={`text-xs px-2 py-1 rounded-full font-bold ${app.statusColor}`}
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
                                            className="flex-1 py-2 bg-brand hover:bg-[#0e64bd] text-white rounded-lg text-xs font-bold transition-colors"
                                        >
                                            Sign Lease
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                        <button className="w-full py-2 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-xs font-bold transition-colors">
                            Check Status
                        </button>
                    </SectionCard>

                    {/* AI Assistant Card */}
                    <div className="bg-brand rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">forum</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Assistant</span>
                            </div>
                            <h4 className="font-bold text-lg leading-tight mb-2">Need help with your lease?</h4>
                            <p className="text-sm text-blue-100 mb-4">You can ask HomeAI to clarify clauses or request repairs instantly.</p>
                            <button className="cursor-pointer inline-block w-full py-2 bg-white text-brand font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors text-center">Try HomeAI</button>
                        </div>
                    </div>
                </div>
            </div>
            )}

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
