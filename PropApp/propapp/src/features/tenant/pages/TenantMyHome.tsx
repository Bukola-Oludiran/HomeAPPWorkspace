// Tenant My Home page
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MakePaymentModal from '../../../components/MakePaymentModal';
import LeaseRenewalModal from '../../../components/LeaseRenewalModal';
import DocumentViewerModal from '../../../components/DocumentViewerModal';
import PhotoGalleryModal from '../../../components/PhotoGalleryModal';
import MaintenanceRequestModal from '../../../components/MaintenanceRequestModal';
import { tenantService } from '../../../lib/api/services/tenantService';

// Helper to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper to format date
function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

// UI home data structure
interface HomeData {
    property: {
        name: string;
        location: string;
        beds: number;
        baths: number;
        sqft: string;
        rent: string;
        image: string;
        verified: boolean;
    };
    payment: {
        nextAmount: string;
        dueDate: string;
        autoPayEnabled: boolean;
    };
    lease: {
        startDate: string;
        endDate: string;
        term: string;
        hasRenewalOffer: boolean;
        renewalExpiresDate: string;
    };
    maintenance: Array<{
        id: number;
        title: string;
        requestNumber: string;
        submittedDate: string;
        status: string;
        statusColor: string;
        iconColor: string;
        icon: string;
    }>;
    documents: Array<{
        id: number;
        name: string;
        type: string;
        size: string;
        icon: string;
        iconColor: string;
    }>;
    manager: {
        name: string;
        company: string;
        phone: string;
        email: string;
        image: string;
        online: boolean;
    };
}

// Default home data (fallback)
const defaultHomeData: HomeData = {
    property: {
        name: 'No Property',
        location: 'Not Available',
        beds: 0,
        baths: 0,
        sqft: '0',
        rent: '₦0',
        image: 'https://via.placeholder.com/800x600?text=No+Property',
        verified: false,
    },
    payment: {
        nextAmount: '₦0',
        dueDate: 'N/A',
        autoPayEnabled: false,
    },
    lease: {
        startDate: 'N/A',
        endDate: 'N/A',
        term: 'N/A',
        hasRenewalOffer: false,
        renewalExpiresDate: '',
    },
    maintenance: [],
    documents: [
        { id: 1, name: 'Move-in Checklist', type: 'PDF', size: '1.2 MB', icon: 'picture_as_pdf', iconColor: 'text-red-500' },
        { id: 2, name: 'Utility Information', type: 'DOCX', size: '800 KB', icon: 'description', iconColor: 'text-blue-500' },
        { id: 3, name: "Renter's Insurance Policy", type: 'PDF', size: '2.4 MB', icon: 'policy', iconColor: 'text-green-500' },
    ],
    manager: {
        name: 'Property Manager',
        company: 'Management Company',
        phone: 'N/A',
        email: 'N/A',
        image: 'https://via.placeholder.com/100?text=PM',
        online: false,
    },
};

export default function TenantMyHome() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isLeaseRenewalModalOpen, setIsLeaseRenewalModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState<{ name: string; type: string } | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // API state
    const [homeData, setHomeData] = useState<HomeData>(defaultHomeData);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch rental info from API
    useEffect(() => {
        async function fetchRentalInfo() {
            try {
                setIsLoading(true);
                const response = await tenantService.getRentalInfo();
                const data = response.data;

                if (data) {
                    // Calculate lease term in months
                    const startDate = new Date(data.lease.startDate);
                    const endDate = new Date(data.lease.endDate);
                    const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

                    setHomeData({
                        property: {
                            name: data.property.name,
                            location: `${data.property.address?.city || ''}, ${data.property.address?.state || ''} • Unit`,
                            beds: data.property.bedrooms,
                            baths: data.property.bathrooms,
                            sqft: data.property.squareFeet ? `${data.property.squareFeet}` : 'N/A',
                            rent: formatCurrency(data.lease.monthlyRent),
                            image: data.property.primaryImage || defaultHomeData.property.image,
                            verified: data.property.isVerified || false,
                        },
                        payment: {
                            nextAmount: formatCurrency(data.lease.monthlyRent),
                            dueDate: formatDate(data.lease.endDate).split(',')[0],
                            autoPayEnabled: false,
                        },
                        lease: {
                            startDate: formatDate(data.lease.startDate),
                            endDate: formatDate(data.lease.endDate),
                            term: `${months} Months`,
                            hasRenewalOffer: false,
                            renewalExpiresDate: '',
                        },
                        maintenance: defaultHomeData.maintenance,
                        documents: defaultHomeData.documents,
                        manager: {
                            name: data.landlord.name,
                            company: 'Property Management',
                            phone: data.landlord.phone || 'N/A',
                            email: 'contact@property.com',
                            image: data.landlord.avatarUrl || defaultHomeData.manager.image,
                            online: true,
                        },
                    });
                }
            } catch (err) {
                console.error('Failed to fetch rental info:', err);
                // Keep default data on error
            } finally {
                setIsLoading(false);
            }
        }

        fetchRentalInfo();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-8 border-3 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-slate-500">Loading your home...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden pb-[120px]">
            {/* Hero Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-slate-200 overflow-hidden group">
                <img
                    alt={homeData.property.name}
                    className="w-full h-full object-cover"
                    src={homeData.property.image}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/20"></div>
                <div className="absolute bottom-6 left-6 md:left-8 text-white z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 text-xs font-bold uppercase tracking-wider mb-2">
                        <span className="material-symbols-outlined text-[16px]">home</span> My Current Home
                    </div>
                </div>
                <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="absolute bottom-6 right-6 px-4 py-2 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-white dark:hover:bg-black/80 transition-colors shadow-sm text-slate-900 dark:text-white pointer-events-auto opacity-0 group-hover:opacity-100"
                >
                    <span className="material-symbols-outlined text-[18px]">grid_view</span>
                    View Gallery
                </button>
            </div>

            {/* Main Content */}
            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 -mt-8 relative z-10">
                {/* Property Info Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 mb-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
                                {homeData.property.name}
                            </h1>
                            <div className="flex items-center text-slate-600 dark:text-slate-400 mb-4">
                                <span className="material-symbols-outlined text-[20px] mr-1.5 text-slate-400">
                                    location_on
                                </span>
                                <p className="text-base">{homeData.property.location}</p>
                            </div>
                            <div className="flex flex-wrap gap-4">
                                <div className="grid grid-cols-3 gap-6 text-sm text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-700 pr-6 mr-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-slate-400">bed</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {homeData.property.beds}
                                        </span>{' '}
                                        Beds
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-slate-400">bathtub</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {homeData.property.baths}
                                        </span>{' '}
                                        Baths
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="material-symbols-outlined text-slate-400">square_foot</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {homeData.property.sqft}
                                        </span>{' '}
                                        Sqft
                                    </div>
                                </div>
                                {homeData.property.verified && (
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-green-500 icon-filled">
                                            verified_user
                                        </span>
                                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            Verified Property
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col md:items-end p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 w-full md:w-auto min-w-[200px]">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1">
                                Monthly Rent
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                                {homeData.property.rent}
                                <span className="text-lg text-slate-400 font-medium">/mo</span>
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="size-2 rounded-full bg-green-500"></span>
                                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                                    Lease Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Column */}
                    <div className="flex-1 min-w-0 space-y-8">
                        {/* Payments Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-[#137fec]">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Payments</h3>
                                </div>
                                <Link to="/tenant/payments" className="text-sm font-semibold text-[#137fec] hover:text-[#0e64bd]">
                                    View History
                                </Link>
                            </div>
                            <div className="p-6">
                                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between mb-6">
                                    <div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                                            Next Payment Due
                                        </p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                                {homeData.payment.nextAmount}
                                            </span>
                                            <span className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-md">
                                                Due {homeData.payment.dueDate}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="w-full sm:w-auto px-6 py-3 bg-[#137fec] hover:bg-[#0e64bd] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#137fec]/20 flex items-center justify-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">credit_card</span>
                                        Pay Rent
                                    </button>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-between border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <span className="material-symbols-outlined text-slate-500">autorenew</span>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">Auto-Pay</p>
                                            <p className="text-xs text-slate-500">Scheduled for the 1st of every month</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            defaultChecked={homeData.payment.autoPayEnabled}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-[#137fec]"></div>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Lease Details Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <Link to="/tenant/lease-details" className="flex items-center gap-3 group cursor-pointer">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">Lease Details</h3>
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors text-[18px]">chevron_right</span>
                                </Link>
                                <div className="flex items-center gap-3">
                                    <Link to="/tenant/lease-details" className="text-sm font-semibold text-[#137fec] hover:underline hidden sm:block">
                                        View Full Details
                                    </Link>
                                    <button className="text-sm font-semibold text-slate-500 hover:text-[#137fec] flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">download</span> PDF
                                    </button>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                                            Start Date
                                        </p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {homeData.lease.startDate}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                                            End Date
                                        </p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {homeData.lease.endDate}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">
                                            Term
                                        </p>
                                        <p className="font-semibold text-slate-900 dark:text-white">
                                            {homeData.lease.term}
                                        </p>
                                    </div>
                                </div>

                                {/* Renewal Offer */}
                                {homeData.lease.hasRenewalOffer && (
                                    <div className="mb-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="hidden sm:flex size-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center text-green-600 dark:text-green-400 shadow-sm shrink-0">
                                                <span className="material-symbols-outlined icon-filled">handshake</span>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                                        Renewal Offer from Landlord
                                                    </h4>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wide border border-green-200 dark:border-green-800">
                                                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                                        Offer Received
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-600 dark:text-slate-400">
                                                    A new lease proposal (12 Months) is ready for your review.{' '}
                                                    <span className="font-medium">
                                                        Expires {homeData.lease.renewalExpiresDate}
                                                    </span>
                                                    .
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsLeaseRenewalModalOpen(true)}
                                            className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            Respond to Offer
                                        </button>
                                    </div>
                                )}

                                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 flex items-start gap-3">
                                    <span className="material-symbols-outlined text-[#137fec] mt-0.5">info</span>
                                    <div>
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                            Renewal Options Available
                                        </h4>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                            You are eligible to renew your lease starting July 1, 2024. Ask the AI
                                            assistant for renewal terms.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Maintenance Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                                        <span className="material-symbols-outlined">handyman</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Maintenance</h3>
                                </div>
                                <button
                                    onClick={() => setIsMaintenanceModalOpen(true)}
                                    className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    New Request
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {homeData.maintenance.map((request) => (
                                    <Link
                                        key={request.id}
                                        to={`/tenant/maintenance/${request.id}`}
                                        className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between block"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`size-10 rounded-full ${request.iconColor} flex items-center justify-center shrink-0`}
                                            >
                                                <span
                                                    className={`material-symbols-outlined text-[20px] ${request.status === 'Resolved' ? 'icon-filled' : ''}`}
                                                >
                                                    {request.icon}
                                                </span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                                    {request.title}
                                                </h4>
                                                <p className="text-xs text-slate-500">
                                                    Request #{request.requestNumber} • Submitted {request.submittedDate}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`px-2.5 py-1 rounded-full ${request.statusColor} text-xs font-bold uppercase`}
                                        >
                                            {request.status}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                            <div className="p-3 text-center border-t border-slate-100 dark:border-slate-800">
                                <Link to="/tenant/maintenance" className="text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                                    View all requests
                                </Link>
                            </div>
                        </section>

                        {/* Documents Section */}
                        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined">folder</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Documents</h3>
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {homeData.documents.map((doc) => (
                                    <button
                                        key={doc.id}
                                        onClick={() => {
                                            setSelectedDocument({ name: doc.name, type: doc.type });
                                            setIsDocumentModalOpen(true);
                                        }}
                                        className="flex items-center p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec]/50 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-all group text-left"
                                    >
                                        <span className={`material-symbols-outlined ${doc.iconColor} text-3xl mr-3`}>
                                            {doc.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                                {doc.name}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                {doc.type} • {doc.size}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec]">
                                            open_in_new
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="w-full lg:w-[360px] shrink-0">
                        <div className="sticky top-24 space-y-6">
                            {/* Property Manager Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                                    Property Manager
                                </h4>
                                <Link to="/landlord-profile/1" className="flex items-center gap-4 mb-6 group cursor-pointer">
                                    <div className="relative">
                                        <img
                                            alt="Manager Profile"
                                            className="size-16 rounded-full object-cover border-2 border-slate-100 dark:border-slate-600 group-hover:border-[#137fec] transition-colors"
                                            src={homeData.manager.image}
                                        />
                                        {homeData.manager.online && (
                                            <span
                                                className="absolute bottom-0 right-0 size-4 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"
                                                title="Online"
                                            ></span>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">
                                            {homeData.manager.name}
                                        </h4>
                                        <p className="text-slate-500 text-sm">{homeData.manager.company}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400 group-hover:text-[#137fec] transition-colors ml-auto">chevron_right</span>
                                </Link>
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-[18px]">call</span>
                                        <span>{homeData.manager.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                        <span>{homeData.manager.email}</span>
                                    </div>
                                </div>
                                <Link to="/tenant/messages" className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                                    Message Manager
                                </Link>
                                <div className="text-center text-xs text-slate-400">
                                    Usually responds within 1 hour
                                </div>
                            </div>

                            {/* Property Insights Card */}
                            <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-slate-700 p-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="material-symbols-outlined text-[#137fec]">auto_awesome</span>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                        Property Insights
                                    </h4>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                                    Trash pickup is scheduled for tomorrow (Tuesday) morning. Don't forget to put your
                                    bins out tonight!
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Your lease renewal window opens in 3 months. Average rent in this neighborhood has
                                    increased by 4%.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating AI Bar */}
            <div className="fixed bottom-6 left-0 right-0 flex justify-center z-40 px-4 pointer-events-none">
                <div className="w-full max-w-2xl bg-white/95 dark:bg-[#101922]/95 backdrop-blur-xl border border-[#137fec]/20 shadow-2xl shadow-[#137fec]/10 rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto [box-shadow:0_0_15px_rgba(19,127,236,0.4)] transition-all hover:scale-[1.01]">
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                    </div>
                    <div className="flex-1 overflow-hidden h-10 flex items-center">
                        <input
                            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm h-full"
                            placeholder="Ask about lease renewal, repairs, or guest policies..."
                            type="text"
                        />
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0 text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined">mic</span>
                    </button>
                    <button className="size-10 rounded-full bg-[#137fec] hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-[#137fec]/30 text-white">
                        <span className="material-symbols-outlined">arrow_upward</span>
                    </button>
                </div>
            </div>

            {/* Make Payment Modal */}
            <MakePaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />

            {/* Lease Renewal Modal */}
            <LeaseRenewalModal
                isOpen={isLeaseRenewalModalOpen}
                onClose={() => setIsLeaseRenewalModalOpen(false)}
            />

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={isDocumentModalOpen}
                onClose={() => setIsDocumentModalOpen(false)}
                document={{
                    title: selectedDocument?.name || 'Document',
                    type: (selectedDocument?.type.toLowerCase() || 'pdf') as 'pdf' | 'doc' | 'image',
                    property: homeData.property.name,
                    modifiedTime: 'Recently',
                    totalPages: 12,
                }}
            />

            {/* Photo Gallery Modal */}
            <PhotoGalleryModal
                isOpen={isGalleryOpen}
                onClose={() => setIsGalleryOpen(false)}
                property={{
                    name: homeData.property.name,
                    address: homeData.property.location,
                }}
                images={[
                    homeData.property.image,
                    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800',
                    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800',
                ]}
            />

            {/* Maintenance Request Modal */}
            <MaintenanceRequestModal
                isOpen={isMaintenanceModalOpen}
                onClose={() => setIsMaintenanceModalOpen(false)}
            />
        </div>
    );
}
