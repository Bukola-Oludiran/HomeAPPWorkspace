import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NewApplicantModal from '../../../components/NewApplicantModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import SearchInput from '../../../components/common/SearchInput';
import { AnimatedGroup } from '../../../components/animation';
import { landlordService } from '../../../lib/api/services/landlordService';
import type { RentalApplication } from '../../../types/lease';
import { formatCurrency } from '@/lib/format';

// UI applicant type
interface UIApplicant {
    id: string;
    name: string;
    initials: string;
    property: string;
    status: string;
    statusColor: string;
    barColor: string;
    avatarColor: string;
    image?: string;
    creditScore?: number;
    creditIcon?: string;
    creditIconColor?: string;
    monthlyIncome?: string;
    employment?: string;
    hasBackgroundCheck?: boolean;
    backgroundResult?: string;
    moveInDate?: string;
    rejectionReason?: string;
    missingDocs?: string;
    rentCoverage?: string;
    pet?: string;
    actions: string[];
}

// Helper to format currency
// Get initials from name
function getInitials(firstName?: string | null, lastName?: string | null): string {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || 'NA';
}

// Get status styling
function getStatusStyle(status: string): { statusColor: string; barColor: string } {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending' || statusLower === 'submitted') {
        return {
            statusColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 border-blue-100 dark:border-blue-800',
            barColor: 'bg-blue-500',
        };
    }
    if (statusLower === 'under_review' || statusLower === 'under review') {
        return {
            statusColor: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 border-amber-100 dark:border-amber-800',
            barColor: 'bg-amber-500',
        };
    }
    if (statusLower === 'approved') {
        return {
            statusColor: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300 border-green-100 dark:border-green-800',
            barColor: 'bg-green-500',
        };
    }
    if (statusLower === 'rejected') {
        return {
            statusColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
            barColor: 'bg-slate-300 dark:bg-slate-600',
        };
    }
    return {
        statusColor: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        barColor: 'bg-slate-300',
    };
}

// Get actions based on status
function getActions(status: string): string[] {
    const statusLower = status.toLowerCase();
    if (statusLower === 'pending' || statusLower === 'submitted') {
        return ['review', 'background-check'];
    }
    if (statusLower === 'under_review' || statusLower === 'under review') {
        return ['approve', 'reject', 'view-profile'];
    }
    if (statusLower === 'approved') {
        return ['view-lease'];
    }
    if (statusLower === 'rejected') {
        return ['reopen'];
    }
    return ['review'];
}

// Map API status to display status
function mapStatus(status: string): string {
    const statusMap: Record<string, string> = {
        'SUBMITTED': 'Pending',
        'PENDING': 'Pending',
        'UNDER_REVIEW': 'Under Review',
        'APPROVED': 'Approved',
        'REJECTED': 'Rejected',
    };
    return statusMap[status.toUpperCase()] || status;
}

// Transform API application to UI format
function transformApplicant(app: RentalApplication): UIApplicant {
    const name = app.tenant ? `${app.tenant.firstName} ${app.tenant.lastName}` : 'Unknown Applicant';
    const displayStatus = mapStatus(app.status);
    const style = getStatusStyle(displayStatus);

    return {
        id: app.id,
        name,
        initials: getInitials(app.tenant?.firstName, app.tenant?.lastName),
        property: app.property?.name || 'Unknown Property',
        status: displayStatus,
        ...style,
        avatarColor: 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300',
        image: app.tenant?.avatarUrl || undefined,
        monthlyIncome: formatCurrency(app.monthlyIncome),
        employment: app.employmentStatus,
        moveInDate: app.moveInDate ? new Date(app.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined,
        rejectionReason: app.rejectionReason,
        actions: getActions(displayStatus),
    };
}

type FilterType = 'all' | 'pending' | 'under-review' | 'approved' | 'rejected';

export default function ApplicantManager() {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isNewApplicantModalOpen, setIsNewApplicantModalOpen] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
    const [propertyFilter, setPropertyFilter] = useState('all');
    const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
    const propertyDropdownRef = useRef<HTMLDivElement>(null);

    // API state
    const [applicants, setApplicants] = useState<UIApplicant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch applicants from API
    useEffect(() => {
        async function fetchApplicants() {
            try {
                setIsLoading(true);
                setError(null);

                const response = await landlordService.getApplicants();
                const data = response.data || [];
                setApplicants(data.map(transformApplicant));
            } catch (err) {
                console.error('Failed to fetch applicants:', err);
                setError('Failed to load applicants. Please try again.');
            } finally {
                setIsLoading(false);
            }
        }

        fetchApplicants();
    }, []);

    // Get unique properties from applicants
    const uniqueProperties = ['all', ...Array.from(new Set(applicants.map(a => a.property)))];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (propertyDropdownRef.current && !propertyDropdownRef.current.contains(event.target as Node)) {
                setShowPropertyDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filters: { key: FilterType; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: applicants.length },
        { key: 'pending', label: 'Pending', count: applicants.filter(a => a.status === 'Pending').length },
        { key: 'under-review', label: 'Under Review', count: applicants.filter(a => a.status === 'Under Review').length },
        { key: 'approved', label: 'Approved', count: applicants.filter(a => a.status === 'Approved').length },
        { key: 'rejected', label: 'Rejected', count: applicants.filter(a => a.status === 'Rejected').length },
    ];

    // Filter applicants based on active filter and search
    const filteredApplicants = applicants.filter((applicant: UIApplicant) => {
        // Property filter
        if (propertyFilter !== 'all') {
            if (applicant.property !== propertyFilter) return false;
        }
        // Status filter
        if (activeFilter !== 'all') {
            const statusMap: Record<FilterType, string> = {
                'all': '',
                'pending': 'Pending',
                'under-review': 'Under Review',
                'approved': 'Approved',
                'rejected': 'Rejected',
            };
            if (applicant.status !== statusMap[activeFilter]) return false;
        }
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (applicant.name ?? "").toLowerCase().includes(query) ||
                (applicant.property ?? "").toLowerCase().includes(query);
        }
        return true;
    });

    return (
        <PageContainer>
            <ConfirmationModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={() => console.log(`Applicant ${selectedApplicant} rejected`)}
                title="Reject Application?"
                description={`Are you sure you want to reject this application? They will be notified and removed from consideration.`}
                confirmText="Reject Application"
                icon="block"
            />
            <PageHeader
                title="Applicant Manager"
                subtitle="Review applications, verify backgrounds, and select your next tenant."
                actions={
                    <>
                        <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">share</span> Invite Applicant
                        </button>
                        <button
                            onClick={() => setIsNewApplicantModalOpen(true)}
                            className="px-5 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span> New Application
                        </button>
                    </>
                }
            />

            {/* Filters Bar */}
            <div className="bg-white dark:bg-canvas-dark p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mb-8 flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4 items-center">
                    {/* Property Selector */}
                    <div className="relative w-full sm:w-64">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 dark:text-slate-400 text-[20px]">
                            apartment
                        </span>
                        <select className="w-full pl-10 pr-8 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-brand focus:border-brand text-slate-900 dark:text-white cursor-pointer appearance-none">
                            <option>All Properties</option>
                            <option>5500 Highland Park</option>
                            <option>1243 Oakwood Avenue</option>
                            <option>Downtown Loft</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-500 dark:text-slate-400 text-[20px] pointer-events-none">
                            expand_more
                        </span>
                    </div>

                    {/* Status Tabs */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
                        {filters.map((filter) => (
                            <button
                                key={filter.key}
                                onClick={() => setActiveFilter(filter.key)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === filter.key
                                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {filter.label} ({filter.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search */}
                <div className="w-full lg:w-auto flex gap-3">
                    <SearchInput
                        placeholder="Search applicant..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        className="flex-1 lg:w-64"
                    />
                    <div className="relative" ref={propertyDropdownRef}>
                        <button
                            onClick={() => setShowPropertyDropdown(!showPropertyDropdown)}
                            className={`p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 hover:border-brand hover:text-brand-ink transition-colors ${propertyFilter !== 'all' ? 'border-brand text-brand-ink' : ''}`}
                        >
                            <span className="material-symbols-outlined">tune</span>
                            {propertyFilter !== 'all' && (
                                <span className="absolute -top-1 -right-1 size-3 bg-brand rounded-full"></span>
                            )}
                        </button>
                        {showPropertyDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700 shadow-xl z-50 py-1">
                                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Filter by Property</p>
                                </div>
                                {uniqueProperties.map((property) => (
                                    <button
                                        key={property}
                                        onClick={() => {
                                            setPropertyFilter(property);
                                            setShowPropertyDropdown(false);
                                        }}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${propertyFilter === property ? 'text-brand-ink font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}
                                    >
                                        {property === 'all' ? 'All Properties' : property}
                                        {propertyFilter === property && (
                                            <span className="material-symbols-outlined text-[16px] ml-auto">check</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isLoading && (
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Loading applicants…</p>
            )}
            {error && (
                <div role="alert" className="mb-6 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300">
                    {error}
                </div>
            )}

            {/* Applicant Cards Grid */}
            <AnimatedGroup className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" stagger={0.08}>
                {filteredApplicants.map((applicant) => (
                    <div
                        key={applicant.id}
                        className={`bg-white dark:bg-canvas-dark rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow flex flex-col relative overflow-hidden group ${applicant.status === 'Rejected' ? 'opacity-90 hover:opacity-100' : ''
                            }`}
                    >
                        {/* Status bar */}
                        <div className={`absolute top-0 left-0 w-1 h-full ${applicant.barColor}`}></div>

                        <div className="p-6 pb-4">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-4 pl-2">
                                <div className="flex items-center gap-3">
                                    {applicant.image ? (
                                        <div className="size-12 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800">
                                            <img
                                                alt={applicant.name}
                                                src={applicant.image}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div
                                            className={`size-12 rounded-full ${applicant.avatarColor} flex items-center justify-center text-lg font-bold`}
                                        >
                                            {applicant.initials}
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                                            {applicant.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">home</span>
                                            {applicant.property}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${applicant.statusColor}`}
                                >
                                    {applicant.status}
                                </span>
                            </div>

                            {/* Content based on status */}
                            {applicant.status === 'Rejected' ? (
                                <div className="pl-2 mb-6">
                                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                        <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1 flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">info</span>
                                            Reason for rejection
                                        </p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300">
                                            {applicant.rejectionReason}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 mb-6 pl-2">
                                    {/* Credit Score */}
                                    {applicant.creditScore && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
                                                Credit Score
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`material-symbols-outlined ${applicant.creditIconColor} text-[20px]`}
                                                >
                                                    {applicant.creditIcon}
                                                </span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {applicant.creditScore}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Monthly Income or Move-in Date or Rent Coverage */}
                                    {applicant.monthlyIncome && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
                                                Monthly Inc.
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blue-500 text-[20px]">
                                                    payments
                                                </span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {applicant.monthlyIncome}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {applicant.moveInDate && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
                                                Move-in Date
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                                                    calendar_month
                                                </span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {applicant.moveInDate}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {applicant.rentCoverage && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                            <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
                                                Rent Coverage
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-blue-500 text-[20px]">
                                                    pie_chart
                                                </span>
                                                <span className="font-bold text-slate-900 dark:text-white">
                                                    {applicant.rentCoverage}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Employment or Background Check or Missing Docs or Pet */}
                                    {applicant.employment && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 col-span-2">
                                            <p className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400 mb-1">
                                                Employment
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">
                                                    work
                                                </span>
                                                <span className="font-semibold text-slate-700 dark:text-slate-200 text-sm">
                                                    {applicant.employment}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {applicant.hasBackgroundCheck && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 col-span-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-green-500 text-[16px]">
                                                    verified
                                                </span>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    Background Check Completed
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{applicant.backgroundResult}</p>
                                        </div>
                                    )}

                                    {applicant.missingDocs && (
                                        <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/20 col-span-2">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-orange-500 text-[18px]">
                                                    warning
                                                </span>
                                                <span className="text-xs font-semibold text-orange-800 dark:text-orange-200">
                                                    {applicant.missingDocs}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {applicant.pet && (
                                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 col-span-2">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px]">
                                                    pets
                                                </span>
                                                <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                    {applicant.pet}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-auto p-4 pt-0 pl-8 pr-6 pb-6 flex flex-col gap-3">
                            {applicant.actions.includes('review') && (
                                <Link
                                    to={`/landlord/tenants/${applicant.id}`}
                                    className="w-full py-2.5 bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    Review Application
                                </Link>
                            )}
                            {applicant.actions.includes('background-check') && (
                                <div className="flex gap-3">
                                    <button className="flex-1 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-lg transition-colors">
                                        Run Background Check
                                    </button>
                                </div>
                            )}
                            {applicant.actions.includes('approve') && applicant.actions.includes('reject') && (
                                <>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button className="py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2">
                                            <span className="material-symbols-outlined text-[18px]">check</span> Approve
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedApplicant(applicant.name);
                                                setShowRejectModal(true);
                                            }}
                                            className="py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">close</span> Reject
                                        </button>
                                    </div>
                                    <Link
                                        to={`/landlord/tenants/${applicant.id}/profile`}
                                        className="w-full py-2 bg-transparent text-slate-500 dark:text-slate-400 hover:text-brand-ink font-semibold text-xs rounded-lg transition-colors"
                                    >
                                        View Full Profile
                                    </Link>
                                </>
                            )}
                            {applicant.actions.includes('view-lease') && (
                                <Link
                                    to="/landlord/leases/1"
                                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-sm rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">description</span> View Lease Agreement
                                </Link>
                            )}
                            {applicant.actions.includes('reopen') && (
                                <button className="w-full py-2 bg-transparent text-slate-500 dark:text-slate-500 hover:text-slate-600 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2">
                                    Re-open Application
                                </button>
                            )}
                            {applicant.actions.includes('request-docs') && (
                                <button className="w-full py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-brand hover:text-brand-ink font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2">
                                    Request Documents
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </AnimatedGroup>

            {/* Floating AI Bar */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                <label className="cursor-pointer group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300">
                    <div className="size-10 rounded-full bg-brand-ink flex items-center justify-center text-on-brand shadow-md">
                        <span className="material-symbols-outlined">forum</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">Ask Keystead...</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                            Click to chat
                        </span>
                    </div>
                </label>
            </div>

            {/* New Applicant Modal */}
            <NewApplicantModal
                isOpen={isNewApplicantModalOpen}
                onClose={() => setIsNewApplicantModalOpen(false)}
            />
        </PageContainer>
    );
}
