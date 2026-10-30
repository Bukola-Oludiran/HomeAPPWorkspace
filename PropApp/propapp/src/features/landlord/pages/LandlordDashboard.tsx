import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import StatsCard from '../../../components/common/StatsCard';
import SearchInput from '../../../components/common/SearchInput';
import FilterDropdown from '../../../components/FilterDropdown';
import AIAssistantWidget from '../../../components/common/AIAssistantWidget';
import { AnimatedGroup, MagneticButton } from '../../../components/animation';
import { landlordService } from '../../../lib/api/services/landlordService';
import type { LandlordDashboard as DashboardData } from '../../../types/dashboard';
import { formatCurrency } from '@/lib/format';

// Helper to format currency
// Helper to get status color (handles backend uppercase enums + legacy capitalized values)
function getStatusColor(status?: string): string {
    switch ((status ?? '').toUpperCase()) {
        case 'RENTED':
        case 'OCCUPIED':
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
        case 'ACTIVE':
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        case 'MAINTENANCE':
            return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
        case 'VACANT':
        case 'DRAFT':
            return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
        default:
            return 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300';
    }
}

// Helper to get payment status color
function getPaymentStatusColor(status?: string): string {
    const lower = (status ?? '').toLowerCase();
    if (lower.includes('paid') || lower.includes('on time') || lower.includes('occupied')) return 'text-green-600';
    if (lower.includes('overdue') || lower.includes('late')) return 'text-red-600';
    if (lower.includes('pending') || lower.includes('vacant')) return 'text-amber-600';
    return 'text-slate-500 dark:text-slate-400';
}

// Helper to get alert icon and colors
function getAlertStyle(type: string): { icon: string; bgColor: string; textColor: string; btnColor: string } {
    switch (type) {
        case 'MAINTENANCE_EMERGENCY':
            return { icon: 'build', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-600', btnColor: 'bg-red-600 hover:bg-red-700' };
        case 'VERIFICATION_PENDING':
        case 'APPLICATION_NEW':
            return { icon: 'verified_user', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-brand-ink', btnColor: 'bg-brand hover:bg-brand/90' };
        case 'LEASE_EXPIRING':
            return { icon: 'history_edu', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-600', btnColor: 'bg-orange-600 hover:bg-orange-700' };
        case 'PAYMENT_OVERDUE':
            return { icon: 'payments', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-600', btnColor: 'bg-red-600 hover:bg-red-700' };
        default:
            return { icon: 'info', bgColor: 'bg-slate-100 dark:bg-slate-900/30', textColor: 'text-slate-600', btnColor: 'bg-slate-600 hover:bg-slate-700' };
    }
}

// Placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';

export default function LandlordDashboardPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [propertyFilter, setPropertyFilter] = useState('all');
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch dashboard data on mount
    useEffect(() => {
        async function fetchDashboard() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await landlordService.getDashboard();
                setDashboardData(response.data);
            } catch (err) {
                console.error('Failed to fetch dashboard:', err);
                setError('Failed to load dashboard data');
            } finally {
                setIsLoading(false);
            }
        }

        fetchDashboard();
    }, []);

    // Filter properties based on selection
    const properties = dashboardData?.properties || [];
    const alerts = dashboardData?.alerts || [];

    const filteredProperties = properties.filter(property => {
        if (propertyFilter === 'all') return true;
        return (property.status ?? '').toUpperCase() === propertyFilter.toUpperCase();
    }).filter(property => {
        if (!searchQuery) return true;
        return (property.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (property.location ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    });
    return (
        <PageContainer>
            <PageHeader
                title="Landlord dashboard"
                subtitle="Welcome back. Here's what's happening with your portfolio today."
                actions={
                    <>
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold bg-slate-50 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">file_download</span> Report
                        </button>
                        <MagneticButton>
                            <Link to="/landlord/new-property" className="px-5 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">add_home</span> Add Property
                            </Link>
                        </MagneticButton>
                    </>
                }
            />

            {/* Stats Cards */}
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
            ) : (
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" stagger={0.1}>
                {/* Total Revenue */}
                <StatsCard
                    icon="payments"
                    iconColor="blue"
                    label="Total Revenue (Monthly)"
                    value={formatCurrency(dashboardData?.totalRevenue || 0)}
                    animateValue
                    numericValue={dashboardData?.totalRevenue || 0}
                    valuePrefix="₦"
                    change={{ value: `${dashboardData?.revenueChange && dashboardData.revenueChange > 0 ? '+' : ''}${dashboardData?.revenueChange || 0}%`, isPositive: (dashboardData?.revenueChange || 0) >= 0 }}
                />

                {/* Occupancy Rate */}
                <StatsCard
                    icon="pie_chart"
                    iconColor="purple"
                    label="Occupancy rate"
                    value={`${dashboardData?.occupancyRate || 0}%`}
                    animateValue
                    numericValue={dashboardData?.occupancyRate || 0}
                    valueSuffix="%"
                    badge={{ text: `${dashboardData?.vacantUnits ?? Math.max(0, (dashboardData?.totalProperties ?? 0) - Math.round((dashboardData?.totalProperties ?? 0) * (dashboardData?.occupancyRate ?? 0) / 100))} Units Vacant`, variant: "default" }}
                />

                {/* Active Listings */}
                <StatsCard
                    icon="real_estate_agent"
                    iconColor="orange"
                    label="Active listings"
                    value={String(dashboardData?.activeListings || 0)}
                    animateValue
                    numericValue={dashboardData?.activeListings || 0}
                    badge={{ text: `${dashboardData?.pendingListings ?? dashboardData?.pendingApplications ?? 0} Pending`, variant: "success" }}
                />

                {/* Action Required */}
                <div className="bg-white dark:bg-canvas-dark p-6 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Action required</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{dashboardData?.actionRequired ?? dashboardData?.alertCount ?? 0} Alerts</h3>
                    </div>
                </div>
            </AnimatedGroup>
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Properties List */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My properties</h2>
                        <div className="flex gap-2">
                            <SearchInput
                                placeholder="Search property..."
                                value={searchQuery}
                                onChange={setSearchQuery}
                                variant="compact"
                            />
                            <FilterDropdown
                                label="Filter"
                                options={[
                                    { id: 'all', label: 'All properties' },
                                    { id: 'ACTIVE', label: 'Active' },
                                    { id: 'RENTED', label: 'Rented' },
                                    { id: 'DRAFT', label: 'Draft' },
                                ]}
                                selected={propertyFilter === 'all' ? [] : [propertyFilter]}
                                onChange={(selected) => setPropertyFilter(selected.length > 0 ? selected[0] : 'all')}
                                multiple={false}
                                showClearButton={false}
                            />
                        </div>
                    </div>

                    <SectionCard padding="none">
                        {filteredProperties.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">home</span>
                                <p className="text-slate-500 dark:text-slate-400">No properties found</p>
                            </div>
                        ) : (
                        filteredProperties.map((property, index) => (
                            <Link
                                key={property.id}
                                to={`/landlord/properties/${property.id}`}
                                className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${index < filteredProperties.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                            >
                                <div className="w-full sm:w-24 h-40 sm:h-24 rounded-lg overflow-hidden shrink-0">
                                    <img
                                        alt={property.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        src={property.image || PLACEHOLDER_IMAGE}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{property.name}</h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                            {property.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{property.location}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                        {property.bedrooms ? (
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">bed</span> {property.bedrooms} Bed{property.bedrooms > 1 && 's'}
                                        </span>
                                        ) : null}
                                        {property.verificationTier && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">workspace_premium</span> {property.verificationTier}
                                            </span>
                                        )}
                                        {property.leaseEnd && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">calendar_month</span> Lease ends: {property.leaseEnd}
                                            </span>
                                        )}
                                        {property.views && (
                                            <span className="flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">visibility</span> {property.views} Views
                                            </span>
                                        )}
                                        {property.maintenance && (
                                            <span className="flex items-center gap-1 text-amber-600 font-medium">
                                                <span className="material-symbols-outlined text-[14px]">plumbing</span> {property.maintenance}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 hover:text-brand-ink transition-colors font-medium z-10" onClick={(e) => e.preventDefault()}>
                                            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">verified_user</span> Verify Status
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 w-full sm:w-auto mt-2 sm:mt-0 flex flex-row sm:flex-col justify-between items-center sm:items-end">
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(property.monthlyRent ?? property.price)}<span className="text-xs font-normal text-slate-500 dark:text-slate-400">{property.monthlyRent != null ? '/mo' : (property.priceUnit ?? '')}</span></p>
                                        <p className={`text-xs ${getPaymentStatusColor(property.occupancyStatus ?? property.paymentStatus)} font-medium`}>{property.occupancyStatus ?? property.paymentStatus ?? ''}</p>
                                    </div>
                                    <button className="sm:hidden p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400" onClick={(e) => e.preventDefault()}>
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                                <button className="hidden sm:block p-2 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={(e) => e.preventDefault()}>
                                    <span className="material-symbols-outlined">more_vert</span>
                                </button>
                            </Link>
                        ))
                        )}
                    </SectionCard>
                </div>

                {/* Right Sidebar */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Actionable alerts</h2>
                        <Link to="/landlord/alerts" className="text-sm font-semibold text-brand-ink hover:underline">View all</Link>
                    </div>

                    <SectionCard padding="sm" className="flex flex-col gap-4">
                        {alerts.length === 0 ? (
                            <div className="py-6 text-center">
                                <span className="material-symbols-outlined text-3xl text-green-500 mb-2">check_circle</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400">No alerts right now.</p>
                            </div>
                        ) : (
                            alerts.slice(0, 3).map((alert, index) => {
                                const style = getAlertStyle(alert.type);
                                return (
                                    <div key={alert.id} className={`flex gap-3 items-start ${index < Math.min(alerts.length, 3) - 1 ? 'pb-4 border-b border-slate-100 dark:border-slate-800' : ''}`}>
                                        <div className={`size-8 rounded-full ${style.bgColor} ${style.textColor} flex items-center justify-center shrink-0 mt-0.5`}>
                                            <span className="material-symbols-outlined text-[18px]">{style.icon}</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{alert.title}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{alert.description}</p>
                                            <div className="flex gap-2 mt-2">
                                                {alert.actionLabel && alert.actionUrl && (
                                                    <Link to={alert.actionUrl} className={`px-3 py-1 ${style.btnColor} text-white text-xs font-bold rounded-md transition-colors`}>
                                                        {alert.actionLabel}
                                                    </Link>
                                                )}
                                                <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md transition-colors">
                                                    Dismiss
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </SectionCard>

                    {/* AI Insights Card */}
                    <div className="bg-brand-ink rounded-2xl p-5 text-on-brand shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">forum</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Insights</span>
                            </div>
                            <h4 className="font-bold text-lg leading-tight mb-2">Optimize your rental yield</h4>
                            <p className="text-sm text-blue-100 mb-4">Based on market trends, you could increase rent for 1243 Oakwood by 5%.</p>
                            <button className="w-full py-2 bg-white text-brand-ink font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors">View analysis</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating AI Assistant */}
            <AIAssistantWidget />
        </PageContainer >
    );
}
