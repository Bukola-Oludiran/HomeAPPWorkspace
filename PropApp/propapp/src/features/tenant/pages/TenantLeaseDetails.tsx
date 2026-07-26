import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MakePaymentModal from '../../../components/MakePaymentModal';
import DocumentViewerModal from '../../../components/DocumentViewerModal';
import { tenantService } from '../../../lib/api/services/tenantService';

// Helper to format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'CAD',
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

// Helper to calculate days until expiry
function calculateDaysUntilExpiry(endDate: string): number {
    const end = new Date(endDate);
    const today = new Date();
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// UI lease data structure
interface LeaseData {
    leaseId: string;
    status: string;
    property: {
        address: string;
        city: string;
        image: string;
    };
    monthlyRent: number;
    securityDeposit: number;
    startDate: string;
    endDate: string;
    term: string;
    daysUntilExpiry: number;
    paymentStatus: string;
    clauses: Array<{ id: number; title: string; icon: string; description: string }>;
    paymentSchedule: Array<{ id: number; date: string; description: string; amount: number; status: string }>;
    landlord: {
        name: string;
        initials: string;
        role: string;
        company: string;
        phone: string;
        email: string;
    };
    tenant: {
        name: string;
        email: string;
        phone: string;
        role: string;
    };
}

// Default lease data (fallback)
const defaultLeaseData: LeaseData = {
    leaseId: 'N/A',
    status: 'Unknown',
    property: {
        address: 'No Property',
        city: 'N/A',
        image: 'https://via.placeholder.com/800x600?text=No+Property',
    },
    monthlyRent: 0,
    securityDeposit: 0,
    startDate: 'N/A',
    endDate: 'N/A',
    term: 'N/A',
    daysUntilExpiry: 0,
    paymentStatus: 'Unknown',
    clauses: [
        { id: 1, title: 'Pet Policy Addendum', icon: 'pets', description: 'Policy details not available.' },
        { id: 2, title: 'Maintenance Responsibilities', icon: 'build', description: 'Details not available.' },
        { id: 3, title: 'No Smoking Clause', icon: 'smoking_rooms', description: 'Details not available.' },
    ],
    paymentSchedule: [],
    landlord: {
        name: 'Property Manager',
        initials: 'PM',
        role: 'Property Manager',
        company: 'Management Company',
        phone: 'N/A',
        email: 'N/A',
    },
    tenant: {
        name: 'Tenant',
        email: 'N/A',
        phone: 'N/A',
        role: 'Primary Tenant',
    },
};

export default function TenantLeaseDetails() {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);

    // API state
    const [leaseData, setLeaseData] = useState<LeaseData>(defaultLeaseData);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch rental/lease info from API
    useEffect(() => {
        async function fetchLeaseInfo() {
            try {
                setIsLoading(true);
                const response = await tenantService.getRentalInfo();
                const data = response.data;

                if (data) {
                    const startDate = new Date(data.lease.startDate);
                    const endDate = new Date(data.lease.endDate);
                    const months = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
                    const daysUntilExpiry = calculateDaysUntilExpiry(data.lease.endDate);

                    setLeaseData({
                        leaseId: data.lease.id,
                        status: data.lease.status,
                        property: {
                            address: data.property.name,
                            city: `${data.property.address?.city || ''}, ${data.property.address?.state || ''}`,
                            image: data.property.primaryImage || defaultLeaseData.property.image,
                        },
                        monthlyRent: data.lease.monthlyRent,
                        securityDeposit: data.lease.monthlyRent * 2, // Typically 2 months
                        startDate: formatDate(data.lease.startDate),
                        endDate: formatDate(data.lease.endDate),
                        term: months <= 12 ? '1 year' : `${Math.round(months / 12)} years`,
                        daysUntilExpiry,
                        paymentStatus: 'Paid',
                        clauses: defaultLeaseData.clauses,
                        paymentSchedule: defaultLeaseData.paymentSchedule.map(p => ({
                            ...p,
                            amount: data.lease.monthlyRent,
                        })),
                        landlord: {
                            name: data.landlord.name,
                            initials: data.landlord.name.split(' ').map(n => n[0]).join(''),
                            role: 'Property Manager',
                            company: 'Property Management',
                            phone: data.landlord.phone || 'N/A',
                            email: 'contact@property.com',
                        },
                        tenant: defaultLeaseData.tenant,
                    });
                }
            } catch (err) {
                console.error('Failed to fetch lease info:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchLeaseInfo();
    }, []);

    // Show loading state
    if (isLoading) {
        return (
            <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="size-8 border-3 border-[#137fec] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm text-slate-500">Loading lease details...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden pb-[140px]">
            {/* Hero Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-slate-200 overflow-hidden group">
                <img
                    alt={leaseData.property.address}
                    className="w-full h-full object-cover"
                    src={leaseData.property.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-4 md:left-8 text-white max-w-[1200px] w-full mx-auto px-4 md:px-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-green-500/90 text-white text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-sm">
                            Active Lease
                        </span>
                        <span className="text-white/80 text-sm font-medium">#{leaseData.leaseId}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">My Lease Agreement</h1>
                    <p className="text-white/90 font-medium">{leaseData.property.address}, {leaseData.property.city}</p>
                </div>
                {/* Download button on hero */}
                <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                    <button className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors text-slate-900 dark:text-white">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                {/* Stats Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Monthly Rent</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">${leaseData.monthlyRent.toLocaleString()}</span>
                            <span className="text-xs text-slate-500">/mo</span>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/20 w-fit px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span>
                            {leaseData.paymentStatus}
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Security Deposit</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">${leaseData.securityDeposit.toLocaleString()}</span>
                        <span className="text-xs text-slate-500">Held in escrow</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Lease Start</span>
                        <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{leaseData.startDate}</span>
                        <span className="text-xs text-slate-500">{leaseData.term} term</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Lease End</span>
                        <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{leaseData.endDate}</span>
                        <span className="text-xs text-orange-500 font-medium">Expiring soon</span>
                    </div>
                </section>

                {/* Main Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column */}
                    <div className="flex-1 space-y-8 min-w-0">
                        {/* Lease Document */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#137fec]">description</span>
                                    Lease Document
                                </h3>
                                <div className="flex gap-2">
                                    <button className="text-sm font-semibold text-[#137fec] hover:bg-blue-50 dark:hover:bg-[#137fec]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[18px]">download</span> Download
                                    </button>
                                    <button
                                        onClick={() => setIsDocumentModalOpen(true)}
                                        className="text-sm font-semibold text-white bg-[#137fec] hover:bg-[#0e64bd] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-[18px]">open_in_new</span> View Full
                                    </button>
                                </div>
                            </div>
                            <div
                                className="bg-slate-100 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center min-h-[300px] border-b border-slate-200 dark:border-slate-700 relative group cursor-pointer"
                                onClick={() => setIsDocumentModalOpen(true)}
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
                                    <span className="bg-white/90 dark:bg-black/80 backdrop-blur text-slate-900 dark:text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                                        Click to Preview
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Clauses & Addendums */}
                        <div>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Clauses &amp; Addendums</h3>
                            <div className="space-y-3">
                                {leaseData.clauses.map((clause) => (
                                    <div key={clause.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                                        <span className="material-symbols-outlined text-slate-400 mt-0.5">{clause.icon}</span>
                                        <div>
                                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">{clause.title}</h4>
                                            <p className="text-sm text-slate-500 mt-1">{clause.description}</p>
                                        </div>
                                        <button className="ml-auto text-[#137fec] text-sm font-semibold hover:underline">View</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment Schedule */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Payment Schedule</h3>
                                <Link to="/tenant/payments" className="text-sm text-[#137fec] font-semibold hover:underline">
                                    View Full Ledger
                                </Link>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
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
                                            {leaseData.paymentSchedule.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                    <td className="px-6 py-4 font-medium">{payment.date}</td>
                                                    <td className="px-6 py-4">{payment.description}</td>
                                                    <td className="px-6 py-4">${payment.amount.toLocaleString()}.00</td>
                                                    <td className="px-6 py-4 text-right">
                                                        {payment.status === 'Paid' ? (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                                                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                                                Paid
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
                                                                Upcoming
                                                            </span>
                                                        )}
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
                        {/* Landlord / Agent */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500">real_estate_agent</span>
                                Landlord / Agent
                            </h4>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                    {leaseData.landlord.initials}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{leaseData.landlord.name}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">{leaseData.landlord.role}</p>
                                </div>
                            </div>
                            <div className="space-y-3 text-sm">
                                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">business</span>
                                    <span>{leaseData.landlord.company}</span>
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">phone</span>
                                    <span>{leaseData.landlord.phone}</span>
                                </p>
                                <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[18px]">mail</span>
                                    <span>{leaseData.landlord.email}</span>
                                </p>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                <Link
                                    to="/tenant/messages"
                                    className="w-full py-2.5 rounded-lg bg-[#137fec] text-white font-semibold text-sm hover:bg-[#0e64bd] transition-colors shadow-sm flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                    Message
                                </Link>
                            </div>
                        </div>

                        {/* My Info */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#137fec]">person</span>
                                My Info
                            </h4>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="size-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden">
                                    <span className="material-symbols-outlined text-[28px]">face</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-base">{leaseData.tenant.name}</p>
                                    <p className="text-xs text-slate-500">{leaseData.tenant.role}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm border-t border-slate-100 dark:border-slate-700 pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Email</span>
                                    <span className="text-slate-900 dark:text-white font-medium">{leaseData.tenant.email}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Phone</span>
                                    <span className="text-slate-900 dark:text-white font-medium">{leaseData.tenant.phone}</span>
                                </div>
                            </div>
                            <button className="mt-4 w-full py-2 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                Update Profile
                            </button>
                        </div>

                        {/* Renewal Insight */}
                        <div className="bg-gradient-to-br from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-blue-100 dark:border-slate-700 p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-8 rounded-full bg-[#137fec] flex items-center justify-center text-white shadow-lg shadow-[#137fec]/30">
                                    <span className="material-symbols-outlined text-[18px]">tips_and_updates</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Renewal Insight</h3>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                                Your lease expires in <strong className="text-slate-900 dark:text-white">{leaseData.daysUntilExpiry} days</strong>. You have a great payment history! Initiating renewal early often locks in better rates.
                            </p>
                            <button className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 font-semibold text-sm text-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                                Explore Renewal Options
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating AI Bar */}
            <div className="fixed bottom-[90px] left-0 right-0 flex justify-center z-30 px-4 pointer-events-none">
                <div className="w-full max-w-2xl bg-white/95 dark:bg-[#101922]/95 backdrop-blur-xl border border-[#137fec]/20 shadow-2xl shadow-[#137fec]/10 rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto hover:scale-[1.01] transition-transform" style={{ boxShadow: '0 0 15px rgba(19, 127, 236, 0.4)' }}>
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                    </div>
                    <div className="flex-1 overflow-hidden h-10 flex items-center">
                        <input
                            type="text"
                            className="w-full bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 text-sm h-full"
                            placeholder="Ask about repair responsibility or how to renew your lease..."
                        />
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">mic</span>
                    </button>
                    <button className="size-10 rounded-full bg-[#137fec] hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-[#137fec]/30">
                        <span className="material-symbols-outlined text-white">arrow_upward</span>
                    </button>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full z-20 bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-slate-800 p-4 md:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Lease Status</p>
                            <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="font-bold text-slate-900 dark:text-white">Active</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Next Payment</p>
                            <span className="font-bold text-slate-900 dark:text-white">Dec 1, 2024</span>
                        </div>
                    </div>
                    <div className="flex-1 md:flex-none flex gap-3 w-full md:w-auto overflow-x-auto">
                        <button className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">build</span>
                            Maintenance Request
                        </button>
                        <button className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white hover:border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">autorenew</span>
                            Initiate Renewal
                        </button>
                        <button
                            onClick={() => setIsPaymentModalOpen(true)}
                            className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-colors shadow-lg shadow-green-600/25 whitespace-nowrap flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">payments</span>
                            Pay Rent Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <MakePaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
            />
            <DocumentViewerModal
                isOpen={isDocumentModalOpen}
                onClose={() => setIsDocumentModalOpen(false)}
                document={{
                    title: 'Lease Agreement',
                    type: 'pdf',
                    property: leaseData.property.address,
                    modifiedTime: leaseData.startDate,
                    status: 'Signed',
                    totalPages: 14,
                }}
            />
        </div>
    );
}
