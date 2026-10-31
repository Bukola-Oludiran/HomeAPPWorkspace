import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import ViewToggle from '../../../components/common/ViewToggle';
import { AnimatedGroup } from '../../../components/animation';
import { tenantService } from '../../../lib/api/services/tenantService';
import type { PropertySummary } from '../../../types/property';
import { formatCurrency, listingPrice } from '@/lib/format';
import type { ContourFragment } from '../../../components/common/ContourMotif';

// Saved homes: one row of cards, then open space; a large fragment fills it and slides under the row
const CONTOUR: ContourFragment[] = [
    'top-[66%] left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-6 w-[95vw] max-w-[1100px]',
    '-bottom-24 -left-48 w-[55vw] max-w-[540px]',
];

// Placeholder image for properties without images
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';

// UI property interface matching the component's expected structure
interface UISavedProperty {
    id: string;
    title: string;
    location: string;
    image: string;
    price: string;
    period: string;
    type: string;
    beds: string;
    baths: string;
    sqft: string;
    isVerified: boolean;
    availability: string;
}

// Helper to format currency
// Helper to get price period based on listing type
// Helper to get listing type label
function getListingTypeLabel(listingType: string): string {
    if (listingType === 'SALE') return 'FOR SALE';
    if (listingType === 'RENT') return 'FOR RENT';
    if (listingType === 'SHORT_LET') return 'SHORT LET';
    return listingType;
}

// Transform API PropertySummary to UI format
function transformSavedProperty(property: PropertySummary): UISavedProperty {
    return {
        id: property.id,
        title: property.name,
        location: `${property.address.city}, ${property.address.state}`,
        image: property.primaryImage || PLACEHOLDER_IMAGE,
        price: formatCurrency(listingPrice(property.price, property.priceUnit).amount),
        period: listingPrice(property.price, property.priceUnit).suffix,
        type: getListingTypeLabel(property.listingType),
        beds: (property.bedrooms ?? 0) === 0 ? 'Studio' : `${property.bedrooms} Bed${(property.bedrooms ?? 0) > 1 ? 's' : ''}`,
        baths: `${property.bathrooms ?? 0} Bath${(property.bathrooms ?? 0) > 1 ? 's' : ''}`,
        sqft: property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft` : 'N/A',
        isVerified: property.isVerified,
        availability: property.status === 'ACTIVE' ? 'Available Now' : 'Not available',
    };
}

type ViewMode = 'grid' | 'list';

export default function TenantSavedProperties() {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [savedProperties, setSavedProperties] = useState<UISavedProperty[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('price-low');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const typeDropdownRef = useRef<HTMLDivElement>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    // Fetch saved properties on mount
    useEffect(() => {
        async function fetchSavedProperties() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await tenantService.getSavedProperties();
                const transformed = response.data.map(transformSavedProperty);
                setSavedProperties(transformed);
            } catch (err) {
                console.error('Failed to fetch saved properties:', err);
                setError('Failed to load saved properties');
            } finally {
                setIsLoading(false);
            }
        }

        fetchSavedProperties();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
                setShowTypeDropdown(false);
            }
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleRemove = async (id: string) => {
        try {
            await tenantService.removeSavedProperty(id);
            setSavedProperties(savedProperties.filter(p => p.id !== id));
        } catch (err) {
            console.error('Failed to remove property:', err);
        }
    };

    // Filter properties by type
    const filteredProperties = savedProperties.filter(p => {
        if (typeFilter === 'all') return true;
        return p.type === typeFilter;
    });

    // Loading state
    if (isLoading) {
        return (
            <PageContainer maxWidth="lg">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Saved properties
                    </h1>
                    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">Loading...</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
                            <div className="h-48 bg-slate-200 dark:bg-slate-700" />
                            <div className="p-4">
                                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
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
            <PageContainer maxWidth="lg">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Saved properties
                    </h1>
                </div>
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
        <PageContainer maxWidth="lg" motif={CONTOUR}>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Saved properties
                    </h1>
                    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
                        You have {filteredProperties.length} saved homes.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3 items-center">
                    {/* Filter: Type */}
                    <div className="relative group" ref={typeDropdownRef}>
                        <button
                            onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">tune</span>
                            Type: {typeFilter === 'all' ? 'All' : typeFilter}
                            <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-400">expand_more</span>
                        </button>
                        {showTypeDropdown && (
                            <div className="absolute left-0 top-full mt-2 w-44 bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1">
                                {['all', 'FOR RENT', 'FOR SALE'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => {
                                            setTypeFilter(type);
                                            setShowTypeDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${typeFilter === type ? 'text-brand-ink font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                    >
                                        {type === 'all' ? 'All Types' : type}
                                        {typeFilter === type && (
                                            <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Sort */}
                    <div className="relative group" ref={sortDropdownRef}>
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold hover:border-brand focus:ring-2 focus:ring-brand/20 transition-all"
                        >
                            <span className="material-symbols-outlined text-[18px]">sort</span>
                            Sort: {sortBy === 'price-low' ? 'Price (Low to High)' : sortBy === 'price-high' ? 'Price (High to Low)' : 'Newest'}
                            <span className="material-symbols-outlined text-[18px] text-slate-500 dark:text-slate-400">expand_more</span>
                        </button>
                        {showSortDropdown && (
                            <div className="absolute left-0 top-full mt-2 w-48 bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1">
                                {[{ id: 'price-low', label: 'Price (Low to High)' }, { id: 'price-high', label: 'Price (High to Low)' }, { id: 'newest', label: 'Newest' }].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            setSortBy(option.id);
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${sortBy === option.id ? 'text-brand-ink font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
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
                    {/* Divider */}
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block"></div>
                    {/* View Toggle */}
                    <ViewToggle value={viewMode} onChange={setViewMode} />
                </div>
            </div>

            {/* Conditional Content Based on View Mode */}
            {
                viewMode === 'grid' ? (
                    /* ===== GRID VIEW ===== */
                    <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" stagger={0.06}>
                        {filteredProperties.map((property) => (
                            <div key={property.id} className="group bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-brand/30 transition-all duration-300 flex flex-col">
                                {/* Image with overlays */}
                                <div className="relative w-full h-48 shrink-0 overflow-hidden">
                                    <img
                                        alt={property.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={property.image}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                                    {/* Verified Badge */}
                                    {property.isVerified && (
                                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/80 backdrop-blur px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px] text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            Verified
                                        </div>
                                    )}
                                    {/* Favorite Button */}
                                    <button className="absolute top-3 right-3 bg-white/90 dark:bg-black/50 backdrop-blur size-9 rounded-full text-red-500 hover:bg-white transition-colors flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                    </button>
                                    {/* Type Badge and Price Overlay */}
                                    <div className="absolute bottom-3 left-3 text-white">
                                        <p className="text-xs font-bold bg-brand/90 px-2 py-0.5 rounded mb-1 w-fit">{property.type}</p>
                                        <h3 className="text-lg font-bold text-white shadow-sm">{property.price}<span className="text-xs font-normal opacity-90 ml-1">{property.period}</span></h3>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="mb-2">
                                        <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">{property.title}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                                            {property.location}
                                        </p>
                                    </div>
                                    {/* Property Specs */}
                                    <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300 font-medium py-2 border-t border-slate-100 dark:border-slate-800 w-full mb-2">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[16px]">bed</span>
                                            <span>{property.beds}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[16px]">bathtub</span>
                                            <span>{property.baths}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[16px]">square_foot</span>
                                            <span>{property.sqft}</span>
                                        </div>
                                    </div>
                                    {/* Actions */}
                                    <div className="mt-auto flex gap-2">
                                        <Link
                                            to={`/property/${property.id}`}
                                            className="flex-1 py-1.5 bg-brand/10 hover:bg-brand/20 text-brand-ink rounded-lg font-semibold text-sm transition-colors text-center"
                                        >
                                            View details
                                        </Link>
                                        <button className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-ink hover:border-brand transition-colors" title="Share">
                                            <span className="material-symbols-outlined text-[18px]">share</span>
                                        </button>
                                        <button
                                            onClick={() => handleRemove(property.id)}
                                            className="p-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
                                            title="Remove"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State / CTA Card - Grid */}
                        <Link
                            to="/search"
                            className="group bg-slate-50 dark:bg-canvas-dark/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand/50 transition-all duration-300 flex flex-col items-center justify-center p-8 gap-4 min-h-[380px] h-full"
                        >
                            <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform shrink-0">
                                <span className="material-symbols-outlined text-3xl">add_home</span>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Looking for more?</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm max-w-[200px] mx-auto">Continue your search to find the perfect verified rental property.</p>
                                <span className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-brand-ink text-sm font-bold hover:shadow-md transition-all">
                                    Explore properties
                                </span>
                            </div>
                        </Link>
                    </AnimatedGroup>
                ) : (
                    /* ===== LIST VIEW ===== */
                    <AnimatedGroup className="flex flex-col gap-4" stagger={0.05}>
                        {filteredProperties.map((property) => (
                            <div key={property.id} className="group bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:border-brand/30 transition-all duration-300 flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="relative w-full md:w-80 h-56 md:h-auto shrink-0 overflow-hidden">
                                    <img
                                        alt={property.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={property.image}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
                                    {/* Verified Badge */}
                                    {property.isVerified && (
                                        <div className="absolute top-3 left-3 bg-white/95 dark:bg-black/80 backdrop-blur px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-900 dark:text-white shadow-sm flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-[14px] text-green-500" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            Verified
                                        </div>
                                    )}
                                    {/* Type Badge */}
                                    <div className="absolute bottom-3 left-3">
                                        <p className="text-xs font-bold bg-brand/90 text-white px-2 py-0.5 rounded shadow-sm">{property.type}</p>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-5 md:p-6 flex-1 flex flex-col justify-center">
                                    <div className="mb-3">
                                        <h4 className="font-bold text-xl text-slate-900 dark:text-white mb-1 line-clamp-1">{property.title}</h4>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                                            {property.location}
                                        </p>
                                    </div>
                                    {/* Property Specs - Pill Style */}
                                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-slate-700 dark:text-slate-300 font-medium">
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px]">bed</span>
                                            <span>{property.beds}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px]">bathtub</span>
                                            <span>{property.baths}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px]">square_foot</span>
                                            <span>{property.sqft}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Panel */}
                                <div className="p-5 md:p-6 flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 min-w-[240px] bg-slate-50/30 dark:bg-slate-800/20">
                                    <div className="text-right">
                                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{property.price}<span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-1">{property.period}</span></h3>
                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">{property.availability}</p>
                                    </div>
                                    <div className="flex items-center gap-2 md:mt-auto">
                                        <Link
                                            to={`/property/${property.id}`}
                                            className="px-4 py-2 bg-brand-ink hover:bg-brand-ink/90 text-on-brand rounded-lg text-sm font-bold transition-colors"
                                        >
                                            View details
                                        </Link>
                                        <div className="flex items-center gap-1">
                                            <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors" title="Share">
                                                <span className="material-symbols-outlined text-[20px]">share</span>
                                            </button>
                                            <button
                                                onClick={() => handleRemove(property.id)}
                                                className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                title="Remove"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Empty State / CTA Card - List */}
                        <Link
                            to="/search"
                            className="group bg-slate-50 dark:bg-canvas-dark/50 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-brand/50 transition-all duration-300 flex flex-col md:flex-row items-center justify-between p-6 gap-6"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform shrink-0">
                                    <span className="material-symbols-outlined text-3xl">add_home</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Looking for more?</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-[300px]">Continue your search to find the perfect verified rental property.</p>
                                </div>
                            </div>
                            <span className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-brand-ink text-sm font-bold hover:shadow-md transition-all whitespace-nowrap">
                                Explore properties
                            </span>
                        </Link>
                    </AnimatedGroup>
                )
            }
        </PageContainer >
    );
}
