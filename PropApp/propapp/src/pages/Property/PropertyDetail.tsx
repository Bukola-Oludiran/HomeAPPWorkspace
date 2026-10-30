import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ScheduleViewingModal from '../../components/ScheduleViewingModal';
import VirtualTourModal from '../../components/VirtualTourModal';
import PhotoGalleryModal from '../../components/PhotoGalleryModal';
import BuyFlowModal from '../../components/BuyFlowModal';
import ShareModal from '../../components/ShareModal';
import ContactAgentModal from '../../components/ContactAgentModal';
import FavoriteButton from '../../components/FavoriteButton';
import { propertyService } from '@/lib/api/services/propertyService';
import type { Property } from '@/types/property';
import type { ApiError } from '@/types/api';

// Helper to format price
const formatPrice = (price: number, currency = 'CAD'): string => {
    const symbol = currency === 'CAD' ? '$' : '$';
    return `${symbol}${price.toLocaleString()}`;
};

// Helper to format listing type label
const getTypeLabel = (listingType: string): string => {
    if (listingType === 'SALE') return 'For Sale';
    if (listingType === 'RENT') return 'For Rent';
    if (listingType === 'SHORT_LET') return 'Short Let';
    return listingType;
};

// Helper to get verification badge info based on tier
// Styling based on DesignLanguage.md specifications
function getVerificationBadge(isVerified: boolean, tier?: string): {
    label: string;
    className: string;
    iconClassName: string;
    icon: string;
    tooltipTitle: string;
    tooltipText: string;
} | null {
    if (!isVerified) return null;

    // PLATINUM: Background #2980B9, Text White, Icon: Shield Check
    if (tier === 'PLATINUM') {
        return {
            label: 'PLATINUM VERIFIED',
            className: 'bg-[#2980B9] text-white shadow-lg',
            iconClassName: 'text-white',
            icon: 'verified_user',
            tooltipTitle: 'Platinum Verification',
            tooltipText: 'This property has passed our most rigorous in-person inspection, legal title check, and owner identity verification.',
        };
    }
    // GOLD: #F1C40F (gold color)
    if (tier === 'GOLD') {
        return {
            label: 'GOLD VERIFIED',
            className: 'bg-[#F1C40F] text-slate-900 shadow-lg',
            iconClassName: 'text-slate-900',
            icon: 'verified',
            tooltipTitle: 'Gold Verification',
            tooltipText: 'This property has been verified with document checks and owner identity confirmation.',
        };
    }
    // SILVER: Gray Pill
    if (tier === 'SILVER') {
        return {
            label: 'SILVER VERIFIED',
            className: 'bg-slate-400 dark:bg-slate-500 text-white',
            iconClassName: 'text-white',
            icon: 'verified',
            tooltipTitle: 'Silver Verification',
            tooltipText: 'This property has been verified with basic document verification.',
        };
    }
    // BRONZE: Orange Pill
    return {
        label: 'BRONZE VERIFIED',
        className: 'bg-orange-500 text-white',
        iconClassName: 'text-white',
        icon: 'verified',
        tooltipTitle: 'Bronze Verification',
        tooltipText: 'This property has been verified by our team.',
    };
}


export default function PropertyDetail() {
    const { id } = useParams<{ id: string }>();

    // API state
    const [property, setProperty] = useState<Property | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<ApiError | null>(null);

    // Modal states
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [showViewingModal, setShowViewingModal] = useState(false);
    const [showTourModal, setShowTourModal] = useState(false);
    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);

    // Fetch property on mount
    useEffect(() => {
        if (!id) return;

        const fetchProperty = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await propertyService.getPropertyById(id);
                setProperty(response.data);
            } catch (err) {
                setError(err as ApiError);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperty();
    }, [id]);

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Loading property...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !property) {
        return (
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                        {error?.error?.code === 'RES_002' ? 'Property Not Found' : 'Something went wrong'}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        {error?.error?.message || 'Failed to load property details'}
                    </p>
                    <Link
                        to="/search"
                        className="px-6 py-2 bg-brand-ink text-on-brand rounded-lg font-semibold hover:bg-brand-ink/90 inline-block"
                    >
                        Back to Search
                    </Link>
                </div>
            </div>
        );
    }

    // Derived values for UI
    const primaryImage = property.media.find(m => m.isPrimary)?.url || property.media[0]?.url || 'https://placehold.co/800x600?text=No+Image';
    const galleryImages = property.media.filter(m => m.type === 'IMAGE').map(m => m.url);
    const priceDisplay = formatPrice(property.price, 'CAD');
    const typeLabel = getTypeLabel(property.listingType);
    const fullAddress = `${property.address.street}, ${property.address.city}, ${property.address.state}`;
    const sqft = property.squareFeet ? property.squareFeet.toLocaleString() : 'N/A';

    return (
        <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden pb-[140px]">
            {/* Floating Header (No navbar per design) */}
            <header className="fixed top-0 left-0 w-full z-40 bg-transparent pointer-events-none">
                <div className="px-4 md:px-8 py-4 flex items-center justify-between">
                    <Link
                        to="/search"
                        className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors pointer-events-auto text-slate-900 dark:text-white"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors text-slate-900 dark:text-white"
                        >
                            <span className="material-symbols-outlined">share</span>
                        </button>
                        <FavoriteButton
                            propertyId={property.id}
                            variant="overlay"
                        />
                    </div>
                </div>
            </header>

            {/* Hero Image Gallery */}
            <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-slate-200 overflow-hidden">
                <img
                    alt={`${property.name} large windows`}
                    className="w-full h-full object-cover"
                    src={primaryImage}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10"></div>
                {/* Image Pagination Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors cursor-pointer"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors cursor-pointer"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors cursor-pointer"></div>
                    <div className="w-2 h-2 rounded-full bg-white/50 hover:bg-white transition-colors cursor-pointer"></div>
                </div>
                {/* Action Buttons */}
                <div className="absolute bottom-6 right-6 flex flex-col gap-3">
                    <button
                        onClick={() => setShowTourModal(true)}
                        className="px-4 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-white dark:hover:bg-black/80 transition-colors shadow-sm text-slate-900 dark:text-white justify-center"
                    >
                        <span className="material-symbols-outlined text-[18px]">view_in_ar</span>
                        3D Tour
                    </button>
                    <button
                        onClick={() => setShowGalleryModal(true)}
                        className="px-4 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-white dark:hover:bg-black/80 transition-colors shadow-sm text-slate-900 dark:text-white justify-center"
                    >
                        <span className="material-symbols-outlined text-[18px]">grid_view</span>
                        View all {galleryImages.length} photos
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column - Property Details */}
                    <div className="flex-1 min-w-0">
                        {/* Property Header */}
                        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs font-bold uppercase tracking-wider rounded-md">
                                            {typeLabel}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm">
                                            Listed recently
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                                        {property.name}
                                    </h1>
                                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-[20px] mr-1.5">
                                            location_on
                                        </span>
                                        <p className="text-lg">{fullAddress}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end">
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-brand-ink">
                                        {priceDisplay}
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                        {property.listingType === 'RENT' ? '/month' : property.listingType === 'SHORT_LET' ? '/night' : ''}
                                    </p>
                                </div>
                            </div>
                            {/* Verification Badges */}
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                {(() => {
                                    const badge = getVerificationBadge(property.isVerified, property.verificationTier);
                                    if (!badge) return null;
                                    return (
                                        <div className="group relative cursor-pointer">
                                            <div className={`text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 ${badge.className}`}>
                                                <span className={`material-symbols-outlined text-[20px] icon-filled ${badge.iconClassName}`}>
                                                    {badge.icon}
                                                </span>
                                                {badge.label}
                                                <span className="material-symbols-outlined text-[16px] opacity-50 ml-1">
                                                    info
                                                </span>
                                            </div>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl">
                                                <p className="font-bold mb-1">{badge.tooltipTitle}</p>
                                                <p>{badge.tooltipText}</p>
                                                <div className="absolute top-full left-6 -mt-1 border-4 border-transparent border-t-slate-900 dark:border-t-white"></div>
                                            </div>
                                        </div>
                                    );
                                })()}
                                {property.isVerified && (
                                    <>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-green-500 text-[18px] icon-filled">
                                                check_circle
                                            </span>
                                            Title Clear
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                            <span className="material-symbols-outlined text-green-500 text-[18px] icon-filled">
                                                check_circle
                                            </span>
                                            In-Person Inspection
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Property Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[24px]">bed</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {property.bedrooms}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Bedrooms</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[24px]">
                                    bathtub
                                </span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {property.bathrooms}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Bathrooms</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[24px]">
                                    square_foot
                                </span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {sqft}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Sq Ft</span>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-400 text-[24px]">
                                    calendar_month
                                </span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {property.yearBuilt || 'N/A'}
                                </span>
                                <span className="text-xs text-slate-500 uppercase tracking-wide">Year Built</span>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                About this home
                            </h3>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                                {(property.description || 'No description available.').split('\n\n').map((paragraph, index) => (
                                    <p key={index} className="mb-4">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                            <button className="mt-4 text-brand-ink font-semibold flex items-center gap-1 hover:underline">
                                Read more{' '}
                                <span className="material-symbols-outlined text-[18px]">expand_more</span>
                            </button>
                        </div>

                        {/* AI Property Analysis */}
                        <div className="mb-10 p-6 rounded-2xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand">
                                    <span className="material-symbols-outlined text-[18px]">forum</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    AI Property Analysis
                                </h3>
                            </div>
                            {/* AI highlights are computed elsewhere (out of scope for the
                                property wire shape). UI shell retained as a no-op until a
                                future analytics-derived highlights feed lands. */}
                            <ul className="space-y-3"></ul>
                        </div>

                        {/* Location Section */}
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Location</h3>
                            <div className="w-full h-64 rounded-xl bg-slate-200 dark:bg-slate-700 relative overflow-hidden group cursor-pointer">
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-300 dark:bg-slate-600">
                                    <div className="absolute top-0 left-0 right-0 h-full w-full opacity-30 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                    <span className="material-symbols-outlined text-6xl text-slate-400 dark:text-slate-500">
                                        map
                                    </span>
                                </div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-12 bg-brand/20 rounded-full flex items-center justify-center animate-pulse">
                                    <div className="size-4 bg-brand rounded-full border-2 border-white shadow-lg"></div>
                                </div>
                                <button className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg text-sm font-semibold transition-transform">
                                    Explore Map
                                </button>
                            </div>
                            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm">
                                {property.address.city}, {property.address.state} - {property.address.neighborhood || 'Neighborhood'}
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Agent Card (Desktop only) */}
                    <div className="hidden lg:block w-[360px] shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="relative">
                                        <img
                                            alt="Owner Profile"
                                            className="size-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-600"
                                            src={property.owner?.avatarUrl || 'https://placehold.co/64x64?text=Agent'}
                                        />
                                        <span className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                                            {[property.owner?.firstName, property.owner?.lastName].filter(Boolean).join(' ') || 'Property Owner'}
                                        </h4>
                                        <p className="text-slate-500 text-sm">Property Owner</p>
                                        {property.owner?.verificationLevel && property.owner.verificationLevel !== 'UNVERIFIED' && (
                                            <div className="flex items-center gap-1 text-xs font-semibold text-brand-ink mt-1">
                                                <span className="material-symbols-outlined text-[14px] icon-filled">
                                                    verified
                                                </span>
                                                Verified ({property.owner.verificationLevel})
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <button className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-600 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mb-3">
                                    Message Host
                                </button>
                                <div className="text-center text-xs text-slate-400">
                                    Contact for more info
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating AI Bar */}
            <div className="fixed bottom-[90px] left-0 right-0 flex justify-center z-30 px-4 pointer-events-none">
                <div className="w-full max-w-2xl bg-white/95 dark:bg-canvas-dark/95 backdrop-blur-xl border border-brand/20 shadow-lg rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto [box-shadow:0_0_15px_rgba(19,127,236,0.4)] transition-all hover:scale-[1.01]">
                    <div className="size-10 rounded-full bg-brand flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">forum</span>
                    </div>
                    <div className="flex-1 overflow-hidden h-10 flex items-center">
                        <p className="text-slate-600 dark:text-slate-300 text-sm truncate animate-pulse">
                            Ask me about the neighborhood safety, schools, or financing options...
                        </p>
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
                            mic
                        </span>
                    </button>
                    <button className="size-10 rounded-full bg-brand hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-white">arrow_upward</span>
                    </button>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full z-20 bg-white dark:bg-canvas-dark border-t border-slate-200 dark:border-slate-800 p-4 md:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
                    <div className="hidden md:block">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">
                            Price
                        </p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {property.price}
                            </span>
                        </div>
                    </div>
                    <div className="flex-1 md:flex-none flex gap-3 w-full md:w-auto">
                        <button
                            onClick={() => setShowViewingModal(true)}
                            className="flex-1 md:flex-none px-6 py-3.5 rounded-xl border-2 border-brand text-brand-ink font-bold hover:bg-blue-50 dark:hover:bg-brand/10 transition-colors whitespace-nowrap"
                        >
                            Schedule Viewing
                        </button>
                        <button
                            onClick={() => setShowBuyModal(true)}
                            className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-brand-ink text-on-brand font-bold hover:bg-[#0e64bd] transition-colors whitespace-nowrap"
                        >
                            Buy Now / Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Buy Flow Modal */}
            <BuyFlowModal
                isOpen={showBuyModal}
                onClose={() => setShowBuyModal(false)}
                property={{
                    name: property.name,
                    address: fullAddress,
                    image: primaryImage,
                    listingPrice: property.price,
                }}
            />

            {/* Schedule Viewing Modal */}
            <ScheduleViewingModal
                isOpen={showViewingModal}
                onClose={() => setShowViewingModal(false)}
                property={{
                    name: property.name,
                    address: fullAddress,
                    image: primaryImage,
                }}
            />

            {/* Virtual Tour Modal */}
            <VirtualTourModal
                isOpen={showTourModal}
                onClose={() => setShowTourModal(false)}
                property={{
                    name: property.name,
                    address: fullAddress,
                    image: primaryImage,
                }}
                agent={{
                    name: [property.owner?.firstName, property.owner?.lastName].filter(Boolean).join(' ') || 'Agent',
                    image: property.owner?.avatarUrl || 'https://placehold.co/64x64?text=Agent',
                }}
            />

            {/* Photo Gallery Modal */}
            <PhotoGalleryModal
                isOpen={showGalleryModal}
                onClose={() => setShowGalleryModal(false)}
                property={{
                    name: property.name,
                    address: fullAddress,
                }}
                images={galleryImages}
            />

            {/* Share Modal */}
            <ShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                title={`${property.name} - ${property.bedrooms ?? 0} bed, ${property.bathrooms ?? 0} bath • ${sqft} sqft • ${priceDisplay}`}
                url={window.location.href}
            />

            {/* Contact Agent Modal */}
            <ContactAgentModal
                isOpen={showContactModal}
                onClose={() => setShowContactModal(false)}
                agent={{
                    id: property.owner.id,
                    name: [property.owner?.firstName, property.owner?.lastName].filter(Boolean).join(' ') || 'Property Agent',
                    title: 'Property Owner',
                    image: property.owner?.avatarUrl || 'https://placehold.co/64x64?text=Agent',
                }}
                property={{
                    id: property.id,
                    name: property.name,
                    address: fullAddress,
                }}
            />
        </div>
    );
}
