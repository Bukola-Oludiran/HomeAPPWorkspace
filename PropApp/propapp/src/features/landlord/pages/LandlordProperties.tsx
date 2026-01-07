import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SearchInput from '../../../components/common/SearchInput';
import ViewToggle from '../../../components/common/ViewToggle';
import FilterDropdown from '../../../components/FilterDropdown';
import { AnimatedGroup, MagneticButton } from '../../../components/animation';

// Mock property data
const propertiesData = {
    rented: [
        {
            id: 1,
            name: '5500 Highland Park',
            location: 'Dallas, TX',
            unit: 'Unit 4B',
            beds: 2,
            baths: 2,
            sqft: '1,200',
            price: '$3,200',
            priceType: '/mo',
            status: 'Rented',
            statusColor: 'bg-blue-500',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
        },
        {
            id: 2,
            name: '778 Sunnyvale Drive',
            location: 'Miami, FL',
            unit: 'Villa',
            beds: 5,
            baths: 4.5,
            sqft: '4,200',
            price: '$8,500',
            priceType: '/mo',
            status: 'Rented',
            statusColor: 'bg-blue-500',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmzjPVnnkN0L0Df5m-edXXtRPMb0L9UALdUYVZ31ftX2hZoPcXfkk9cX0ppWUHkpAgEHDPt5z8Myghlu_sUmGC0p8uMQv-HbrXijHeC8ALkQAuqFOKKQ6BIlW3DyxKXmR68V6YLZxFKGKU5QA3f9KSaxdE-ZqCwq8CHWNZkHkt-0KyKZ6b8s_6sdVzJ5nMB7lFYMvczzRv1xvvE-i968QA_YLancFg-0dheYj1DUN0ylsh3qHXXWFqzKCnpvKn_5mHg9ar3r3Pfdeb',
        },
    ],
    forSale: [
        {
            id: 3,
            name: '1243 Oakwood Avenue',
            location: 'Austin, TX',
            unit: 'Entire Home',
            beds: 4,
            baths: 3.5,
            sqft: '2,800',
            price: '$850,000',
            priceType: '',
            status: 'Active',
            statusColor: 'bg-green-500',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
        },
    ],
    vacant: [
        {
            id: 4,
            name: 'Downtown Loft',
            location: 'Seattle, WA',
            unit: 'Apt 402',
            beds: 1,
            baths: 1,
            sqft: 'HVAC',
            sqftIcon: 'plumbing',
            price: '$5,500',
            priceType: '/mo',
            status: 'Maintenance',
            statusColor: 'bg-amber-500',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDbn_i6RapAYYCUtbpApN4lJMQNrA0rGJZXVvlV5ZLubEMNH1omk_1mAstEefJ0spWkedOBAe5og228aYdYdVGMGx2otBaGsGAG_1DMh7rANSTYk0_MrBlyxCEDc66NFCgfMXVMcoMDPiPuhcBXg5_Iwjv_Fz2YEb4sU8vGb7xqSy9VX9nCTc1tUE2DL8uYW4jHmEa_B2GwMX24GP44NZ_TWI6Tc4Om0jvrCWW6cMyN3YxN1SrsIUBMkmeYENO3JUYvlZTV5Hn0Kqc',
        },
    ],
    incoming: [
        {
            id: 5,
            name: '8809 Westview Lane',
            location: 'Austin, TX',
            unit: 'Triplex',
            status: 'Under Contract',
            statusColor: 'bg-purple-600',
            progress: 75,
            progressLabel: 'Acquisition Progress',
            progressColor: 'bg-purple-600',
            closingDate: 'Oct 25',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
        },
        {
            id: 6,
            name: 'The Pinnacle, Unit 902',
            location: 'Chicago, IL',
            unit: 'Condo',
            status: 'Onboarding',
            statusColor: 'bg-orange-500',
            progress: 30,
            progressLabel: 'Onboarding Progress',
            progressColor: 'bg-orange-500',
            closingDate: 'Docs Pending',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAamBOyrzSpr22QFJVMWoHUc1mMMtnqiibkVvx1a1yyRMf7AZH_W5yo1RUtyBeDdX317BPpURBRfc781QxtqAke2rVYEqTii2io0uuHFkEJ0CmZ8MORlbNcSi1Rrn0MkZXgBn4TdOrfGT4AC6aP8LrSd-KrpDu9MncstN4oWLel5dWeiPY1Vna-TDIY0FVjIuHpWLA9XnqqLmHWL3dBb97dTEKd5I76wzI_hdZR1tk-bfpEmbo-gBSIaJNec2sLti-R_9FmipfOkxxP',
        },
    ],
};

// TypeScript interfaces for properties
interface BaseProperty {
    id: number;
    name: string;
    location: string;
    unit: string;
    status: string;
    statusColor: string;
    image: string;
}

interface RegularProperty extends BaseProperty {
    beds: number;
    baths: number;
    sqft: string;
    sqftIcon?: string;
    price: string;
    priceType: string;
}

interface IncomingProperty extends BaseProperty {
    progress: number;
    progressLabel: string;
    progressColor: string;
    closingDate: string;
}

type Property = RegularProperty | IncomingProperty;

// Property Card Component - Grid View
interface PropertyCardGridProps {
    property: Property;
    isIncoming?: boolean;
}

function PropertyCardGrid({ property, isIncoming = false }: PropertyCardGridProps) {
    const incomingProp = property as IncomingProperty;
    const regularProp = property as RegularProperty;

    return (
        <Link to={`/landlord/properties/${property.id}`} className={`bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col ${isIncoming ? 'relative' : ''}`}>
            {isIncoming && <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-900/50 pointer-events-none z-10"></div>}
            <div className={`relative h-48 overflow-hidden ${isIncoming ? 'grayscale opacity-80' : ''}`}>
                <img
                    alt="Property thumbnail"
                    className={`w-full h-full object-cover ${isIncoming ? '' : 'transition-transform duration-500 group-hover:scale-105'}`}
                    src={property.image}
                />
                <div className={`absolute top-3 right-3 flex gap-2 ${isIncoming ? 'z-20' : ''}`}>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${property.statusColor} text-white shadow-sm backdrop-blur-md bg-opacity-90`}>
                        {property.status}
                    </span>
                </div>
            </div>
            <div className={`p-5 flex-1 flex flex-col ${isIncoming ? 'relative z-20' : ''}`}>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{property.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{property.location} • {property.unit}</p>
                    </div>
                </div>
                {isIncoming ? (
                    <>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4 mt-2">
                            <div className={`${incomingProp.progressColor} h-2 rounded-full`} style={{ width: `${incomingProp.progress}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs mb-4">
                            <span className="text-slate-500 font-medium">{incomingProp.progressLabel}</span>
                            <span className={`${incomingProp.progressColor === 'bg-purple-600' ? 'text-purple-600' : 'text-orange-600'} font-bold`}>{incomingProp.progress}%</span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500">{incomingProp.closingDate.includes('Docs') ? incomingProp.closingDate : `Closing: ${incomingProp.closingDate}`}</span>
                            <Link to={`/landlord/verification`} className={`flex items-center gap-1.5 text-xs font-bold ${incomingProp.progressColor === 'bg-purple-600' ? 'text-purple-600 hover:text-purple-700 bg-purple-50 dark:bg-purple-900/20' : 'text-orange-600 hover:text-orange-700 bg-orange-50 dark:bg-orange-900/20'} transition-colors px-3 py-1.5 rounded-full`}>
                                <span className="material-symbols-outlined text-[16px]">verified_user</span> Verify Status
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-4 my-3 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-[16px]">bed</span> {regularProp.beds}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-[16px]">bathtub</span> {regularProp.baths}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded">
                                <span className="material-symbols-outlined text-[16px]">{regularProp.sqftIcon || 'square_foot'}</span> {regularProp.sqft}
                            </span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{regularProp.price}<span className="text-xs font-normal text-slate-400">{regularProp.priceType}</span></p>
                            </div>
                            <Link to={`/landlord/verification`} className="flex items-center gap-1.5 text-xs font-bold text-[#137fec] hover:text-[#137fec]/80 transition-colors bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-[16px]">verified_user</span> Verify Status
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </Link>
    );
}

// Property Card Component - List View
interface PropertyCardListProps {
    property: Property;
    isIncoming?: boolean;
    verifyColor?: string;
}

function PropertyCardList({ property, isIncoming = false, verifyColor = 'primary' }: PropertyCardListProps) {
    const incomingProp = property as IncomingProperty;
    const regularProp = property as RegularProperty;

    const getVerifyButtonClass = () => {
        switch (verifyColor) {
            case 'green':
                return 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400';
            case 'amber':
                return 'bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-700 dark:text-amber-400';
            case 'purple':
                return 'bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-400';
            case 'orange':
                return 'bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/40 text-orange-700 dark:text-orange-400';
            default:
                return 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-[#137fec]';
        }
    };

    return (
        <div className={`bg-white dark:bg-[#101922] rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-all flex flex-col md:flex-row ${isIncoming ? 'relative' : ''}`}>
            {isIncoming && <div className="absolute inset-0 bg-slate-50/30 dark:bg-slate-900/30 pointer-events-none z-10"></div>}
            <div className={`relative w-full md:w-64 h-48 md:h-auto shrink-0 overflow-hidden ${isIncoming ? 'grayscale opacity-90' : ''}`}>
                <img
                    alt="Property thumbnail"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={property.image}
                />
                <div className={`absolute top-3 left-3 ${isIncoming ? 'z-20' : ''}`}>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${property.statusColor} text-white shadow-sm backdrop-blur-md bg-opacity-95`}>
                        {property.status}
                    </span>
                </div>
            </div>
            <div className={`p-4 flex-1 flex flex-col md:flex-row gap-4 ${isIncoming ? 'relative z-20' : ''}`}>
                <div className="flex-1 flex flex-col justify-center">
                    <div className="mb-1.5">
                        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight mb-0.5">{property.name}</h3>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">location_on</span> {property.location} • {property.unit}
                        </p>
                    </div>
                    {isIncoming ? (
                        <div className="w-full max-w-md">
                            <div className="flex justify-between items-center mb-1.5">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{incomingProp.progressLabel}</span>
                                <span className={`text-sm font-bold ${incomingProp.progressColor === 'bg-purple-600' ? 'text-purple-600' : 'text-orange-600'}`}>{incomingProp.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                <div className={`${incomingProp.progressColor} h-full rounded-full relative`} style={{ width: `${incomingProp.progress}%` }}>
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center flex-wrap gap-3 mt-1 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">bed</span> {regularProp.beds} Beds</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">bathtub</span> {regularProp.baths} Baths</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                            <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px]">{regularProp.sqftIcon || 'square_foot'}</span> {regularProp.sqft} {regularProp.sqftIcon ? '' : 'sqft'}</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-row md:flex-col justify-between items-center md:items-end md:justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-4 min-w-[160px] gap-3">
                    <div className="text-right">
                        {isIncoming ? (
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full mb-1">
                                <span className="material-symbols-outlined text-[16px]">{incomingProp.closingDate.includes('Docs') ? 'pending_actions' : 'event'}</span> {incomingProp.closingDate.includes('Docs') ? incomingProp.closingDate : `Closing: ${incomingProp.closingDate}`}
                            </div>
                        ) : (
                            <p className="text-lg font-bold text-slate-900 dark:text-white">{regularProp.price}<span className="text-xs font-normal text-slate-400">{regularProp.priceType}</span></p>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <Link to={`/landlord/properties/${property.id}`} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors">
                            {isIncoming ? 'Details' : 'View Details'}
                        </Link>
                        <button className={`px-3 py-1.5 rounded-lg ${getVerifyButtonClass()} font-bold text-xs transition-colors flex items-center gap-1`}>
                            <span className="material-symbols-outlined text-[16px]">verified_user</span> Verify
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LandlordProperties() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [propertyFilter, setPropertyFilter] = useState('all');

    return (
        <PageContainer>
            <PageHeader
                title="Properties"
                subtitle="Manage your active portfolio and track incoming acquisitions."
                actions={
                    <>
                        <FilterDropdown
                            label="Filter"
                            options={[
                                { id: 'all', label: 'All Properties' },
                                { id: 'Rented', label: 'Rented' },
                                { id: 'Active', label: 'Active' },
                                { id: 'Maintenance', label: 'Maintenance' },
                                { id: 'Vacant', label: 'Vacant' },
                                { id: 'Under Contract', label: 'Under Contract' },
                                { id: 'Onboarding', label: 'Onboarding' },
                            ]}
                            selected={propertyFilter === 'all' ? [] : [propertyFilter]}
                            onChange={(selected) => setPropertyFilter(selected.length > 0 ? selected[0] : 'all')}
                            multiple={false}
                            showClearButton={false}
                        />
                        <MagneticButton>
                            <Link to="/landlord/new-property" className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">add_home</span> Add Property
                            </Link>
                        </MagneticButton>
                    </>
                }
            />

            {/* Search and View Toggle */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10 items-center justify-between">
                <SearchInput
                    placeholder="Search by address, city, or tenant..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    className="w-full sm:w-96"
                />
                <ViewToggle value={viewMode} onChange={setViewMode} />
            </div>

            {/* Rented Properties Section */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Rented Properties
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">{propertiesData.rented.length}</span>
                    </h2>
                </div>
                {viewMode === 'grid' ? (
                    <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" stagger={0.06}>
                        {propertiesData.rented.map((property) => (
                            <PropertyCardGrid key={property.id} property={property} />
                        ))}
                    </AnimatedGroup>
                ) : (
                    <AnimatedGroup className="flex flex-col gap-3" stagger={0.05}>
                        {propertiesData.rented.map((property) => (
                            <PropertyCardList key={property.id} property={property} verifyColor="primary" />
                        ))}
                    </AnimatedGroup>
                )}
            </section>

            {/* Properties For Sale Section */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Properties For Sale
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">{propertiesData.forSale.length}</span>
                    </h2>
                </div>
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {propertiesData.forSale.map((property) => (
                            <PropertyCardGrid key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {propertiesData.forSale.map((property) => (
                            <PropertyCardList key={property.id} property={property} verifyColor="green" />
                        ))}
                    </div>
                )}
            </section>

            {/* Vacant Properties Section */}
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Vacant Properties
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">{propertiesData.vacant.length}</span>
                    </h2>
                </div>
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {propertiesData.vacant.map((property) => (
                            <PropertyCardGrid key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {propertiesData.vacant.map((property) => (
                            <PropertyCardList key={property.id} property={property} verifyColor="amber" />
                        ))}
                    </div>
                )}
            </section>

            {/* Incoming Properties Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Incoming Properties
                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{propertiesData.incoming.length} Processing</span>
                    </h2>
                </div>
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {propertiesData.incoming.map((property) => (
                            <PropertyCardGrid key={property.id} property={property as any} isIncoming />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {propertiesData.incoming.map((property) => (
                            <PropertyCardList
                                key={property.id}
                                property={property as any}
                                isIncoming
                                verifyColor={property.statusColor === 'bg-purple-600' ? 'purple' : 'orange'}
                            />
                        ))}
                    </div>
                )}
            </section>
        </PageContainer>
    );
}
