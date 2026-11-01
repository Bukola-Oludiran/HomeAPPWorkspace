import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import PhotoGalleryModal from '../../../components/PhotoGalleryModal';
import ScheduleMaintenanceModal from '../../../components/ScheduleMaintenanceModal';
import { AnimatedGroup } from '../../../components/animation';
import { propertyService, landlordService, maintenanceService } from '../../../lib/api/services';
import type { Property, PropertyViewAnalytics, PropertyMarketComparison, VerificationTier } from '../../../types/property';
import { formatCurrency, formatListingPrice, listingPrice } from '@/lib/format';
import ContourMotif, { type ContourFragment } from '../../../components/common/ContourMotif';

const CONTOUR: ContourFragment[] = [
    'hidden lg:block top-[74%] left-[calc(50%+420px)] -translate-x-1/2 -translate-y-1/2 -rotate-12 w-[880px]',
    '-bottom-24 -left-48 w-[50vw] max-w-[520px] rotate-180',
];

// UI types for property detail
interface UIPropertyData {
    id: string;
    name: string;
    address: string;
    targetRent: string;
    marketComparison: string;
    status: string;
    onlineDays: number;
    verified: string;
    verificationTier?: VerificationTier;
    verificationPending: boolean;
    image: string;
    photoCount: number;
    beds: number;
    baths: number;
    sqft: string;
    yearBuilt: number;
    metrics: {
        views: number;
        viewsChange: string;
        applicants: number;
        newApplicants: number;
        maintenance: number;
        daysListed: number;
    };
    tenant: {
        name: string;
        since: number;
        leaseEnd: string;
        paymentStatus: string;
        monthlyRent: string;
    } | null;
    financials: {
        rentPerYear: string;
        receivedThisYear: string;
    };
    description: string;
    insights: Array<{
        icon: string;
        iconColor: string;
        title: string;
        text: string;
    }>;
    tasks: Array<{
        id: number;
        title: string;
        due: string;
    }>;
    galleryImages: string[];
}

// Format currency
// Get verification label
function getVerificationLabel(tier?: VerificationTier): string {
    if (!tier) return 'Not verified';
    const labels: Record<VerificationTier, string> = {
        UNVERIFIED: 'Not verified',
        BRONZE: 'Bronze Verified',
        SILVER: 'Silver Verified',
        GOLD: 'Gold Verified',
        PLATINUM: 'Platinum Verified',
    };
    return labels[tier] || 'Verified';
}

// Get status label
function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        AVAILABLE: 'Active Listing',
        RENTED: 'Currently Rented',
        PENDING: 'Pending Review',
        MAINTENANCE: 'Under Maintenance',
        DRAFT: 'Draft',
    };
    return labels[status] || status;
}

// Calculate days online
function getDaysOnline(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

// Format address
function formatAddress(address: Property['address']): string {
    const parts = [address.street, address.city, address.state];
    return parts.filter(Boolean).join(', ');
}

interface PropertyCounts {
    applicants: number;
    newApplicants: number;
    openMaintenance: number;
    receivedThisYear: number;
}

// Views over the last 7 days against the 7 before; N/A without two full weeks of data
function weekOverWeek(viewsByDay?: Array<{ date: string; views: number }>): string {
    if (!viewsByDay || viewsByDay.length < 14) return 'N/A';
    const last = viewsByDay.slice(-7).reduce((sum, d) => sum + d.views, 0);
    const prev = viewsByDay.slice(-14, -7).reduce((sum, d) => sum + d.views, 0);
    if (prev === 0) return 'N/A';
    const change = Math.round(((last - prev) / prev) * 100);
    return `${change >= 0 ? '+' : ''}${change}%`;
}

// Transform property to UI format
function transformToUIProperty(
    property: Property,
    analytics?: PropertyViewAnalytics,
    marketComparison?: PropertyMarketComparison,
    counts: PropertyCounts = { applicants: 0, newApplicants: 0, openMaintenance: 0, receivedThisYear: 0 }
): UIPropertyData {
    const primaryImage = property.media?.find(m => m.isPrimary)?.url || property.media?.[0]?.url || '';
    const galleryImages = property.media?.map(m => m.url) || [];

    const annualRent = listingPrice(property.price, property.priceUnit).amount;

    return {
        id: property.id,
        name: property.name,
        address: formatAddress(property.address),
        targetRent: formatListingPrice(property.price, property.priceUnit),
        marketComparison: marketComparison?.marketAnalysis ? `${marketComparison.marketAnalysis.percentile > 50 ? '+' : ''}${(marketComparison.marketAnalysis.percentile - 50).toFixed(0)}%` : 'N/A',
        status: getStatusLabel(property.status),
        onlineDays: getDaysOnline(property.createdAt),
        verified: getVerificationLabel(property.verificationTier),
        verificationTier: property.verificationTier,
        verificationPending: !property.isVerified && property.verificationTier !== 'PLATINUM',
        image: primaryImage,
        photoCount: property.media?.length || 0,
        beds: property.bedrooms ?? 0,
        baths: property.bathrooms ?? 0,
        sqft: property.squareFeet?.toLocaleString() || 'N/A',
        yearBuilt: property.yearBuilt || 0,
        metrics: {
            views: analytics?.totalViews ?? 0,
            viewsChange: weekOverWeek(analytics?.viewsByDay),
            applicants: counts.applicants,
            newApplicants: counts.newApplicants,
            maintenance: counts.openMaintenance,
            daysListed: getDaysOnline(property.createdAt),
        },
        tenant: null, // Would come from lease data if available
        financials: {
            rentPerYear: property.listingType === 'SALE' ? 'For sale' : formatCurrency(annualRent),
            receivedThisYear: formatCurrency(counts.receivedThisYear),
        },
        description: property.description || 'No description available.',
        insights: [
            {
                icon: 'trending_up',
                iconColor: 'text-green-500',
                title: 'Market analysis:',
                text: marketComparison?.recommendation?.potentialImpact
                    || 'Market data will be available soon.',
            },
            {
                icon: 'calendar_clock',
                iconColor: 'text-blue-500',
                title: 'Listing status:',
                text: `This property has been online for ${getDaysOnline(property.createdAt)} days.`,
            },
            {
                icon: 'home_repair_service',
                iconColor: 'text-orange-500',
                title: 'Preventative maintenance:',
                text: 'Schedule regular maintenance checks to keep the property in top condition.',
            },
        ],
        tasks: [
            { id: 1, title: 'Review listing details', due: 'Recommended' },
            { id: 2, title: 'Update photos', due: 'Optional' },
        ],
        galleryImages,
    };
}

// Default property data for loading state
const defaultPropertyData: UIPropertyData = {
    id: '',
    name: 'Loading...',
    address: '',
    targetRent: '...',
    marketComparison: '...',
    status: '...',
    onlineDays: 0,
    verified: '...',
    verificationPending: false,
    image: '',
    photoCount: 0,
    beds: 0,
    baths: 0,
    sqft: '...',
    yearBuilt: 0,
    metrics: { views: 0, viewsChange: '...', applicants: 0, newApplicants: 0, maintenance: 0, daysListed: 0 },
    tenant: null,
    financials: { rentPerYear: '...', receivedThisYear: '...' },
    description: '',
    insights: [],
    tasks: [],
    galleryImages: [],
};

export default function LandlordPropertyDetail() {
    const { id } = useParams();
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // API data state
    const [property, setProperty] = useState<UIPropertyData>(defaultPropertyData);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch property data
    useEffect(() => {
        async function fetchPropertyData() {
            if (!id) return;

            try {
                setIsLoading(true);
                setError(null);

                // Fetch property details, analytics, and applicants in parallel
                const [propertyResponse, analyticsResponse, applicantsResponse, maintenanceResponse, transactionsResponse] = await Promise.allSettled([
                    propertyService.getPropertyById(id),
                    propertyService.getPropertyViewAnalytics(id),
                    landlordService.getApplicants({ propertyId: id, limit: 100 }),
                    maintenanceService.getMaintenanceRequests(),
                    landlordService.getTransactions({ limit: 200 }),
                ]);

                // Get property data
                const propertyData = propertyResponse.status === 'fulfilled' ? propertyResponse.value.data : null;
                const analytics = analyticsResponse.status === 'fulfilled' ? analyticsResponse.value.data : undefined;
                const applicants = applicantsResponse.status === 'fulfilled' ? applicantsResponse.value.data ?? [] : [];
                const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                const requests = maintenanceResponse.status === 'fulfilled' ? maintenanceResponse.value.data ?? [] : [];
                const transactions = transactionsResponse.status === 'fulfilled' ? transactionsResponse.value.data ?? [] : [];
                const year = new Date().getFullYear();
                const counts: PropertyCounts = {
                    applicants: applicants.length,
                    newApplicants: applicants.filter((a) => new Date(a.createdAt).getTime() >= weekAgo).length,
                    openMaintenance: requests.filter((r) => r.lease?.property?.id === id && !['COMPLETED', 'CANCELLED'].includes(r.status)).length,
                    receivedThisYear: transactions
                        .filter((t) => t.propertyId === id && t.type === 'RENT_PAYMENT' && t.status === 'COMPLETED' && new Date(t.createdAt).getFullYear() === year)
                        .reduce((sum, t) => sum + t.amount, 0),
                };

                if (propertyData) {
                    // Try to get market comparison (may fail if not available)
                    let marketComparison: PropertyMarketComparison | undefined;
                    try {
                        const marketResponse = await propertyService.getPropertyMarketComparison(id);
                        marketComparison = marketResponse.data;
                    } catch {
                        // Market comparison not available
                    }

                    setProperty(transformToUIProperty(propertyData, analytics, marketComparison, counts));
                } else {
                    setError('Property not found');
                }
            } catch (err) {
                console.error('Error fetching property details:', err);
                setError('Failed to load property details');
            } finally {
                setIsLoading(false);
            }
        }

        fetchPropertyData();
    }, [id]);

    // Gallery images from property data
    const galleryImages = property.galleryImages.length > 0
        ? property.galleryImages
        : [property.image].filter(Boolean);

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
                    <p className="text-slate-500 dark:text-slate-400">Loading property details...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-5xl text-red-400 mb-4">error</span>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden pb-[140px]">
            {/* Keystead contour map: the sidebar ends early, so a fragment fills the right column below it */}
            <ContourMotif fragments={CONTOUR} contained />
            {/* Hero Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-slate-200 overflow-hidden">
                <img
                    alt={property.name}
                    className="w-full h-full object-cover"
                    src={property.image}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/10"></div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full ${i === 1 ? 'bg-white shadow-sm' : 'bg-white/50 hover:bg-white transition-colors cursor-pointer'}`}
                        ></div>
                    ))}
                </div>
                <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-white dark:hover:bg-black/80 transition-colors shadow-sm text-slate-900 dark:text-white"
                >
                    <span className="material-symbols-outlined text-[18px]">photo_library</span>
                    Manage Photos ({property.photoCount})
                </button>
            </div>

            {/* Main Content */}
            <main className="relative w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Left Column */}
                    <div className="flex-1 min-w-0">
                        {/* Verification Pending Banner */}
                        {property.verificationPending && (
                            <div className="mb-8 rounded-xl border border-orange-200 bg-orange-50 p-5 dark:border-orange-900/30 dark:bg-orange-900/20 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-50">
                                    <span className="material-symbols-outlined text-orange-200 dark:text-orange-900/40 text-[120px] -mr-8 -mt-8 rotate-12">gpp_maybe</span>
                                </div>
                                <div className="relative z-10 flex flex-col sm:flex-row gap-5">
                                    <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/50 dark:text-orange-400 ring-4 ring-white dark:ring-slate-800 shadow-sm">
                                        <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>priority_high</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                Action Required: Verification Pending
                                                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-xs uppercase tracking-wider font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">Urgent</span>
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 leading-relaxed max-w-2xl">
                                            This property requires an updated <strong>Certificate of Occupancy (C of O)</strong> to maintain its active listing status and appear in search results. Please upload the document to the Verification Hub.
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <Link
                                                to="/landlord/verification"
                                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition-all hover:bg-orange-700 hover:shadow-orange-600/30"
                                            >
                                                <span className="material-symbols-outlined text-[20px]">verified_user</span>
                                                Go to verification hub
                                            </Link>
                                            <button className="inline-flex items-center justify-center gap-2 rounded-lg border border-orange-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                                                Remind me later
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Property Header */}
                        <div className="mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider rounded-md">
                                            {property.status}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-1">
                                            <span className="size-2 rounded-full bg-green-500"></span>
                                            Online for {property.onlineDays} days
                                        </span>
                                    </div>
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                                        {property.name}
                                    </h1>
                                    <div className="flex items-center text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-[20px] mr-1.5">
                                            location_on
                                        </span>
                                        <p className="text-lg">{property.address}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-start md:items-end p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wide mb-1">
                                        Target rent
                                    </p>
                                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                                        {property.targetRent}
                                    </h2>
                                    <p className="text-green-600 dark:text-green-400 text-sm font-semibold flex items-center mt-1">
                                        <span className="material-symbols-outlined text-[16px] mr-0.5">
                                            trending_up
                                        </span>
                                        {property.marketComparison} &gt; Market Avg
                                    </p>
                                </div>
                            </div>

                            {/* Verification Badge */}
                            <div className="mt-6 flex flex-wrap items-center gap-4">
                                <div className="group relative cursor-pointer">
                                    <div className={`text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 border ${
                                        property.verificationTier === 'PLATINUM'
                                            ? 'bg-gradient-to-r from-slate-200 via-white to-slate-300 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 text-slate-900 dark:text-white border-slate-300 dark:border-slate-500'
                                            : property.verificationTier === 'GOLD'
                                            ? 'bg-gradient-to-r from-yellow-100 via-yellow-50 to-amber-100 dark:from-yellow-900/40 dark:via-yellow-800/30 dark:to-amber-900/40 text-yellow-900 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700'
                                            : property.verificationTier === 'SILVER'
                                            ? 'bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-500'
                                            : 'bg-gradient-to-r from-orange-100 via-orange-50 to-amber-100 dark:from-orange-900/40 dark:via-orange-800/30 dark:to-amber-900/40 text-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700'
                                    }`}>
                                        <span className={`material-symbols-outlined text-[20px] icon-filled ${
                                            property.verificationTier === 'PLATINUM' ? 'text-slate-600 dark:text-slate-300'
                                            : property.verificationTier === 'GOLD' ? 'text-yellow-600 dark:text-yellow-400'
                                            : property.verificationTier === 'SILVER' ? 'text-slate-500 dark:text-slate-300'
                                            : 'text-orange-600 dark:text-orange-400'
                                        }`}>
                                            verified
                                        </span>
                                        {property.verified.toUpperCase()}
                                    </div>
                                </div>
                                <Link
                                    to="/landlord/verification"
                                    className="flex items-center gap-1 text-sm font-bold text-brand-ink hover:text-[#0e64bd] transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-brand/10"
                                >
                                    Open verification hub
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                                <div className="flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-green-500 text-[18px] icon-filled">
                                        check_circle
                                    </span>
                                    Inspection passed
                                </div>
                            </div>
                        </div>

                        {/* Performance Metrics */}
                        <div className="mb-8">
                            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
                                Performance metrics
                            </h3>
                            <AnimatedGroup className="grid grid-cols-2 md:grid-cols-4 gap-4" stagger={0.1}>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Views (30d)</span>
                                        <span className="material-symbols-outlined text-blue-500 text-[20px]">
                                            visibility
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {property.metrics.views.toLocaleString()}
                                    </span>
                                    <span className="text-xs text-green-500 font-medium flex items-center">
                                        <span className="material-symbols-outlined text-[14px] mr-0.5">
                                            arrow_upward
                                        </span>
                                        {property.metrics.viewsChange}
                                    </span>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1 ring-2 ring-brand/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Applicants</span>
                                        <span className="material-symbols-outlined text-brand-ink text-[20px]">
                                            group
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {property.metrics.applicants}
                                    </span>
                                    <span className="text-xs text-brand-ink font-medium">
                                        {property.metrics.newApplicants} New this week
                                    </span>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Maintenance</span>
                                        <span className="material-symbols-outlined text-orange-500 text-[20px]">
                                            build
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {property.metrics.maintenance}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{property.metrics.maintenance === 0 ? 'No open requests' : 'Open requests'}</span>
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Days listed</span>
                                        <span className="material-symbols-outlined text-brand-ink text-[20px]">
                                            calendar_month
                                        </span>
                                    </div>
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {property.metrics.daysListed}
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Since it went live</span>
                                </div>
                            </AnimatedGroup>
                        </div>

                        {/* Current Tenant */}
                        {property.tenant ? (
                            <div className="mb-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined">person</span>
                                        Current tenant information
                                    </h3>
                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded uppercase">
                                        Lease ending
                                    </span>
                                </div>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <Link to="/landlord/tenants/1/profile" className="flex items-center gap-4 group cursor-pointer">
                                        <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:ring-2 group-hover:ring-brand transition-all">
                                            <span className="material-symbols-outlined">face</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white group-hover:text-brand-ink transition-colors">{property.tenant.name}</p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Occupants since {property.tenant.since}</p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 group-hover:text-brand-ink transition-colors text-[18px]">chevron_right</span>
                                    </Link>
                                    <div className="h-px md:h-auto w-full md:w-px bg-slate-200 dark:bg-slate-700"></div>
                                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                                        <span className="text-slate-500 dark:text-slate-400">Lease ends:</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {property.tenant.leaseEnd}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400">Payment status:</span>
                                        <span className="font-medium text-green-600 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px] icon-filled">
                                                check_circle
                                            </span>
                                            {property.tenant.paymentStatus}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400">Monthly rent:</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {property.tenant.monthlyRent}
                                        </span>
                                    </div>
                                    <div className="flex-1 flex md:justify-end items-center">
                                        <Link to="/landlord/leases/1" className="text-brand-ink font-semibold text-sm hover:underline">
                                            View lease details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-10 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <span className="material-symbols-outlined">person</span>
                                        Current tenant information
                                    </h3>
                                </div>
                                <p className="text-sm text-slate-500 dark:text-slate-400">No tenant currently assigned to this property.</p>
                            </div>
                        )}

                        {/* Property Stats */}
                        <AnimatedGroup className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8" stagger={0.1}>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">bed</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {property.beds}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Beds</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">bathtub</span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {property.baths}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Baths</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                                    square_foot
                                </span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {property.sqft}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Sq ft</span>
                            </div>
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center gap-1">
                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                                    calendar_month
                                </span>
                                <span className="text-lg font-bold text-slate-900 dark:text-white">
                                    {property.yearBuilt || '—'}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Built</span>
                            </div>
                        </AnimatedGroup>

                        {/* Description */}
                        <div className="mb-10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                    Listing description
                                </h3>
                                <button className="text-brand-ink text-sm font-semibold flex items-center gap-1 hover:underline">
                                    <span className="material-symbols-outlined text-[16px]">edit</span> Edit Text
                                </button>
                            </div>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-sm">
                                <p className="mb-2 line-clamp-2">{property.description}</p>
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="mb-10 p-6 rounded-2xl bg-blue-50/50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand">
                                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    Management insights
                                </h3>
                            </div>
                            <ul className="space-y-3">
                                {property.insights.map((insight, index) => (
                                    <li
                                        key={index}
                                        className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300"
                                    >
                                        <span
                                            className={`material-symbols-outlined ${insight.iconColor} text-[20px] mt-0.5`}
                                        >
                                            {insight.icon}
                                        </span>
                                        <span>
                                            <strong>{insight.title}</strong> {insight.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="hidden lg:block w-[360px] shrink-0">
                        <div className="sticky top-24 space-y-6">
                            {/* Rent */}
                            <div className="bg-card rounded-xl border border-border p-6">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Rent</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Asking rent per year</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{property.financials.rentPerYear}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500 dark:text-slate-400">Received this year</span>
                                        <span className="font-bold text-slate-900 dark:text-white">{property.financials.receivedThisYear}</span>
                                    </div>
                                </div>
                                <Link to="/landlord/financials" className="mt-6 w-full py-2.5 rounded-xl border border-border-strong font-semibold text-sm text-slate-700 dark:text-slate-200 hover:bg-accent transition-colors flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">finance</span>
                                    View financials
                                </Link>
                            </div>

                            {/* Upcoming Tasks */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                                <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4">
                                    Upcoming tasks
                                </h4>
                                <ul className="space-y-4">
                                    {property.tasks.map((task) => (
                                        <li key={task.id} className="flex gap-3">
                                            <div className="mt-0.5 size-5 rounded-full border-2 border-slate-300 hover:border-brand cursor-pointer flex-shrink-0"></div>
                                            <div className="text-sm">
                                                <p className="font-medium text-slate-900 dark:text-white">{task.title}</p>
                                                <p className="text-slate-500 dark:text-slate-400 text-xs">{task.due}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                                <Link to={`/landlord/properties/${id}/tasks`} className="mt-4 text-brand-ink text-sm font-semibold hover:underline block">
                                    View all tasks
                                </Link>
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
                            Draft a lease renewal email, check recent maintenance costs, or analyze comps...
                        </p>
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">mic</span>
                    </button>
                    <button className="size-10 rounded-full bg-brand hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-sm">
                        <span className="material-symbols-outlined text-white">arrow_upward</span>
                    </button>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full z-20 bg-white dark:bg-canvas-dark border-t border-slate-200 dark:border-slate-800 p-4 md:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                                Listing status
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="font-bold text-slate-900 dark:text-white">Active</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-0.5">
                                Applicant queue
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {property.metrics.applicants} Applicants
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 md:flex-none flex gap-3 w-full md:w-auto">
                        <Link
                            to={`/landlord/properties/${id}/edit`}
                            className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            Edit listing
                        </Link>
                        <button
                            onClick={() => setIsMaintenanceModalOpen(true)}
                            className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border-2 border-brand text-brand-ink font-bold hover:bg-blue-50 dark:hover:bg-brand/10 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                            Schedule Maint.
                        </button>
                        <Link
                            to="/landlord/tenants"
                            className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-brand-ink text-on-brand font-bold hover:bg-[#0e64bd] transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">person_search</span>
                            View Applicants ({property.metrics.applicants})
                        </Link>
                    </div>
                </div>
            </div>

            {/* Photo Gallery Modal */}
            <PhotoGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                property={{ name: property.name, address: property.address }}
                images={galleryImages}
            />

            {/* Schedule Maintenance Modal */}
            <ScheduleMaintenanceModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
                propertyAddress={property.address}
            />
        </div>
    );
}
