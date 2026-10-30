import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import DocumentViewerModal from '../../../components/DocumentViewerModal';
import DraftRenewalOfferModal from '../../../components/DraftRenewalOfferModal';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { leaseService } from '../../../lib/api/services/leaseService';
import type { Lease } from '../../../types/lease';
import { formatCurrency } from '@/lib/format';

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getLeaseStatusColor(status: string): string {
    switch (status) {
        case 'ACTIVE': return 'bg-green-500/90';
        case 'PENDING': return 'bg-amber-500/90';
        case 'EXPIRED': return 'bg-red-500/90';
        case 'TERMINATED': return 'bg-red-500/90';
        case 'RENEWED': return 'bg-blue-500/90';
        default: return 'bg-slate-500/90';
    }
}

// Static data (no API backing for these)
const payments = [
    { id: 1, date: 'Dec 1, 2024', description: 'Monthly Rent', amount: '$4,800.00', status: 'Upcoming', statusColor: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
    { id: 2, date: 'Nov 1, 2024', description: 'Monthly Rent', amount: '$4,800.00', status: 'Paid', statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: 'check_circle' },
    { id: 3, date: 'Oct 1, 2024', description: 'Monthly Rent', amount: '$4,800.00', status: 'Paid', statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: 'check_circle' },
];

const clauses = [
    { id: 1, icon: 'pets', title: 'Pet Policy Addendum', description: 'Permits 1 dog under 40lbs. Non-refundable fee of $250 applied.' },
    { id: 2, icon: 'build', title: 'Maintenance Responsibilities', description: 'Tenant responsible for lawn care and minor repairs under $50.' },
    { id: 3, icon: 'smoking_rooms', title: 'No Smoking Clause', description: 'Strict no-smoking policy within the premises and 20ft perimeter.' },
];

export default function LandlordLeaseAgreement() {
    const { id } = useParams();
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
    const [isVacateModalOpen, setIsVacateModalOpen] = useState(false);
    const [lease, setLease] = useState<Lease | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchLease() {
            if (!id) return;
            try {
                setIsLoading(true);
                const response = await leaseService.getLeaseById(id);
                setLease(response.data);
            } catch (err) {
                console.error('Failed to fetch lease:', err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchLease();
    }, [id]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium">Loading lease agreement...</p>
                </div>
            </div>
        );
    }

    if (!lease) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <span className="material-symbols-outlined text-5xl text-slate-300">error</span>
                <p className="text-slate-500 font-medium">Lease not found</p>
                <Link to="/landlord/dashboard" className="text-brand-ink font-bold hover:underline">Back to Dashboard</Link>
            </div>
        );
    }

    const propertyName = lease.property?.name || 'Property';
    const propertyAddress = lease.property ? `${lease.property.address?.city || ''}, ${lease.property.address?.state || ''}`.trim() : '';
    const tenantName = lease.tenant ? `${lease.tenant.firstName} ${lease.tenant.lastName}` : 'Tenant';
    const tenantInitials = tenantName.split(' ').map(n => n[0]).join('').toUpperCase();
    const landlordName = lease.landlord ? `${lease.landlord.firstName} ${lease.landlord.lastName}` : 'Landlord';
    const landlordInitials = landlordName.split(' ').map(n => n[0]).join('').toUpperCase();
    const daysRemaining = Math.max(0, Math.ceil((new Date(lease.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
    const leaseStartFormatted = formatDate(lease.startDate);
    const leaseEndFormatted = formatDate(lease.endDate);
    const statusLabel = lease.status.charAt(0) + lease.status.slice(1).toLowerCase();

    return (
        <div className="bg-canvas dark:bg-canvas-dark min-h-screen flex flex-col text-slate-900 dark:text-white overflow-x-hidden pb-[140px]">
            {/* Hero Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-slate-200 overflow-hidden">
                <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                    <button className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors text-slate-900 dark:text-white">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                </div>
                {lease.property?.primaryImage ? (
                    <img
                        alt={propertyName}
                        className="w-full h-full object-cover"
                        src={lease.property.primaryImage}
                    />
                ) : (
                    <div className="w-full h-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center">
                        <span className="material-symbols-outlined text-6xl text-slate-400">apartment</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-4 md:left-8 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 ${getLeaseStatusColor(lease.status)} text-white text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-sm`}>
                            {statusLabel} Lease
                        </span>
                        <span className="text-white/80 text-sm font-medium">#{lease.id.slice(0, 12).toUpperCase()}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">Lease Agreement</h1>
                    <p className="text-white/90 font-medium">{propertyName}, {propertyAddress}</p>
                </div>
            </div>

            {/* Main Content */}
            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                {/* Stats Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Monthly Rent</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(lease.monthlyRent)}</span>
                            <span className="text-xs text-slate-500">/mo</span>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/20 w-fit px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span> Paid
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Security Deposit</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(lease.securityDeposit)}</span>
                        <span className="text-xs text-slate-500">Held in escrow</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Lease Start</span>
                        <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{leaseStartFormatted}</span>
                        <span className="text-xs text-slate-500">{lease.status === 'ACTIVE' ? 'Active' : statusLabel}</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Lease End</span>
                        <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{leaseEndFormatted}</span>
                        <span className={`text-xs font-medium ${daysRemaining <= 60 ? 'text-orange-500' : 'text-slate-500'}`}>{daysRemaining <= 60 ? 'Expiring soon' : `${daysRemaining} days remaining`}</span>
                    </div>
                </section>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Main Content */}
                    <div className="flex-1 space-y-8 min-w-0">
                        {/* Lease Document */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-ink">description</span>
                                    Lease Document
                                </h3>
                                <div className="flex gap-2">
                                    <button className="text-sm font-semibold text-brand-ink hover:bg-blue-50 dark:hover:bg-brand/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">download</span> Download
                                    </button>
                                    <button
                                        onClick={() => setIsDocumentModalOpen(true)}
                                        className="text-sm font-semibold text-on-brand bg-brand-ink hover:bg-[#0e64bd] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span> View Full
                                    </button>
                                </div>
                            </div>
                            <div
                                onClick={() => setIsDocumentModalOpen(true)}
                                className="bg-slate-100 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center min-h-[300px] border-b border-slate-200 dark:border-slate-700 relative group cursor-pointer"
                            >
                                <div className="w-full max-w-2xl bg-white dark:bg-slate-800 shadow-lg rounded-sm p-8 md:p-12 relative transition-transform group-hover:scale-[1.01]">
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-lg flex items-center justify-center mb-6">
                                        <span className="material-symbols-outlined text-[32px]">picture_as_pdf</span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                                    </div>
                                    <div className="absolute top-0 right-0 p-4">
                                        <div className="px-2 py-1 border-2 border-green-600 text-green-600 text-xs font-bold uppercase rounded opacity-50 -rotate-12">Signed</div>
                                    </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="bg-white/90 dark:bg-black/80 backdrop-blur text-slate-900 dark:text-white px-4 py-2 rounded-lg font-bold shadow-lg">Click to Preview</span>
                                </div>
                            </div>
                        </div>

                        {/* Clauses & Addendums */}
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Clauses & Addendums</h3>
                            <div className="space-y-3">
                                {clauses.map((clause) => (
                                    <div key={clause.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                                        <span className="material-symbols-outlined text-slate-400 mt-0.5">{clause.icon}</span>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{clause.title}</h4>
                                            <p className="text-sm text-slate-500 mt-1">{clause.description}</p>
                                        </div>
                                        <button className="ml-auto text-brand-ink text-sm font-semibold hover:underline">View</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Schedule */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Payment Schedule</h3>
                                <button className="text-sm text-brand-ink font-semibold hover:underline">View Full Ledger</button>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-700">
                                            <tr>
                                                <th className="px-6 py-3 whitespace-nowrap">Due Date</th>
                                                <th className="px-6 py-3 whitespace-nowrap">Description</th>
                                                <th className="px-6 py-3 whitespace-nowrap">Amount</th>
                                                <th className="px-6 py-3 text-right whitespace-nowrap">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700 dark:text-slate-300">
                                            {payments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium">{payment.date}</td>
                                                    <td className="px-6 py-4">{payment.description}</td>
                                                    <td className="px-6 py-4">{payment.amount}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${payment.statusColor}`}>
                                                            {payment.icon && <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>{payment.icon}</span>}
                                                            {payment.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-[360px] shrink-0 space-y-6">
                        {/* Tenant Information */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-brand-ink">group</span> Tenant Information
                            </h4>
                            <Link to={`/landlord/tenants/${lease.tenantId}/profile`} className="flex items-center gap-4 mb-6 group cursor-pointer">
                                <div className="size-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden group-hover:ring-2 group-hover:ring-brand transition-all font-bold text-lg">
                                    {tenantInitials}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-brand-ink transition-colors">{tenantName}</p>
                                    <p className="text-sm text-slate-500">Tenant</p>
                                </div>
                            </Link>
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                <button className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Message</button>
                                <Link to={`/landlord/tenants/${lease.tenantId}/profile`} className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center">View Profile</Link>
                            </div>
                        </div>

                        {/* Landlord / Agent */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500">real_estate_agent</span> Landlord / Agent
                            </h4>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                    {landlordInitials}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{landlordName}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">Landlord</p>
                                </div>
                            </div>
                        </div>

                        {/* Renewal Insight */}
                        <div className="bg-blue-50/50 dark:bg-slate-800 rounded-2xl border border-blue-100 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-8 rounded-full bg-brand-ink flex items-center justify-center text-on-brand">
                                    <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Renewal Insight</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                This lease expires in <strong className="text-slate-900 dark:text-white">{daysRemaining} days</strong>. Based on payment history and market rates, consider offering a renewal to {tenantName}.
                            </p>
                            <button
                                onClick={() => setIsRenewalModalOpen(true)}
                                className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 font-semibold text-sm text-brand-ink hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                Draft Renewal Offer
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full z-20 bg-white dark:bg-canvas-dark border-t border-slate-200 dark:border-slate-800 p-4 md:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Lease Status</p>
                            <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="font-bold text-slate-900 dark:text-white">{statusLabel}</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Days Remaining</p>
                            <span className="font-bold text-slate-900 dark:text-white">{daysRemaining} Days</span>
                        </div>
                    </div>
                    <div className="flex-1 md:flex-none flex gap-3 w-full md:w-auto overflow-x-auto">
                        <Link
                            to={`/landlord/leases/${id}/edit`}
                            className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">edit_document</span>
                            Edit Terms
                        </Link>
                        <button
                            onClick={() => setIsVacateModalOpen(true)}
                            className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-red-600 hover:border-red-100 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">block</span>
                            Notice to Vacate
                        </button>
                        <button
                            onClick={() => setIsRenewalModalOpen(true)}
                            className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-brand-ink text-on-brand font-bold hover:bg-[#0e64bd] transition-colors whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">send</span>
                            Send Renewal Offer
                        </button>
                    </div>
                </div>
            </div>

            {/* Document Viewer Modal */}
            <DocumentViewerModal
                isOpen={isDocumentModalOpen}
                onClose={() => setIsDocumentModalOpen(false)}
                document={{
                    title: 'Lease Agreement',
                    type: 'pdf',
                    property: propertyName,
                    modifiedTime: leaseStartFormatted,
                    status: lease.signedByLandlord && lease.signedByTenant ? 'Signed' : 'Pending',
                    totalPages: 14,
                }}
            />

            {/* Draft Renewal Offer Modal */}
            <DraftRenewalOfferModal
                isOpen={isRenewalModalOpen}
                onClose={() => setIsRenewalModalOpen(false)}
                propertyAddress={`${propertyName}, ${propertyAddress}`}
                leaseId={`#${lease.id.slice(0, 12).toUpperCase()}`}
                currentRent={formatCurrency(lease.monthlyRent)}
                expiryDate={leaseEndFormatted}
            />

            {/* Notice to Vacate Confirmation Modal */}
            <ConfirmationModal
                isOpen={isVacateModalOpen}
                onClose={() => setIsVacateModalOpen(false)}
                onConfirm={() => console.log('Notice to vacate sent')}
                title="Send Notice to Vacate?"
                description="This will notify the tenant that they must vacate the property. This action cannot be undone and may have legal implications."
                confirmText="Send Notice"
                cancelText="Cancel"
                icon="block"
                variant="danger"
            />
        </div>
    );
}
