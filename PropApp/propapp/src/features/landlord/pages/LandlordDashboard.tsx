import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SectionCard from '../../../components/common/SectionCard';
import StatsCard from '../../../components/common/StatsCard';
import SearchInput from '../../../components/common/SearchInput';
import FilterDropdown from '../../../components/FilterDropdown';
import AIAssistantWidget from '../../../components/common/AIAssistantWidget';
import { AnimatedGroup, MagneticButton } from '../../../components/animation';

// Mock properties data
const propertiesData = [
    {
        id: 1,
        name: '5500 Highland Park',
        location: 'Dallas, TX • Unit 4B',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
        status: 'Rented',
        statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        beds: 2,
        leaseEnd: 'Nov 2024',
        price: '$3,200',
        priceType: '/mo',
        paymentStatus: 'Paid on time',
        paymentColor: 'text-green-600',
    },
    {
        id: 2,
        name: '1243 Oakwood Avenue',
        location: 'Austin, TX • Entire Home',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
        status: 'Active',
        statusColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        beds: 4,
        views: 450,
        price: '$850,000',
        priceType: '',
        paymentStatus: 'Listed 3 days ago',
        paymentColor: 'text-slate-500',
    },
    {
        id: 3,
        name: 'Downtown Loft',
        location: 'Seattle, WA • Apt 402',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDbn_i6RapAYYCUtbpApN4lJMQNrA0rGJZXVvlV5ZLubEMNH1omk_1mAstEefJ0spWkedOBAe5og228aYdYdVGMGx2otBaGsGAG_1DMh7rANSTYk0_MrBlyxCEDc66NFCgfMXVMcoMDPiPuhcBXg5_Iwjv_Fz2YEb4sU8vGb7xqSy9VX9nCTc1tUE2DL8uYW4jHmEa_B2GwMX24GP44NZ_TWI6Tc4Om0jvrCWW6cMyN3YxN1SrsIUBMkmeYENO3JUYvlZTV5Hn0Kqc',
        status: 'Maintenance',
        statusColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
        beds: 1,
        maintenance: 'HVAC Repair',
        price: '$5,500',
        priceType: '/mo',
        paymentStatus: 'Off market',
        paymentColor: 'text-amber-600',
    },
    {
        id: 4,
        name: '778 Sunnyvale Drive',
        location: 'Miami, FL • Villa',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmzjPVnnkN0L0Df5m-edXXtRPMb0L9UALdUYVZ31ftX2hZoPcXfkk9cX0ppWUHkpAgEHDPt5z8Myghlu_sUmGC0p8uMQv-HbrXijHeC8ALkQAuqFOKKQ6BIlW3DyxKXmR68V6YLZxFKGKU5QA3f9KSaxdE-ZqCwq8CHWNZkHkt-0KyKZ6b8s_6sdVzJ5nMB7lFYMvczzRv1xvvE-i968QA_YLancFg-0dheYj1DUN0ylsh3qHXXWFqzKCnpvKn_5mHg9ar3r3Pfdeb',
        status: 'Rented',
        statusColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
        beds: 5,
        leaseEnd: 'Aug 2025',
        price: '$8,500',
        priceType: '/mo',
        paymentStatus: 'Paid on time',
        paymentColor: 'text-green-600',
    },
];

export default function LandlordDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [propertyFilter, setPropertyFilter] = useState('all');

    // Filter properties based on selection
    const filteredProperties = propertiesData.filter(property => {
        if (propertyFilter === 'all') return true;
        return property.status === propertyFilter;
    }).filter(property => {
        if (!searchQuery) return true;
        return property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.location.toLowerCase().includes(searchQuery.toLowerCase());
    });
    return (
        <PageContainer>
            <PageHeader
                title="Landlord Dashboard"
                subtitle="Welcome back. Here's what's happening with your portfolio today."
                actions={
                    <>
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold bg-slate-50 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">file_download</span> Report
                        </button>
                        <MagneticButton>
                            <Link to="/landlord/new-property" className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">add_home</span> Add Property
                            </Link>
                        </MagneticButton>
                    </>
                }
            />

            {/* Stats Cards */}
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10" stagger={0.1}>
                {/* Total Revenue */}
                <StatsCard
                    icon="attach_money"
                    iconColor="blue"
                    label="Total Revenue (Monthly)"
                    value="$24,850"
                    animateValue
                    numericValue={24850}
                    valuePrefix="$"
                    change={{ value: "+12.5%", isPositive: true }}
                />

                {/* Occupancy Rate */}
                <StatsCard
                    icon="pie_chart"
                    iconColor="purple"
                    label="Occupancy Rate"
                    value="92%"
                    animateValue
                    numericValue={92}
                    valueSuffix="%"
                    badge={{ text: "4 Units Vacant", variant: "default" }}
                />

                {/* Active Listings */}
                <StatsCard
                    icon="real_estate_agent"
                    iconColor="orange"
                    label="Active Listings"
                    value="12"
                    animateValue
                    numericValue={12}
                    badge={{ text: "2 Pending", variant: "success" }}
                />

                {/* Action Required */}
                <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl">
                            <span className="material-symbols-outlined">warning</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Action Required</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">3 Alerts</h3>
                    </div>
                </div>
            </AnimatedGroup>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Properties List */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Properties</h2>
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
                                    { id: 'all', label: 'All Properties' },
                                    { id: 'Rented', label: 'Rented' },
                                    { id: 'Active', label: 'Active' },
                                    { id: 'Maintenance', label: 'Maintenance' },
                                    { id: 'Vacant', label: 'Vacant' },
                                ]}
                                selected={propertyFilter === 'all' ? [] : [propertyFilter]}
                                onChange={(selected) => setPropertyFilter(selected.length > 0 ? selected[0] : 'all')}
                                multiple={false}
                                showClearButton={false}
                            />
                        </div>
                    </div>

                    <SectionCard padding="none">
                        {filteredProperties.map((property, index) => (
                            <Link
                                key={property.id}
                                to={`/landlord/properties/${property.id}`}
                                className={`group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${index < propertiesData.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                            >
                                <div className="w-full sm:w-24 h-40 sm:h-24 rounded-lg overflow-hidden shrink-0">
                                    <img
                                        alt={property.name}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        src={property.image}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">{property.name}</h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${property.statusColor}`}>
                                            {property.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{property.location}</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">bed</span> {property.beds} Bed{property.beds > 1 && 's'}
                                        </span>
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
                                        <span className="flex items-center gap-1 hover:text-[#137fec] transition-colors font-medium z-10" onClick={(e) => e.preventDefault()}>
                                            <span className="material-symbols-outlined text-[16px] text-blue-600 dark:text-blue-400">verified_user</span> Verify Status
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0 w-full sm:w-auto mt-2 sm:mt-0 flex flex-row sm:flex-col justify-between items-center sm:items-end">
                                    <div>
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{property.price}<span className="text-xs font-normal text-slate-400">{property.priceType}</span></p>
                                        <p className={`text-xs ${property.paymentColor} font-medium`}>{property.paymentStatus}</p>
                                    </div>
                                    <button className="sm:hidden p-2 bg-slate-50 dark:bg-slate-800 text-slate-400" onClick={(e) => e.preventDefault()}>
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                                <button className="hidden sm:block p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={(e) => e.preventDefault()}>
                                    <span className="material-symbols-outlined">more_vert</span>
                                </button>
                            </Link>
                        ))}
                    </SectionCard>
                </div>

                {/* Right Sidebar */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Actionable Alerts</h2>
                        <Link to="/landlord/alerts" className="text-sm font-semibold text-[#137fec] hover:underline">View All</Link>
                    </div>

                    <SectionCard padding="sm" className="flex flex-col gap-4">
                        {/* Emergency Maintenance Alert */}
                        <div className="flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[18px]">build</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Maintenance</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Downtown Loft reported water leak in master bathroom.</p>
                                <div className="flex gap-2 mt-2">
                                    <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md transition-colors">Respond</button>
                                    <Link to="/landlord/maintenance/1" className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md transition-colors">View</Link>
                                </div>
                            </div>
                        </div>

                        {/* Tenant Verification Alert */}
                        <div className="flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-[#137fec] flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Tenant Verification</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Background check completed for Sarah Johnson (1243 Oakwood).</p>
                                <div className="flex gap-2 mt-2">
                                    <button className="px-3 py-1 bg-[#137fec] hover:bg-[#137fec]/90 text-white text-xs font-bold rounded-md transition-colors">Approve</button>
                                    <button className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md transition-colors">Review</button>
                                </div>
                            </div>
                        </div>

                        {/* Lease Expiring Alert */}
                        <div className="flex gap-3 items-start">
                            <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                                <span className="material-symbols-outlined text-[18px]">history_edu</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Lease Expiring</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Unit 4B lease expires in 30 days. Renewal proposal ready.</p>
                                <div className="flex gap-2 mt-2">
                                    <button className="px-3 py-1 bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 hover:border-[#137fec] hover:text-[#137fec] text-slate-700 dark:text-slate-300 text-xs font-bold rounded-md transition-colors">Send Offer</button>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* AI Insights Card */}
                    <div className="bg-gradient-to-br from-[#137fec] to-blue-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12">smart_toy</span>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">smart_toy</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Insights</span>
                            </div>
                            <h4 className="font-bold text-lg leading-tight mb-2">Optimize your rental yield</h4>
                            <p className="text-sm text-blue-100 mb-4">Based on market trends, you could increase rent for 1243 Oakwood by 5%.</p>
                            <button className="w-full py-2 bg-white text-[#137fec] font-bold text-sm rounded-lg hover:bg-blue-50 transition-colors">View Analysis</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating AI Assistant */}
            <AIAssistantWidget />
        </PageContainer >
    );
}
