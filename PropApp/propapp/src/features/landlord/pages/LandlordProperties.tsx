import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SearchInput from '../../../components/common/SearchInput';
import ViewToggle from '../../../components/common/ViewToggle';
import FilterDropdown from '../../../components/FilterDropdown';
import { AnimatedGroup, MagneticButton } from '../../../components/animation';
import { landlordService } from '../../../lib/api/services/landlordService';
import type { PropertySummary } from '../../../types/property';
import { formatCurrency, listingPrice } from '@/lib/format';
import type { ContourFragment } from '../../../components/common/ContourMotif';

// Single-card rows leave the right of the page empty; a large fragment fills it, reaching under the cards
const CONTOUR: ContourFragment[] = [
    'top-[22%] left-[52%] -translate-x-1/2 -translate-y-1/2 -rotate-12 w-[95vw] max-w-[1300px]',
    '-bottom-28 -right-48 w-[55vw] max-w-[560px]',
];

// Placeholder image for properties without images
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';

// Helper to format currency
// Helper to format square feet for display
function formatSquareFeet(sqft?: number): string {
    if (!sqft) return 'N/A';
    return sqft.toLocaleString();
}

// Helper to get price type suffix based on listing type

// Helper to get status display info
function getStatusInfo(status: string, listingType: string): { label: string; color: string } {
    switch (status) {
        case 'RENTED':
            return { label: 'Rented', color: 'bg-blue-500' };
        case 'SOLD':
            return { label: 'Sold', color: 'bg-green-500' };
        case 'ACTIVE':
            if (listingType === 'SALE') return { label: 'Active', color: 'bg-green-500' };
            return { label: 'Vacant', color: 'bg-amber-500' };
        case 'DRAFT':
            return { label: 'Onboarding', color: 'bg-orange-500' };
        case 'PENDING_REVIEW':
            return { label: 'Under Review', color: 'bg-yellow-500' };
        case 'INACTIVE':
            return { label: 'Inactive', color: 'bg-slate-500' };
        case 'DELISTED':
            return { label: 'Delisted', color: 'bg-rose-500' };
        default:
            return { label: status, color: 'bg-slate-500' };
    }
}

// Extract city/state from nested or flat address fields
function getLocation(property: PropertySummary): string {
    const extra = property as unknown as Record<string, unknown>;
    const city = property.address?.city || (extra.addressCity as string) || '';
    const state = property.address?.state || (extra.addressState as string) || '';
    return [city, state].filter(Boolean).join(', ');
}

// Transform API PropertySummary to UI format
function transformProperty(property: PropertySummary): RegularProperty {
    const statusInfo = getStatusInfo(property.status, property.listingType);
    return {
        id: property.id,
        name: property.name,
        location: getLocation(property),
        unit: (property.propertyType || '').replace('_', ' '),
        beds: property.bedrooms ?? 0,
        baths: property.bathrooms ?? 0,
        sqft: formatSquareFeet(property.squareFeet ?? undefined),
        price: formatCurrency(listingPrice(property.price, property.priceUnit).amount),
        priceType: listingPrice(property.price, property.priceUnit).suffix,
        status: statusInfo.label,
        statusColor: statusInfo.color,
        image: property.primaryImage || PLACEHOLDER_IMAGE,
    };
}

// Transform API PropertySummary to incoming property format (for drafts)
function transformIncomingProperty(property: PropertySummary): IncomingProperty {
    const statusInfo = getStatusInfo(property.status, property.listingType);
    return {
        id: property.id,
        name: property.name,
        location: getLocation(property),
        unit: (property.propertyType || '').replace('_', ' '),
        status: statusInfo.label,
        statusColor: statusInfo.color,
        progress: 30, // Default progress for drafts
        progressLabel: 'Onboarding progress',
        progressColor: 'bg-orange-500',
        closingDate: 'Docs Pending',
        image: property.primaryImage || PLACEHOLDER_IMAGE,
    };
}

// TypeScript interfaces for properties
interface BaseProperty {
    id: string;
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

// Categorized properties structure
interface CategorizedProperties {
    rented: RegularProperty[];
    forSale: RegularProperty[];
    vacant: RegularProperty[];
    incoming: IncomingProperty[];
}

// Categorize properties based on status and listing type
function categorizeProperties(properties: PropertySummary[]): CategorizedProperties {
    const result: CategorizedProperties = {
        rented: [],
        forSale: [],
        vacant: [],
        incoming: [],
    };

    for (const property of properties) {
        if (property.status === 'DRAFT') {
            result.incoming.push(transformIncomingProperty(property));
        } else if (property.status === 'RENTED') {
            result.rented.push(transformProperty(property));
        } else if (property.status === 'SOLD') {
            result.forSale.push(transformProperty(property));
        } else if (property.status === 'ACTIVE') {
            if (property.listingType === 'SALE') {
                result.forSale.push(transformProperty(property));
            } else {
                result.vacant.push(transformProperty(property));
            }
        }
    }

    return result;
}

// Property Card Component - Grid View
interface PropertyCardGridProps {
    property: Property;
    isIncoming?: boolean;
}

function PropertyCardGrid({ property, isIncoming = false }: PropertyCardGridProps) {
    const navigate = useNavigate();
    const incomingProp = property as IncomingProperty;
    const regularProp = property as RegularProperty;

    return (
        <Link to={`/landlord/properties/${property.id}`} className={`bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all flex flex-col ${isIncoming ? 'relative' : ''}`}>
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
                            <span className="text-slate-500 dark:text-slate-400 font-medium">{incomingProp.progressLabel}</span>
                            <span className={`${incomingProp.progressColor === 'bg-purple-600' ? 'text-purple-600' : 'text-orange-600'} font-bold`}>{incomingProp.progress}%</span>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{incomingProp.closingDate.includes('Docs') ? incomingProp.closingDate : `Closing: ${incomingProp.closingDate}`}</span>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/landlord/verification'); }} className={`flex items-center gap-1.5 text-xs font-bold ${incomingProp.progressColor === 'bg-purple-600' ? 'text-purple-600 hover:text-purple-700 bg-purple-50 dark:bg-purple-900/20' : 'text-orange-600 hover:text-orange-700 bg-orange-50 dark:bg-orange-900/20'} transition-colors px-3 py-1.5 rounded-full`}>
                                <span className="material-symbols-outlined text-[16px]">verified_user</span> Verify Status
                            </button>
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
                                <p className="text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">{regularProp.price}<span className="text-xs font-normal text-slate-500 dark:text-slate-400">{regularProp.priceType}</span></p>
                            </div>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/landlord/verification'); }} className="flex items-center gap-1.5 text-xs font-bold text-brand-ink hover:text-brand-ink/80 transition-colors bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-[16px]">verified_user</span> Verify Status
                            </button>
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
                return 'bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-brand-ink';
        }
    };

    return (
        <div className={`bg-white dark:bg-canvas-dark rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden group hover:shadow-md transition-all flex flex-col md:flex-row ${isIncoming ? 'relative' : ''}`}>
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
                                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{incomingProp.progressLabel}</span>
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
                            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full mb-1">
                                <span className="material-symbols-outlined text-[16px]">{incomingProp.closingDate.includes('Docs') ? 'pending_actions' : 'event'}</span> {incomingProp.closingDate.includes('Docs') ? incomingProp.closingDate : `Closing: ${incomingProp.closingDate}`}
                            </div>
                        ) : (
                            <p className="text-lg font-bold text-slate-900 dark:text-white whitespace-nowrap">{regularProp.price}<span className="text-xs font-normal text-slate-500 dark:text-slate-400">{regularProp.priceType}</span></p>
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
    const [propertiesData, setPropertiesData] = useState<CategorizedProperties>({
        rented: [],
        forSale: [],
        vacant: [],
        incoming: [],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch properties on mount
    useEffect(() => {
        async function fetchProperties() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await landlordService.getProperties({ limit: 100 });
                const categorized = categorizeProperties(response.data);
                setPropertiesData(categorized);
            } catch (err) {
                console.error('Failed to fetch properties:', err);
                setError('Failed to load properties');
            } finally {
                setIsLoading(false);
            }
        }

        fetchProperties();
    }, []);

    // Filter properties based on search query
    const filterBySearch = <T extends BaseProperty>(properties: T[]): T[] => {
        if (!searchQuery) return properties;
        const query = searchQuery.toLowerCase();
        return properties.filter(p =>
            (p.name ?? "").toLowerCase().includes(query) ||
            (p.location ?? "").toLowerCase().includes(query)
        );
    };

    // Apply search filter to all categories
    const filteredRented = filterBySearch(propertiesData.rented);
    const filteredForSale = filterBySearch(propertiesData.forSale);
    const filteredVacant = filterBySearch(propertiesData.vacant);
    const filteredIncoming = filterBySearch(propertiesData.incoming);

    // Loading state
    if (isLoading) {
        return (
            <PageContainer>
                <PageHeader
                    title="Properties"
                    subtitle="Manage your active portfolio and track incoming acquisitions."
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-pulse">
                            <div className="h-48 bg-slate-200 dark:bg-slate-700" />
                            <div className="p-5">
                                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
                                <div className="flex gap-2">
                                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12" />
                                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12" />
                                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-12" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </PageContainer>
        );
    }

    // Error state
    if (error) {
        return (
            <PageContainer>
                <PageHeader
                    title="Properties"
                    subtitle="Manage your active portfolio and track incoming acquisitions."
                />
                <div className="p-12 bg-red-50 dark:bg-red-900/20 rounded-2xl text-center">
                    <span className="material-symbols-outlined text-red-500 text-4xl mb-3">error</span>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold"
                    >
                        Retry
                    </button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer motif={CONTOUR}>
            <PageHeader
                title="Properties"
                subtitle="Manage your active portfolio and track incoming acquisitions."
                actions={
                    <>
                        <FilterDropdown
                            label="Filter"
                            options={[
                                { id: 'all', label: 'All properties' },
                                { id: 'Rented', label: 'Rented' },
                                { id: 'Active', label: 'Active' },
                                { id: 'Maintenance', label: 'Maintenance' },
                                { id: 'Vacant', label: 'Vacant' },
                                { id: 'Under Contract', label: 'Under contract' },
                                { id: 'Onboarding', label: 'Onboarding' },
                            ]}
                            selected={propertyFilter === 'all' ? [] : [propertyFilter]}
                            onChange={(selected) => setPropertyFilter(selected.length > 0 ? selected[0] : 'all')}
                            multiple={false}
                            showClearButton={false}
                        />
                        <MagneticButton>
                            <Link to="/landlord/new-property" className="px-5 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2">
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
            {filteredRented.length > 0 && (
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Rented properties
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">{filteredRented.length}</span>
                    </h2>
                </div>
                {viewMode === 'grid' ? (
                    <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" stagger={0.06}>
                        {filteredRented.map((property) => (
                            <PropertyCardGrid key={property.id} property={property} />
                        ))}
                    </AnimatedGroup>
                ) : (
                    <AnimatedGroup className="flex flex-col gap-3" stagger={0.05}>
                        {filteredRented.map((property) => (
                            <PropertyCardList key={property.id} property={property} verifyColor="primary" />
                        ))}
                    </AnimatedGroup>
                )}
            </section>
            )}

            {/* Properties For Sale Section */}
            {filteredForSale.length > 0 && (
            <section className="mb-10">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Properties for sale
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">{filteredForSale.length}</span>
                    </h2>
                </div>
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredForSale.map((property) => (
                            <PropertyCardGrid key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredForSale.map((property) => (
                            <PropertyCardList key={property.id} property={property} verifyColor="green" />
                        ))}
                    </div>
                )}
            </section>
            )}

            {/* Vacant Properties Section */}
            {filteredVacant.length > 0 && (
            <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Vacant properties
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-0.5 rounded-full">{filteredVacant.length}</span>
                    </h2>
                </div>
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredVacant.map((property) => (
                            <PropertyCardGrid key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredVacant.map((property) => (
                            <PropertyCardList key={property.id} property={property} verifyColor="amber" />
                        ))}
                    </div>
                )}
            </section>
            )}

            {/* Incoming Properties Section */}
            {filteredIncoming.length > 0 && (
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        Incoming properties
                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full">{filteredIncoming.length} Processing</span>
                    </h2>
                </div>
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredIncoming.map((property) => (
                            <PropertyCardGrid key={property.id} property={property} isIncoming />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredIncoming.map((property) => (
                            <PropertyCardList
                                key={property.id}
                                property={property}
                                isIncoming
                                verifyColor={property.statusColor === 'bg-purple-600' ? 'purple' : 'orange'}
                            />
                        ))}
                    </div>
                )}
            </section>
            )}

            {/* Empty State */}
            {filteredRented.length === 0 && filteredForSale.length === 0 && filteredVacant.length === 0 && filteredIncoming.length === 0 && (
                <div className="py-16 text-center">
                    <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">home</span>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No properties found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        {searchQuery ? 'Try adjusting your search terms' : 'Add your first property to get started'}
                    </p>
                    {!searchQuery && (
                        <Link
                            to="/landlord/new-property"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm"
                        >
                            <span className="material-symbols-outlined text-[20px]">add_home</span> Add Property
                        </Link>
                    )}
                </div>
            )}
        </PageContainer>
    );
}
