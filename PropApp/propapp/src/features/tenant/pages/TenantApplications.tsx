import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WithdrawApplicationModal from '../../../components/WithdrawApplicationModal';
import SignLeaseRenewalModal from '../../../components/SignLeaseRenewalModal';
import PageContainer from '../../../components/common/PageContainer';
import { AnimatedGroup } from '../../../components/animation';
import { tenantService } from '../../../lib/api/services/tenantService';
import type { RentalApplication, ApplicationStatus } from '../../../types/lease';

// Placeholder image
const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=300&fit=crop';

// UI application interface matching the component's expected structure
interface UIApplication {
    id: string;
    propertyName: string;
    location: string;
    image: string;
    beds: number | string;
    baths: number;
    sqft: string;
    price: string;
    status: string;
    statusColor: string;
    statusDotColor: string;
    statusIcon: string;
    statusIconColor: string;
    statusMessage: string;
    lastUpdated: string;
    primaryAction: { label: string; icon: string } | null;
    showWithdraw: boolean;
    isRejected?: boolean;
}

// Helper to format currency
function formatCurrency(amount: number, currency: string = 'NGN'): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

// Helper to format relative date
function formatRelativeDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    }
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

// Get status styling based on application status
function getStatusStyles(status: ApplicationStatus): {
    label: string;
    color: string;
    dotColor: string;
    icon: string;
    iconColor: string;
    message: string;
    primaryAction: { label: string; icon: string } | null;
    showWithdraw: boolean;
    isRejected: boolean;
} {
    switch (status) {
        case 'APPROVED':
            return {
                label: 'Approved',
                color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
                dotColor: 'bg-green-600',
                icon: 'check_circle',
                iconColor: 'text-green-500',
                message: 'Background check completed',
                primaryAction: { label: 'Proceed to Lease', icon: 'arrow_forward' },
                showWithdraw: false,
                isRejected: false,
            };
        case 'PENDING':
        case 'UNDER_REVIEW':
            return {
                label: status === 'PENDING' ? 'Pending Review' : 'Under Review',
                color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                dotColor: 'bg-blue-600 animate-pulse',
                icon: 'hourglass_top',
                iconColor: 'text-blue-500',
                message: 'Awaiting landlord decision',
                primaryAction: null,
                showWithdraw: true,
                isRejected: false,
            };
        case 'REJECTED':
            return {
                label: 'Rejected',
                color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                dotColor: 'bg-slate-500',
                icon: 'cancel',
                iconColor: 'text-slate-400',
                message: 'Application declined by landlord',
                primaryAction: null,
                showWithdraw: false,
                isRejected: true,
            };
        case 'WITHDRAWN':
            return {
                label: 'Withdrawn',
                color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                dotColor: 'bg-slate-500',
                icon: 'undo',
                iconColor: 'text-slate-400',
                message: 'Application withdrawn',
                primaryAction: null,
                showWithdraw: false,
                isRejected: false,
            };
        default:
            return {
                label: status,
                color: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                dotColor: 'bg-slate-500',
                icon: 'info',
                iconColor: 'text-slate-400',
                message: 'Processing',
                primaryAction: null,
                showWithdraw: false,
                isRejected: false,
            };
    }
}

// Transform API RentalApplication to UI format
function transformApplication(app: RentalApplication): UIApplication {
    const statusStyles = getStatusStyles(app.status);
    const property = app.property;

    return {
        id: app.id,
        propertyName: property?.name || 'Property',
        location: property ? `${property.address.city}, ${property.address.state}` : 'N/A',
        image: property?.primaryImage || PLACEHOLDER_IMAGE,
        beds: property?.bedrooms === 0 ? 'Studio' : (property?.bedrooms || 0),
        baths: property?.bathrooms || 0,
        sqft: property?.squareMeters?.toLocaleString() || 'N/A',
        price: property ? `${formatCurrency(property.price, property.currency)}/mo` : 'N/A',
        status: statusStyles.label,
        statusColor: statusStyles.color,
        statusDotColor: statusStyles.dotColor,
        statusIcon: statusStyles.icon,
        statusIconColor: statusStyles.iconColor,
        statusMessage: app.rejectionReason || statusStyles.message,
        lastUpdated: formatRelativeDate(app.updatedAt),
        primaryAction: statusStyles.primaryAction,
        showWithdraw: statusStyles.showWithdraw,
        isRejected: statusStyles.isRejected,
    };
}

type FilterTab = 'all' | 'pending' | 'approved';

export default function TenantApplications() {
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<{ id: string; propertyName: string } | null>(null);
    const [isSignLeaseModalOpen, setIsSignLeaseModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState<'date' | 'name' | 'status'>('date');
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [applicationsData, setApplicationsData] = useState<UIApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const sortDropdownRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // Fetch applications on mount
    useEffect(() => {
        async function fetchApplications() {
            try {
                setIsLoading(true);
                setError(null);
                const response = await tenantService.getApplications({ limit: 50 });
                const transformed = (response.data || []).map(transformApplication);
                setApplicationsData(transformed);
            } catch (err) {
                console.error('Failed to fetch applications:', err);
                setError('Failed to load applications');
            } finally {
                setIsLoading(false);
            }
        }

        fetchApplications();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
                setShowSortDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredApplications = applicationsData.filter((app) => {
        if (activeFilter === 'all') return true;
        if (activeFilter === 'pending') return app.status === 'Pending Review' || app.status === 'Under Review';
        if (activeFilter === 'approved') return app.status === 'Approved';
        return true;
    });

    // Loading state
    if (isLoading) {
        return (
            <PageContainer maxWidth="lg">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Applications Tracker
                    </h1>
                    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">Loading...</p>
                </div>
                <div className="flex flex-col gap-6">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 animate-pulse">
                            <div className="flex gap-6">
                                <div className="w-64 h-40 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                                <div className="flex-1">
                                    <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4 mb-4" />
                                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
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
            <PageContainer maxWidth="lg">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Applications Tracker
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
        <PageContainer maxWidth="lg">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Applications Tracker
                    </h1>
                    <p className="text-slate-800 dark:text-slate-400 mt-2 text-lg">
                        Manage and track the status of your rental applications.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Filter Tabs */}
                    <div className="flex bg-white dark:bg-[#101922] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${activeFilter === 'all'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setActiveFilter('pending')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === 'pending'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveFilter('approved')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeFilter === 'approved'
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            Approved
                        </button>
                    </div>
                    {/* Sort Dropdown */}
                    <div className="relative" ref={sortDropdownRef}>
                        <button
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101922] text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">sort</span>
                            Sort by: {sortBy === 'date' ? 'Date' : sortBy === 'name' ? 'Name' : 'Status'}
                        </button>
                        {showSortDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1">
                                {[{ id: 'date', label: 'Date' }, { id: 'name', label: 'Name' }, { id: 'status', label: 'Status' }].map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => {
                                            setSortBy(option.id as 'date' | 'name' | 'status');
                                            setShowSortDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${sortBy === option.id ? 'text-[#137fec] font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
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
                </div>
            </div>

            {/* Applications List */}
            <AnimatedGroup className="flex flex-col gap-6" stagger={0.08}>
                {filteredApplications.map((app) => (
                    <div
                        key={app.id}
                        className={`bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 flex flex-col md:flex-row gap-6 hover:border-[#137fec]/30 transition-all duration-300 ${app.isRejected ? 'opacity-80 hover:opacity-100' : ''
                            }`}
                    >
                        {/* Property Image */}
                        <div className={`w-full md:w-64 h-48 md:h-auto shrink-0 relative rounded-xl overflow-hidden group ${app.isRejected ? 'grayscale hover:grayscale-0 transition-all' : ''}`}>
                            <img
                                alt={app.propertyName}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                src={app.image}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden"></div>
                        </div>

                        {/* Application Details */}
                        <div className="flex-1 flex flex-col justify-between">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                            {app.propertyName}
                                        </h3>
                                        <span className={`hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${app.statusColor}`}>
                                            <span className={`size-1.5 rounded-full ${app.statusDotColor} mr-1.5`}></span>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                                        {app.location}
                                    </p>
                                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-700 dark:text-slate-300">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">bed</span>
                                            {app.beds} {typeof app.beds === 'number' ? 'Beds' : ''}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">bathtub</span>
                                            {app.baths} Baths
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[18px] text-slate-400">square_foot</span>
                                            {app.sqft} sqft
                                        </span>
                                        <span className="font-bold text-[#137fec] ml-2">{app.price}</span>
                                    </div>
                                </div>
                                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2">
                                    <span className={`md:hidden inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${app.statusColor}`}>
                                        {app.status}
                                    </span>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Last Updated</p>
                                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{app.lastUpdated}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 w-full md:w-auto">
                                    <span className={`material-symbols-outlined ${app.statusIconColor}`}>{app.statusIcon}</span>
                                    {app.statusMessage}
                                </div>
                                <div className="flex gap-3 w-full md:w-auto">
                                    {app.showWithdraw && (
                                        <button
                                            onClick={() => {
                                                setSelectedApp({ id: app.id, propertyName: app.propertyName });
                                                setIsWithdrawModalOpen(true);
                                            }}
                                            className="flex-1 md:flex-none px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                        >
                                            Withdraw Application
                                        </button>
                                    )}
                                    <Link
                                        to={`/tenant/applications/${app.id}`}
                                        className="flex-1 md:flex-none px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
                                    >
                                        View Details
                                    </Link>
                                    {app.primaryAction && (
                                        <button
                                            onClick={() => {
                                                if (app.primaryAction?.label === 'Proceed to Lease') {
                                                    navigate('/tenant/lease-details');
                                                } else if (app.primaryAction?.label === 'Sign Lease') {
                                                    setIsSignLeaseModalOpen(true);
                                                }
                                            }}
                                            className="flex-1 md:flex-none px-5 py-2 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            {app.primaryAction.label}
                                            <span className="material-symbols-outlined text-[18px]">{app.primaryAction.icon}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </AnimatedGroup>

            {/* Load More Button */}
            <div className="flex justify-center mt-12">
                <button className="px-6 py-3 rounded-xl bg-white dark:bg-[#101922] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-sm shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                    Load More Applications
                    <span className="material-symbols-outlined">expand_more</span>
                </button>
            </div>

            {/* Withdraw Application Modal */}
            <WithdrawApplicationModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                propertyName={selectedApp?.propertyName}
            />

            {/* Sign Lease Renewal Modal */}
            <SignLeaseRenewalModal
                isOpen={isSignLeaseModalOpen}
                onClose={() => setIsSignLeaseModalOpen(false)}
            />
        </PageContainer>
    );
}
