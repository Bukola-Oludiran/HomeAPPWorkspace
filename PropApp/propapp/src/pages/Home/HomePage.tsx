import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import heroVideo from '@/assets/HeroSectionVideo.mp4';
import FavoriteButton from '@/components/FavoriteButton';
import VoiceInputButton from '@/components/VoiceInputButton';
import { propertyService } from '@/lib/api/services/propertyService';
import type { PropertySummary, ListingType } from '@/types/property';

// Helper to format price with currency
function formatPrice(price: number, currency: string = 'CAD'): string {
    const formatter = new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    });
    return formatter.format(price);
}

// Helper to get listing type display info
function getListingTypeInfo(listingType: ListingType): { label: string; color: string; priceUnit?: string } {
    switch (listingType) {
        case 'SALE':
            return { label: 'For Sale', color: 'bg-green-100 text-green-700' };
        case 'RENT':
            return { label: 'For Rent', color: 'bg-blue-100 text-blue-700', priceUnit: '/mo' };
        case 'SHORT_LET':
            return { label: 'Short-let', color: 'bg-purple-100 text-purple-700', priceUnit: '/night' };
        default:
            return { label: 'For Sale', color: 'bg-green-100 text-green-700' };
    }
}

// Helper to format address
function formatAddress(address: PropertySummary['address'] | undefined | string): string {
    if (!address) return 'Location not available';
    if (typeof address === 'string') return address;
    const parts = [address.street, address.neighborhood, address.city, address.state].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Location not available';
}

// Helper to get verification badge info based on tier
// Styling based on DesignLanguage.md specifications
function getVerificationBadge(isVerified: boolean, tier?: string): { label: string; className: string; iconClassName: string; icon: string } | null {
    if (!isVerified) return null;

    // PLATINUM: Background #2980B9, Text White, Icon: Shield Check
    if (tier === 'PLATINUM') {
        return {
            label: 'PLATINUM VERIFIED',
            className: 'bg-[#2980B9] text-white shadow-lg',
            iconClassName: 'text-white',
            icon: 'verified_user',
        };
    }
    // GOLD: #F1C40F (gold color)
    if (tier === 'GOLD') {
        return {
            label: 'GOLD VERIFIED',
            className: 'bg-[#F1C40F] text-slate-900 shadow-lg',
            iconClassName: 'text-slate-900',
            icon: 'verified',
        };
    }
    // SILVER: Gray Pill
    if (tier === 'SILVER') {
        return {
            label: 'SILVER VERIFIED',
            className: 'bg-slate-400 dark:bg-slate-500 text-white',
            iconClassName: 'text-white',
            icon: 'verified',
        };
    }
    // BRONZE: Orange Pill
    return {
        label: 'BRONZE VERIFIED',
        className: 'bg-orange-500 text-white',
        iconClassName: 'text-white',
        icon: 'verified',
    };
}

// Default placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';

type CategoryType = 'Buy' | 'Rent' | 'Short-let' | 'Land';

export default function HomePage() {
    const [activeCategory, setActiveCategory] = useState<CategoryType>('Buy');
    const [aiSearchEnabled, setAiSearchEnabled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [featuredProperties, setFeaturedProperties] = useState<PropertySummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch featured properties on mount
    useEffect(() => {
        async function fetchFeaturedProperties() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await propertyService.getFeaturedProperties(8);
                // API returns ApiResponse<PropertySummary[]>, extract data
                setFeaturedProperties(response.data);
            } catch (err) {
                console.error('Failed to fetch featured properties:', err);
                setError('Failed to load featured properties');
            } finally {
                setIsLoading(false);
            }
        }

        fetchFeaturedProperties();
    }, []);

    const categories: CategoryType[] = ['Buy', 'Rent', 'Short-let', 'Land'];

    return (
        <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden relative">
            {/* Logo - positioned above everything */}
            <div className="absolute top-6 left-6 md:left-10 z-40 flex items-center gap-3">
                <div className="size-10 bg-brand rounded-xl flex items-center justify-center text-white shadow-sm">
                    <span className="material-symbols-outlined">real_estate_agent</span>
                </div>
                <h2 className="hidden md:block text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">
                    HomeAI
                </h2>
            </div>


            {/* Navbar is now rendered at App level via UnifiedNavbar */}


            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Hero Section with full-bleed background */}
                <section className="relative w-full min-h-[70vh] px-4 md:px-10 lg:px-20 flex justify-center items-center overflow-hidden">
                    {/* Full-bleed background video extending to top */}
                    <video
                        className="absolute inset-0 z-0 w-full h-full object-cover"
                        src={heroVideo}
                        autoPlay
                        loop
                        muted
                        playsInline
                    />
                    {/* Gradient overlay - same white filter as before */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/30 via-canvas/70 to-canvas dark:from-black/50 dark:via-canvas-dark/70 dark:to-canvas-dark"></div>

                    <div className="relative z-10 max-w-4xl w-full flex flex-col items-center mt-24">
                        <div className="text-center mb-10 space-y-4">
                            <h1 className="text-slate-900 dark:text-white tracking-tight text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-sm">
                                Know what's been checked before you visit.
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300 text-lg md:text-xl font-normal max-w-2xl mx-auto drop-shadow-sm">
                                Every listing shows its verification tier, from Bronze to Platinum. Search by area and
                                budget, or describe the home you want in plain words.
                            </p>
                        </div>

                        {/* Search Bar */}
                        <div className="w-full max-w-3xl bg-white dark:bg-surface-dark p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-black/30 border border-slate-100 dark:border-slate-800">
                            <div className="flex flex-col md:flex-row gap-2">
                                <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 h-14 md:h-16">
                                    <span className="material-symbols-outlined text-slate-400 mr-3">search</span>
                                    <input
                                        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 text-base md:text-lg w-full p-0"
                                        placeholder="Search by location, price, or property type..."
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <VoiceInputButton
                                        onResult={(text) => setSearchQuery(text)}
                                        size="sm"
                                    />
                                </div>
                                <button className="h-14 md:h-16 px-8 rounded-xl bg-brand hover:bg-brand/90 text-white font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-2 w-full md:w-auto">
                                    <span>Search</span>
                                </button>
                            </div>
                        </div>

                        {/* Category Pills and AI Toggle */}
                        <div className="w-full max-w-3xl mt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-sm ${activeCategory === category
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                                            : 'bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-brand hover:text-brand'
                                            }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3 bg-white dark:bg-surface-dark px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span className="material-symbols-outlined text-brand icon-filled">
                                    forum
                                </span>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                                        AI Search
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                                        Natural language
                                    </span>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-2">
                                    <input
                                        type="checkbox"
                                        checked={aiSearchEnabled}
                                        onChange={(e) => setAiSearchEnabled(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-0 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Properties Section */}
                <section className="flex-1 w-full bg-white dark:bg-canvas-dark py-16 px-4 md:px-10 lg:px-20 border-t border-slate-100 dark:border-slate-800">
                    <div className="max-w-[1400px] mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                    Featured Verified Properties
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Hand-picked properties with verified ownership status.
                                </p>
                            </div>
                            <Link
                                to="/search"
                                className="hidden md:flex items-center gap-1 text-brand font-bold hover:underline"
                            >
                                View all{' '}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        </div>

                        {/* Property Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {isLoading ? (
                                // Loading skeleton
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="animate-pulse">
                                        <div className="w-full aspect-[4/3] rounded-xl bg-slate-200 dark:bg-slate-700" />
                                        <div className="mt-4 space-y-2">
                                            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : error ? (
                                // Error state
                                <div className="col-span-full text-center py-12">
                                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">error</span>
                                    <p className="text-slate-500 dark:text-slate-400">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            ) : featuredProperties.length === 0 ? (
                                // Empty state
                                <div className="col-span-full text-center py-12">
                                    <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">home</span>
                                    <p className="text-slate-500 dark:text-slate-400">No featured properties available</p>
                                </div>
                            ) : (
                                // Property cards
                                featuredProperties.map((property) => {
                                    const listingInfo = getListingTypeInfo(property.listingType);
                                    const badge = getVerificationBadge(property.isVerified, property.verificationTier);

                                    return (
                                        <Link to={`/property/${property.id}`} key={property.id}>
                                            <article className="group flex flex-col gap-4 cursor-pointer">
                                                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-200">
                                                    <img
                                                        alt={property.name}
                                                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                                        src={property.primaryImage || PLACEHOLDER_IMAGE}
                                                    />
                                                    {badge && (
                                                        <div className={`absolute top-4 left-4 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${badge.className}`}>
                                                            <span className={`material-symbols-outlined text-[16px] icon-filled ${badge.iconClassName}`}>
                                                                {badge.icon}
                                                            </span>
                                                            {badge.label}
                                                        </div>
                                                    )}
                                                    <div className="absolute top-3 right-3">
                                                        <FavoriteButton
                                                            propertyId={property.id}
                                                            size="sm"
                                                            variant="overlay"
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                            {formatPrice(property.price, 'CAD')}
                                                            {listingInfo.priceUnit && (
                                                                <span className="text-sm font-normal text-slate-500">
                                                                    {listingInfo.priceUnit}
                                                                </span>
                                                            )}
                                                        </p>
                                                        <span
                                                            className={`text-xs font-semibold px-2 py-1 rounded-md ${listingInfo.color}`}
                                                        >
                                                            {listingInfo.label}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-700 dark:text-slate-200 text-base font-medium truncate">
                                                        {formatAddress(property.address)}
                                                    </p>
                                                    <div className="flex gap-4 mt-3 text-slate-500 dark:text-slate-400 text-sm">
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[18px]">bed</span>
                                                            {property.bedrooms} Beds
                                                        </span>
                                                        <span className="flex items-center gap-1.5">
                                                            <span className="material-symbols-outlined text-[18px]">bathtub</span>
                                                            {property.bathrooms} Baths
                                                        </span>
                                                        {property.squareFeet && (
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="material-symbols-outlined text-[18px]">square_foot</span>
                                                                {property.squareFeet.toLocaleString()} sqft
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </article>
                                        </Link>
                                    );
                                })
                            )}
                        </div>

                        {/* Mobile View All Link */}
                        <div className="mt-8 flex md:hidden justify-center">
                            <Link
                                to="/search"
                                className="flex items-center gap-1 text-brand font-bold hover:underline"
                            >
                                View all properties{' '}
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white dark:bg-canvas-dark border-t border-slate-200 dark:border-slate-800 py-6 px-4 md:px-10 lg:px-20 text-center">
                <div className="flex flex-col md:flex-row items-center justify-between max-w-[1400px] mx-auto text-sm text-slate-500 dark:text-slate-400">
                    <p>© {new Date().getFullYear()} HomeAI. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <Link to="/privacy" className="hover:text-brand transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="hover:text-brand transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/support" className="hover:text-brand transition-colors">
                            Support
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
