import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FavoriteButton from '@/components/FavoriteButton';
import VoiceInputButton from '@/components/VoiceInputButton';
import Logo from '@/components/common/Logo';
import ContourMotif from '@/components/common/ContourMotif';
import { propertyService } from '@/lib/api/services/propertyService';
import type { PropertySummary, ListingType } from '@/types/property';
import { formatCurrency as formatPrice, listingPrice } from '@/lib/format';

// Helper to format price with currency
// Helper to get listing type display info
function getListingTypeInfo(listingType: ListingType): { label: string; color: string } {
    switch (listingType) {
        case 'SALE':
            return { label: 'For sale', color: 'bg-green-100 text-green-700' };
        case 'RENT':
            return { label: 'For rent', color: 'bg-blue-100 text-blue-700' };
        case 'SHORT_LET':
            return { label: 'Short-let', color: 'bg-purple-100 text-purple-700' };
        default:
            return { label: 'For sale', color: 'bg-green-100 text-green-700' };
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


type CategoryType = 'Rent' | 'Buy' | 'Short-let' | 'Land';

// What each hero search mode asks the search page for
const SEARCH_FILTERS: Record<CategoryType, Record<string, string>> = {
    Rent: { listingType: 'RENT' },
    Buy: { listingType: 'SALE' },
    'Short-let': { listingType: 'SHORT_LET' },
    Land: { propertyType: 'LAND' },
};

const SEARCH_PLACEHOLDERS: Record<CategoryType, string> = {
    Rent: 'Area, street or estate, e.g. Lekki Phase 1',
    Buy: 'Area, street or estate, e.g. Ikeja GRA',
    'Short-let': 'Where are you staying? e.g. Victoria Island',
    Land: 'Area or LGA, e.g. Ibeju-Lekki',
};

export default function HomePage() {
    const [activeCategory, setActiveCategory] = useState<CategoryType>('Rent');
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

    const categories: CategoryType[] = ['Rent', 'Buy', 'Short-let', 'Land'];
    const navigate = useNavigate();

    // Listing modes open the search page with filters; "Describe it in your words" asks the assistant
    function handleSearch(event: FormEvent) {
        event.preventDefault();
        const text = searchQuery.trim();
        if (aiSearchEnabled) {
            if (text) navigate(`/ai-chat?msg=${encodeURIComponent(text)}`);
            return;
        }
        const params = new URLSearchParams(SEARCH_FILTERS[activeCategory]);
        if (text) params.set('q', text);
        navigate(`/search?${params.toString()}`);
    }

    return (
        <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden relative">
            {/* Logo - over the hero painting; hidden on phones, where the navigation spans the full width */}
            <div className="absolute top-6 left-6 md:left-10 z-40 hidden md:flex items-center h-10">
                <Logo wordmark="md" />
            </div>


            {/* Navbar is now rendered at App level via UnifiedNavbar */}


            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Hero Section with full-bleed Keystead imagery */}
                <section className="relative w-full min-h-[80vh] px-4 md:px-10 lg:px-20 flex justify-center items-center overflow-hidden">
                    <img
                        src="/images/colosseum-wireframe-grid.jpg"
                        alt=""
                        className="absolute inset-0 z-0 w-full h-full object-cover object-[50%_25%]"
                    />
                    {/* Fade: the painting stays visible at the top, then washes to the page colour behind the text and search */}
                    <div className="absolute inset-0 z-0 bg-gradient-to-b from-canvas/0 via-canvas/70 via-55% to-canvas dark:from-canvas-dark/20 dark:via-canvas-dark/75 dark:to-canvas-dark"></div>

                    <div className="relative z-10 max-w-4xl w-full flex flex-col items-center mt-24">
                        <div className="text-center mb-10 space-y-4">
                            <h1 className="text-slate-900 dark:text-white tracking-tight text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
                                Know what's been checked before you visit.
                            </h1>
                            <p className="text-slate-700 dark:text-slate-200 text-lg md:text-xl font-normal max-w-2xl mx-auto">
                                Every listing shows its verification tier, from Bronze to Platinum. Search by area and
                                budget, or describe the home you want in plain words.
                            </p>
                        </div>

                        {/* Search: one panel. Choose what you're looking for, then where */}
                        <form
                            role="search"
                            onSubmit={handleSearch}
                            className="w-full max-w-3xl rounded-2xl border border-night bg-night text-left dark:border-border dark:bg-neutral-bg"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-x-4 border-b border-white/10 px-2 md:px-3 dark:border-border">
                                <div className="flex" role="group" aria-label="What are you looking for?">
                                    {categories.map((category) => {
                                        const active = activeCategory === category && !aiSearchEnabled;
                                        return (
                                            <button
                                                key={category}
                                                type="button"
                                                aria-pressed={active}
                                                onClick={() => {
                                                    setActiveCategory(category);
                                                    setAiSearchEnabled(false);
                                                }}
                                                className={`relative h-12 px-3 text-[15px] font-semibold transition-colors ${active ? 'text-white dark:text-sky' : 'text-slate-300 hover:text-white dark:text-slate-400 dark:hover:text-foreground'}`}
                                            >
                                                {category}
                                                {active && <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-sky" aria-hidden="true" />}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    type="button"
                                    aria-pressed={aiSearchEnabled}
                                    onClick={() => setAiSearchEnabled((on) => !on)}
                                    className={`my-1.5 flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-semibold transition-colors ${aiSearchEnabled ? 'bg-sky/15 text-sky' : 'text-slate-300 hover:bg-white/10 hover:text-white dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-foreground'}`}
                                >
                                    <span className="material-symbols-outlined text-[18px]" aria-hidden="true">forum</span>
                                    Describe it in your words
                                </button>
                            </div>
                            <div className="flex flex-col gap-2 p-2 md:flex-row">
                                <div className="flex h-14 flex-1 items-center gap-3 rounded-xl bg-white px-3 dark:bg-surface-dark">
                                    <span className="material-symbols-outlined text-slate-500 dark:text-slate-400" aria-hidden="true">
                                        {aiSearchEnabled ? 'forum' : 'search'}
                                    </span>
                                    <label htmlFor="hero-search" className="sr-only">
                                        {aiSearchEnabled ? 'Describe the home you want' : 'Area, street or estate'}
                                    </label>
                                    <input
                                        id="hero-search"
                                        className="w-full flex-1 border-none bg-transparent p-0 text-base text-foreground outline-none placeholder:text-slate-500 focus:ring-0 dark:placeholder:text-slate-400 md:text-lg"
                                        placeholder={aiSearchEnabled ? 'e.g. A quiet 2-bedroom near Lekki under ₦7M a year' : SEARCH_PLACEHOLDERS[activeCategory]}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <VoiceInputButton onResult={(text) => setSearchQuery(text)} size="sm" />
                                </div>
                                <button
                                    type="submit"
                                    className="h-14 rounded-xl bg-brand-ink px-8 text-[15px] font-bold text-on-brand transition hover:brightness-110 active:brightness-95"
                                >
                                    {aiSearchEnabled ? 'Ask Keystead' : 'Search'}
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* Featured Properties Section */}
                <section className="relative overflow-hidden flex-1 w-full bg-white dark:bg-canvas-dark py-16 px-4 md:px-10 lg:px-20 border-t border-slate-100 dark:border-slate-800">
                    {/* Keystead contour map as faint motif fragments */}
                    <ContourMotif />
                    <div className="relative max-w-[1400px] mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                                    Featured verified properties
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">
                                    Hand-picked properties with verified ownership status.
                                </p>
                            </div>
                            <Link
                                to="/search"
                                className="hidden md:flex items-center gap-1 text-brand-ink font-bold hover:underline"
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
                                    <span className="material-symbols-outlined text-4xl text-slate-500 dark:text-slate-400 mb-2">error</span>
                                    <p className="text-slate-500 dark:text-slate-400">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 px-4 py-2 bg-brand-ink text-on-brand rounded-lg hover:bg-brand-ink/90"
                                    >
                                        Try again
                                    </button>
                                </div>
                            ) : featuredProperties.length === 0 ? (
                                // Empty state
                                <div className="col-span-full text-center py-12">
                                    <span className="material-symbols-outlined text-4xl text-slate-500 dark:text-slate-400 mb-2">home</span>
                                    <p className="text-slate-500 dark:text-slate-400">No featured properties available</p>
                                </div>
                            ) : (
                                // Property cards
                                featuredProperties.map((property) => {
                                    const listingInfo = getListingTypeInfo(property.listingType);
                                    const price = listingPrice(property.price, property.priceUnit);
                                    const badge = getVerificationBadge(property.isVerified, property.verificationTier);

                                    return (
                                        <Link to={`/property/${property.id}`} key={property.id} className="block h-full">
                                            <article className="group flex h-full flex-col cursor-pointer overflow-hidden rounded-xl border border-border bg-card">
                                                <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-200">
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
                                                <div className="p-4">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                                                            {formatPrice(price.amount)}
                                                            {price.suffix && (
                                                                <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                                                                    {price.suffix}
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
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-slate-500 dark:text-slate-400 text-sm whitespace-nowrap">
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
                                className="flex items-center gap-1 text-brand-ink font-bold hover:underline"
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
                    <p>© {new Date().getFullYear()} Keystead. All rights reserved.</p>
                    <div className="flex gap-4 mt-2 md:mt-0">
                        <Link to="/privacy" className="hover:text-brand-ink transition-colors">
                            Privacy policy
                        </Link>
                        <Link to="/terms" className="hover:text-brand-ink transition-colors">
                            Terms of service
                        </Link>
                        <Link to="/support" className="hover:text-brand-ink transition-colors">
                            Support
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
