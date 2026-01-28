import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import FavoriteButton from '@/components/FavoriteButton';
import { propertyService } from '@/lib/api/services/propertyService';
import type { PropertySummary, PropertySearchFilters, ListingType, PropertyType } from '@/types/property';
import type { ApiError } from '@/types/api';
// Map UI property type names to backend PropertyType
const propertyTypeMap: Record<string, PropertyType> = {
    'House': 'HOUSE',
    'Apartment': 'APARTMENT',
    'Condo': 'DUPLEX', // Using DUPLEX as condo equivalent
    'Townhouse': 'TERRACE',
    'Land': 'LAND',
    'Commercial': 'COMMERCIAL',
};

// Map backend ListingType to UI display
const listingTypeDisplay: Record<ListingType, { label: string; color: string }> = {
    'SALE': { label: 'For Sale', color: 'bg-green-100 text-green-700' },
    'RENT': { label: 'Rent', color: 'bg-blue-100 text-blue-700' },
    'SHORT_LET': { label: 'Short-let', color: 'bg-purple-100 text-purple-700' },
};



// Helper to format price with full amount
const formatPriceFull = (price: number, currency = 'USD'): string => {
    return `${currency === 'NGN' ? '₦' : '$'}${price.toLocaleString()}`;
};

// Helper to format square meters to sqft display
const formatSqft = (sqm?: number): string => {
    if (!sqm) return 'N/A';
    const sqft = Math.round(sqm * 10.764); // Convert sqm to sqft
    if (sqft >= 1000) {
        return `${(sqft / 1000).toFixed(1)}k`;
    }
    return sqft.toLocaleString();
};

// Cluster marker for map view
const clusterPosition = { top: '75%', left: '25%' };

// Property types for filter
const propertyTypes = ['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial'];

// Amenities for More Filters
const amenitiesList = [
    { id: 'pool', label: 'Pool', icon: 'pool' },
    { id: 'gym', label: 'Gym/Fitness', icon: 'fitness_center' },
    { id: 'parking', label: 'Parking', icon: 'local_parking' },
    { id: 'ac', label: 'Air Conditioning', icon: 'ac_unit' },
    { id: 'laundry', label: 'In-unit Laundry', icon: 'local_laundry_service' },
    { id: 'pets', label: 'Pet Friendly', icon: 'pets' },
    { id: 'balcony', label: 'Balcony', icon: 'balcony' },
    { id: 'security', label: '24/7 Security', icon: 'security' },
];

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('Austin, TX');
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [verifiedOnly, setVerifiedOnly] = useState(true);


    // Dropdown visibility states
    const [showPriceDropdown, setShowPriceDropdown] = useState(false);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showBedsDropdown, setShowBedsDropdown] = useState(false);
    const [showMoreFilters, setShowMoreFilters] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    // Filter value states
    const [priceRange, setPriceRange] = useState({ min: '', max: '' });
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [beds, setBeds] = useState<string>('Any');
    const [baths, setBaths] = useState<string>('Any');
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [sqftRange, setSqftRange] = useState({ min: '', max: '' });
    const [yearBuilt, setYearBuilt] = useState({ min: '', max: '' });

    // API state
    const [properties, setProperties] = useState<PropertySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch properties from API
    const fetchProperties = useCallback(async (page = 1, append = false) => {
        setIsLoading(true);
        setError(null);

        try {
            // Build filters from UI state
            const filters: PropertySearchFilters = {
                page,
                limit: 12,
                query: searchQuery || undefined,
                isVerified: verifiedOnly || undefined,
            };

            // Add price filters
            if (priceRange.min) filters.minPrice = parseInt(priceRange.min);
            if (priceRange.max) filters.maxPrice = parseInt(priceRange.max);

            // Add property type filters
            if (selectedTypes.length > 0) {
                filters.propertyType = selectedTypes
                    .map(t => propertyTypeMap[t])
                    .filter(Boolean) as PropertyType[];
            }

            // Add bedroom filter
            if (beds !== 'Any') {
                filters.bedrooms = parseInt(beds.replace('+', ''));
            }

            // Add bathroom filter
            if (baths !== 'Any') {
                filters.bathrooms = parseInt(baths.replace('+', ''));
            }

            const responseData = await propertyService.searchProperties(filters);

            if (append) {
                setProperties(prev => [...prev, ...responseData.data]);
            } else {
                setProperties(responseData.data);
            }

            setTotalCount(responseData.pagination.total);
            setHasMore(responseData.pagination.page < responseData.pagination.totalPages);
            setCurrentPage(page);
        } catch (err) {
            setError(err as ApiError);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, verifiedOnly, priceRange, selectedTypes, beds, baths]);

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchProperties(1);
    }, [fetchProperties]);

    // Handle load more
    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            fetchProperties(currentPage + 1, true);
        }
    };

    // Close all dropdowns
    const closeAllDropdowns = () => {
        setShowPriceDropdown(false);
        setShowTypeDropdown(false);
        setShowBedsDropdown(false);
        setShowMoreFilters(false);
    };

    // Toggle dropdown with mutual exclusivity
    const toggleDropdown = (dropdown: 'price' | 'type' | 'beds' | 'more') => {
        // Check if this dropdown is currently open
        const isCurrentlyOpen =
            (dropdown === 'price' && showPriceDropdown) ||
            (dropdown === 'type' && showTypeDropdown) ||
            (dropdown === 'beds' && showBedsDropdown) ||
            (dropdown === 'more' && showMoreFilters);

        // Close all dropdowns first
        setShowPriceDropdown(false);
        setShowTypeDropdown(false);
        setShowBedsDropdown(false);
        setShowMoreFilters(false);

        // If the clicked dropdown was closed, open it
        if (!isCurrentlyOpen) {
            switch (dropdown) {
                case 'price': setShowPriceDropdown(true); break;
                case 'type': setShowTypeDropdown(true); break;
                case 'beds': setShowBedsDropdown(true); break;
                case 'more': setShowMoreFilters(true); break;
            }
        }
    };

    // Toggle property type selection
    const toggleType = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    // Toggle amenity selection
    const toggleAmenity = (amenityId: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenityId) ? prev.filter(a => a !== amenityId) : [...prev, amenityId]
        );
    };

    // Get active filter count
    const getActiveFilterCount = () => {
        let count = 0;
        if (priceRange.min || priceRange.max) count++;
        if (selectedTypes.length > 0) count++;
        if (beds !== 'Any' || baths !== 'Any') count++;
        if (selectedAmenities.length > 0) count += selectedAmenities.length;
        if (sqftRange.min || sqftRange.max) count++;
        if (yearBuilt.min || yearBuilt.max) count++;
        return count;
    };

    // Clear all filters
    const clearAllFilters = () => {
        setPriceRange({ min: '', max: '' });
        setSelectedTypes([]);
        setBeds('Any');
        setBaths('Any');
        setSelectedAmenities([]);
        setSqftRange({ min: '', max: '' });
        setYearBuilt({ min: '', max: '' });
        setVerifiedOnly(false);
    };

    // Ref for filter bar to handle click outside
    const filterBarRef = useRef<HTMLDivElement>(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterBarRef.current && !filterBarRef.current.contains(event.target as Node)) {
                closeAllDropdowns();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white ${viewMode === 'map' ? 'overflow-hidden' : 'overflow-x-hidden'}`}>
            {/* Header - Shared Between Both Views */}
            <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#101922]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
                <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4 md:gap-8">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 text-slate-900 dark:text-white shrink-0">
                        <div className="size-9 bg-[#137fec] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#137fec]/30">
                            <span className="material-symbols-outlined">real_estate_agent</span>
                        </div>
                        <h2 className="hidden md:block text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                            PropertyApp
                        </h2>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="material-symbols-outlined text-slate-400">search</span>
                            </div>
                            <input
                                className="block w-full pl-10 pr-12 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm md:text-base text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-[#137fec] focus:bg-white dark:focus:bg-slate-900 transition-all shadow-inner"
                                placeholder="Location, property type, or keywords..."
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="absolute inset-y-0 right-1.5 flex items-center">
                                <div className="size-8 bg-[#137fec] rounded-full text-white hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center">
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                        <button className="hidden md:flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            List your property
                        </button>
                        <button className="flex items-center justify-center overflow-hidden rounded-full size-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2.5 right-2.5 size-2 bg-red-500 rounded-full border border-white dark:border-slate-800"></span>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                                className="flex items-center justify-center overflow-hidden rounded-full size-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:ring-2 hover:ring-[#137fec]/20 transition-all border border-slate-200 dark:border-slate-600"
                            >
                                <img
                                    alt="Profile"
                                    className="size-full object-cover"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwTu80T-Ii1i2JHfbWEMDgwXRNP0ehdOTldQ7IxlyR1MCzL8MrOZBjoYfXJZAXXTJlIi2HNi9nfioA7ksEMvF5HBEBODUnWum2NL5XhkC95MK52bAAZDSe9d891ZAw5MbM9oRR30lP8umsxTAf1eXbePW_bZ0I5rsOo88ELIF5aCU07WBBeE1z6_RwK6Y9O6FRPgxUzYEmE3EzdyA9_YtX-v69bXptpU6g1Xr3eGcYlqLvJjRJJdBDyZYyiAuPmTNA3aMrKcO3r42a"
                                />
                            </button>
                            {showProfileDropdown && (
                                <div className="absolute right-0 mt-2 py-2 bg-white dark:bg-slate-800 min-w-[200px] shadow-[0px_8px_16px_0px_rgba(0,0,0,0.1)] z-50 rounded-xl border border-slate-200 dark:border-slate-700">
                                    <Link
                                        to="/landlord/dashboard"
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">dashboard</span>
                                            Landlord Dashboard
                                        </div>
                                    </Link>
                                    <Link
                                        to="/tenant/dashboard"
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">vpn_key</span>
                                            Tenant Dashboard
                                        </div>
                                    </Link>
                                    <Link
                                        to="/agent/jobs"
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">support_agent</span>
                                            Agent Dashboard
                                        </div>
                                    </Link>
                                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                                    <Link
                                        to="/settings"
                                        className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">settings</span>
                                            Account Settings
                                        </div>
                                    </Link>
                                    <button className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-[#137fec]">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-lg">logout</span>
                                            Sign Out
                                        </div>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div ref={filterBarRef} className="px-4 md:px-8 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 overflow-visible">
                    <div className="flex items-center gap-3 flex-1 pr-4 flex-wrap">
                        {/* Price Filter */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown('price')}
                                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold active:scale-95 transition-all ${priceRange.min || priceRange.max
                                    ? 'border-[#137fec]/30 bg-[#137fec]/5 text-[#137fec]'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] text-slate-700 dark:text-slate-300 hover:border-slate-400'
                                    }`}
                            >
                                {priceRange.min || priceRange.max
                                    ? `$${priceRange.min || '0'} - $${priceRange.max || 'Max'}`
                                    : 'Price'}
                                <span className={`material-symbols-outlined text-[18px] transition-transform ${showPriceDropdown ? 'rotate-180' : ''}`}>
                                    keyboard_arrow_down
                                </span>
                            </button>
                            {showPriceDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#1a2632] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-4">Price Range</h4>
                                    <div className="flex gap-3 mb-4">
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500 mb-1 block">Min Price</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                <input
                                                    type="text"
                                                    placeholder="0"
                                                    value={priceRange.min}
                                                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value.replace(/\D/g, '') }))}
                                                    className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-end pb-2.5 text-slate-400">—</div>
                                        <div className="flex-1">
                                            <label className="text-xs text-slate-500 mb-1 block">Max Price</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                                                <input
                                                    type="text"
                                                    placeholder="Any"
                                                    value={priceRange.max}
                                                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value.replace(/\D/g, '') }))}
                                                    className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Quick Select Buttons */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {['100k', '250k', '500k', '750k', '1M'].map((val) => (
                                            <button
                                                key={val}
                                                onClick={() => setPriceRange(prev => ({ ...prev, max: val.includes('M') ? '1000000' : val.replace('k', '000') }))}
                                                className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-[#137fec]/10 hover:text-[#137fec] rounded-full transition-colors"
                                            >
                                                Under ${val}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => setPriceRange({ min: '', max: '' })}
                                            className="flex-1 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            onClick={() => setShowPriceDropdown(false)}
                                            className="flex-1 py-2 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Type Filter */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown('type')}
                                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold active:scale-95 transition-all ${selectedTypes.length > 0
                                    ? 'border-[#137fec]/30 bg-[#137fec]/5 text-[#137fec]'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] text-slate-700 dark:text-slate-300 hover:border-slate-400'
                                    }`}
                            >
                                {selectedTypes.length > 0
                                    ? selectedTypes.length === 1 ? selectedTypes[0] : `${selectedTypes.length} Types`
                                    : 'Type'}
                                <span className={`material-symbols-outlined text-[18px] transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`}>
                                    keyboard_arrow_down
                                </span>
                            </button>
                            {showTypeDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-[#1a2632] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-3">Property Type</h4>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {propertyTypes.map((type) => (
                                            <label
                                                key={type}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTypes.includes(type)}
                                                    onChange={() => toggleType(type)}
                                                    className="size-4 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]"
                                                />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                    <div className="flex gap-2 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => setSelectedTypes([])}
                                            className="flex-1 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            onClick={() => setShowTypeDropdown(false)}
                                            className="flex-1 py-2 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Beds & Baths Filter */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown('beds')}
                                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold active:scale-95 transition-all ${beds !== 'Any' || baths !== 'Any'
                                    ? 'border-[#137fec]/30 bg-[#137fec]/5 text-[#137fec]'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] text-slate-700 dark:text-slate-300 hover:border-slate-400'
                                    }`}
                            >
                                {beds !== 'Any' || baths !== 'Any'
                                    ? `${beds !== 'Any' ? beds + ' Beds' : ''}${beds !== 'Any' && baths !== 'Any' ? ', ' : ''}${baths !== 'Any' ? baths + ' Baths' : ''}`
                                    : 'Beds & Baths'}
                                <span className={`material-symbols-outlined text-[18px] transition-transform ${showBedsDropdown ? 'rotate-180' : ''}`}>
                                    keyboard_arrow_down
                                </span>
                            </button>
                            {showBedsDropdown && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#1a2632] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    {/* Bedrooms */}
                                    <div className="mb-5">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">bed</span>
                                            Bedrooms
                                        </h4>
                                        <div className="flex gap-2">
                                            {['Any', '1+', '2+', '3+', '4+', '5+'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setBeds(option)}
                                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${beds === option
                                                        ? 'bg-[#137fec] text-white shadow-sm'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Bathrooms */}
                                    <div className="mb-4">
                                        <h4 className="font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">bathtub</span>
                                            Bathrooms
                                        </h4>
                                        <div className="flex gap-2">
                                            {['Any', '1+', '2+', '3+', '4+'].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setBaths(option)}
                                                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${baths === option
                                                        ? 'bg-[#137fec] text-white shadow-sm'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => { setBeds('Any'); setBaths('Any'); }}
                                            className="flex-1 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                                        >
                                            Clear
                                        </button>
                                        <button
                                            onClick={() => setShowBedsDropdown(false)}
                                            className="flex-1 py-2 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Verified Only Toggle */}
                        <button
                            onClick={() => setVerifiedOnly(!verifiedOnly)}
                            className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold active:scale-95 transition-all ${verifiedOnly
                                ? 'border border-[#137fec]/30 bg-[#137fec]/5 text-[#137fec] hover:bg-[#137fec]/10'
                                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] text-slate-700 dark:text-slate-300'
                                }`}
                        >
                            <span className={`material-symbols-outlined text-[18px] ${verifiedOnly ? 'icon-filled' : ''}`}>
                                verified
                            </span>
                            Verified Only
                        </button>

                        {/* More Filters */}
                        <div className="relative">
                            <button
                                onClick={() => toggleDropdown('more')}
                                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold active:scale-95 transition-all ${getActiveFilterCount() > 0
                                    ? 'border-[#137fec]/30 bg-[#137fec]/5 text-[#137fec]'
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] text-slate-700 dark:text-slate-300 hover:border-slate-400'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[18px]">tune</span>
                                More Filters
                                {getActiveFilterCount() > 0 && (
                                    <span className="size-5 bg-[#137fec] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {getActiveFilterCount()}
                                    </span>
                                )}
                            </button>
                            {showMoreFilters && (
                                <div className="absolute top-full right-0 mt-2 w-[360px] bg-white dark:bg-[#1a2632] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[70vh] overflow-y-auto">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">More Filters</h4>
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-sm font-semibold text-[#137fec] hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    </div>

                                    {/* Square Footage */}
                                    <div className="mb-6">
                                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">square_foot</span>
                                            Square Footage
                                        </h5>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Min sqft"
                                                    value={sqftRange.min}
                                                    onChange={(e) => setSqftRange(prev => ({ ...prev, min: e.target.value.replace(/\D/g, '') }))}
                                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                />
                                            </div>
                                            <span className="flex items-center text-slate-400">—</span>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Max sqft"
                                                    value={sqftRange.max}
                                                    onChange={(e) => setSqftRange(prev => ({ ...prev, max: e.target.value.replace(/\D/g, '') }))}
                                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Year Built */}
                                    <div className="mb-6">
                                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">calendar_month</span>
                                            Year Built
                                        </h5>
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="From"
                                                    value={yearBuilt.min}
                                                    onChange={(e) => setYearBuilt(prev => ({ ...prev, min: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                />
                                            </div>
                                            <span className="flex items-center text-slate-400">—</span>
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="To"
                                                    value={yearBuilt.max}
                                                    onChange={(e) => setYearBuilt(prev => ({ ...prev, max: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                                                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec]"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Amenities */}
                                    <div className="mb-4">
                                        <h5 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">check_circle</span>
                                            Amenities
                                        </h5>
                                        <div className="grid grid-cols-2 gap-2">
                                            {amenitiesList.map((amenity) => (
                                                <button
                                                    key={amenity.id}
                                                    onClick={() => toggleAmenity(amenity.id)}
                                                    className={`flex items-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-all ${selectedAmenities.includes(amenity.id)
                                                        ? 'bg-[#137fec]/10 text-[#137fec] border border-[#137fec]/30'
                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                                        }`}
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">{amenity.icon}</span>
                                                    {amenity.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => setShowMoreFilters(false)}
                                            className="flex-1 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => setShowMoreFilters(false)}
                                            className="flex-1 py-2.5 bg-[#137fec] text-white text-sm font-bold rounded-lg hover:bg-[#137fec]/90 transition-colors shadow-lg shadow-[#137fec]/20"
                                        >
                                            Show Results
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* View Toggle */}
                    <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-full p-1 border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center justify-center size-9 rounded-full transition-all ${viewMode === 'grid'
                                ? 'bg-white dark:bg-[#101922] text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">grid_view</span>
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`flex items-center justify-center size-9 rounded-full transition-all ${viewMode === 'map'
                                ? 'bg-white dark:bg-[#101922] text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[20px]">map</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Conditional Content Based on View Mode */}
            {viewMode === 'grid' ? (
                <main className="flex-1 w-full bg-[#f6f7f8] dark:bg-[#101922] py-8 px-4 md:px-8">
                    <div className="max-w-[1600px] mx-auto">
                        {/* Results Header */}
                        <div className="flex items-baseline justify-between mb-6">
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                                Stays in {searchQuery}
                                <span className="ml-2 text-base font-normal text-slate-500 dark:text-slate-400">
                                    {totalCount} properties
                                </span>
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                <span>Sort by:</span>
                                <button className="font-semibold text-slate-900 dark:text-white flex items-center hover:underline">
                                    Recommended{' '}
                                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                                </button>
                            </div>
                        </div>

                        {/* Loading State */}
                        {isLoading && properties.length === 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="aspect-[4/3] rounded-2xl bg-slate-200 dark:bg-slate-700 mb-4"></div>
                                        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Error State */}
                        {error && (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-4">{error.error?.message || 'Failed to load properties'}</p>
                                <button
                                    onClick={() => fetchProperties(1)}
                                    className="px-6 py-2 bg-[#137fec] text-white rounded-lg font-semibold hover:bg-blue-600"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isLoading && !error && properties.length === 0 && (
                            <div className="text-center py-12">
                                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No properties found</h3>
                                <p className="text-slate-500 dark:text-slate-400">Try adjusting your search criteria</p>
                            </div>
                        )}

                        {/* Properties Grid */}
                        {properties.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                {properties.map((property) => (
                                    <Link to={`/property/${property.id}`} key={property.id}>
                                        <article className="group flex flex-col gap-4 cursor-pointer">
                                            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-200">
                                                <img
                                                    alt={property.name}
                                                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                    src={property.primaryImage || 'https://placehold.co/400x300?text=No+Image'}
                                                />
                                                {/* Verification Badge */}
                                                {property.isVerified && (
                                                    <div
                                                        className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md ${property.verificationTier === 'PLATINUM'
                                                            ? 'bg-gradient-to-r from-slate-200 via-white to-slate-300 text-slate-900 border border-white/50'
                                                            : 'bg-[#137fec] text-white'
                                                            }`}
                                                    >
                                                        <span className="material-symbols-outlined text-[16px] icon-filled">verified</span>
                                                        {property.verificationTier || 'Verified'}
                                                    </div>
                                                )}
                                                {/* Favorite Button */}
                                                <div className="absolute top-4 right-4">
                                                    <FavoriteButton
                                                        propertyId={property.id}
                                                        variant="overlay"
                                                    />
                                                </div>
                                                {/* Featured Badge */}
                                                {property.isFeatured && (
                                                    <div className="absolute bottom-4 left-4 bg-[#137fec] text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                                        FEATURED
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                        {formatPriceFull(property.price, property.currency)}
                                                        {property.listingType === 'RENT' && (
                                                            <span className="text-sm font-normal text-slate-500 ml-1">/mo</span>
                                                        )}
                                                        {property.listingType === 'SHORT_LET' && (
                                                            <span className="text-sm font-normal text-slate-500 ml-1">/night</span>
                                                        )}
                                                    </p>
                                                    <span
                                                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${listingTypeDisplay[property.listingType]?.color || 'bg-gray-100 text-gray-700'
                                                            }`}
                                                    >
                                                        {listingTypeDisplay[property.listingType]?.label || property.listingType}
                                                    </span>
                                                </div>
                                                <p className="text-slate-900 dark:text-white text-base font-semibold truncate">
                                                    {property.name}
                                                </p>
                                                <p className="text-slate-500 dark:text-slate-400 text-sm truncate">
                                                    {property.address.street}, {property.address.city}
                                                </p>
                                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm">
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[18px]">bed</span>
                                                        {property.bedrooms}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="material-symbols-outlined text-[18px]">bathtub</span>
                                                        {property.bathrooms}
                                                    </span>
                                                    {property.squareMeters && (
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[18px]">square_foot</span>
                                                            {formatSqft(property.squareMeters)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* Load More Button */}
                        {hasMore && properties.length > 0 && (
                            <div className="mt-12 flex justify-center">
                                <button
                                    onClick={handleLoadMore}
                                    disabled={isLoading}
                                    className="px-8 py-3 rounded-xl bg-white dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isLoading ? 'Loading...' : 'Show more properties'}
                                </button>
                            </div>
                        )}
                    </div>
                </main>
            ) : (
                /* ===== MAP VIEW ===== */
                <main className="flex-1 w-full relative bg-[#cad2d3] overflow-hidden">
                    {/* Map Background SVG */}
                    <div className="absolute inset-0 pointer-events-none">
                        <svg className="absolute w-full h-full text-[#aadaff] fill-current" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <path d="M0,80 Q20,70 40,85 T100,60 V100 H0 Z"></path>
                            <path d="M60,0 Q70,30 50,50 T60,100 H100 V0 Z" opacity="0.5"></path>
                        </svg>
                        <svg className="absolute w-full h-full text-[#c8e6c9] fill-current opacity-40" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <rect height="20" rx="2" width="15" x="20" y="20"></rect>
                            <circle cx="80" cy="30" r="10"></circle>
                        </svg>
                        <svg className="absolute w-full h-full stroke-white opacity-60" fill="none" strokeWidth="2">
                            <path d="M-10,30 L110,40"></path>
                            <path d="M-10,60 L110,55"></path>
                            <path d="M30,-10 L40,110"></path>
                            <path d="M70,-10 L65,110"></path>
                            <path d="M0,0 L100,100" opacity="0.3"></path>
                        </svg>
                    </div>

                    {/* Search This Area Button */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
                        <button className="bg-white dark:bg-[#1a2632] text-slate-900 dark:text-white px-5 py-2.5 rounded-full shadow-lg font-semibold text-sm flex items-center gap-2 hover:scale-105 transition-transform border border-slate-100 dark:border-slate-700">
                            <span className="material-symbols-outlined text-[#137fec] text-[18px]">refresh</span>
                            Search this area
                        </button>
                    </div>

                    {/* Property Count Badge - Coming Soon for full map integration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 text-center">
                        <div className="bg-white dark:bg-[#1a2632] rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined text-6xl text-[#137fec] mb-4">map</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Map View Coming Soon</h3>
                            <p className="text-slate-500 dark:text-slate-400 mb-4">
                                {properties.length} properties available in this area
                            </p>
                            <button
                                onClick={() => setViewMode('grid')}
                                className="px-6 py-2 bg-[#137fec] text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                            >
                                View in Grid
                            </button>
                        </div>
                    </div>

                    {/* Cluster Marker */}
                    <div className="absolute z-10" style={{ top: clusterPosition.top, left: clusterPosition.left }}>
                        <button className="bg-[#137fec] text-white font-bold text-sm size-10 rounded-full shadow-lg border-2 border-white hover:scale-110 hover:bg-blue-600 transition-all flex items-center justify-center">
                            {properties.length}
                        </button>
                    </div>

                    {/* Map Controls */}
                    <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-30">
                        <button className="bg-white dark:bg-[#1a2632] text-slate-700 dark:text-slate-200 p-2.5 rounded-lg shadow-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700">
                            <span className="material-symbols-outlined">my_location</span>
                        </button>
                        <div className="flex flex-col bg-white dark:bg-[#1a2632] rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700">
                                <span className="material-symbols-outlined">add</span>
                            </button>
                            <button className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                <span className="material-symbols-outlined">remove</span>
                            </button>
                        </div>
                    </div>

                    {/* Map Attribution */}
                    <div className="absolute bottom-1 right-1 px-2 py-0.5 bg-white/60 dark:bg-black/50 backdrop-blur-sm text-[10px] text-slate-600 dark:text-slate-400 rounded-tl-md hover:bg-white/80 transition-colors cursor-pointer">
                        © Mapbox © OpenStreetMap
                    </div>
                </main>
            )
            }
        </div >
    );
}
