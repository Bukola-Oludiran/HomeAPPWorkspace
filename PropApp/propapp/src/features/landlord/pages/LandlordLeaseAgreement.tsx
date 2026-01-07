import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DocumentViewerModal from '../../../components/DocumentViewerModal';
import DraftRenewalOfferModal from '../../../components/DraftRenewalOfferModal';

// Mock lease data
const leaseData = {
    id: 'L-2023-8492',
    status: 'Active',
    property: {
        name: '1243 Oakwood Avenue',
        address: 'Austin, TX 78704',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
    },
    monthlyRent: '$4,800',
    securityDeposit: '$9,600',
    leaseStart: 'Dec 1, 2023',
    leaseEnd: 'Nov 30, 2024',
    term: '1 year term',
    daysRemaining: 45,
    tenant: {
        name: 'The Anderson Family',
        primary: 'Mark Anderson',
        email: 'mark.anderson@example.com',
        phone: '(512) 555-0123',
    },
    manager: {
        name: 'Sarah Jenkins',
        initials: 'SJ',
        role: 'Property Manager',
        agency: 'Oakwood Mgmt Group',
        phone: '(512) 555-9988',
        email: 'support@oakwood.com',
    },
    clauses: [
        { id: 1, icon: 'pets', title: 'Pet Policy Addendum', description: 'Permits 1 dog under 40lbs. Non-refundable fee of $250 applied.' },
        { id: 2, icon: 'build', title: 'Maintenance Responsibilities', description: 'Tenant responsible for lawn care and minor repairs under $50.' },
        { id: 3, icon: 'smoking_rooms', title: 'No Smoking Clause', description: 'Strict no-smoking policy within the premises and 20ft perimeter.' },
    ],
    payments: [
        { id: 1, date: 'Dec 1, 2024', description: 'Monthly Rent', amount: '$4,800.00', status: 'Upcoming', statusColor: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400' },
        { id: 2, date: 'Nov 1, 2024', description: 'Monthly Rent', amount: '$4,800.00', status: 'Paid', statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: 'check_circle' },
        { id: 3, date: 'Oct 1, 2024', description: 'Monthly Rent', amount: '$4,800.00', status: 'Paid', statusColor: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: 'check_circle' },
    ],
    renewalSuggestion: '$5,050',
};

export default function LandlordLeaseAgreement() {
    const { id } = useParams();
    const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
    const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);
    console.log('Lease ID:', id);

    return (
        <div className="bg-[#f6f7f8] dark:bg-[#101922] min-h-screen flex flex-col font-[Manrope,Noto_Sans,sans-serif] text-slate-900 dark:text-white overflow-x-hidden pb-[140px]">
            {/* Hero Image */}
            <div className="relative w-full h-[50vh] md:h-[60vh] lg:h-[70vh] bg-slate-200 overflow-hidden">
                <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
                    <button className="flex items-center justify-center size-10 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full shadow-md hover:bg-white dark:hover:bg-black/70 transition-colors text-slate-900 dark:text-white">
                        <span className="material-symbols-outlined">download</span>
                    </button>
                </div>
                <img
                    alt={leaseData.property.name}
                    className="w-full h-full object-cover"
                    src={leaseData.property.image}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-4 md:left-8 text-white">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-1 bg-green-500/90 text-white text-xs font-bold uppercase tracking-wider rounded-md backdrop-blur-sm">
                            {leaseData.status} Lease
                        </span>
                        <span className="text-white/80 text-sm font-medium">#{leaseData.id}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white leading-tight">Lease Agreement</h1>
                    <p className="text-white/90 font-medium">{leaseData.property.name}, {leaseData.property.address}</p>
                </div>
            </div>

            {/* Main Content */}
            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8">
                {/* Stats Grid */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Monthly Rent</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-slate-900 dark:text-white">{leaseData.monthlyRent}</span>
                            <span className="text-xs text-slate-500">/mo</span>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-green-600 font-medium bg-green-50 dark:bg-green-900/20 w-fit px-1.5 py-0.5 rounded">
                            <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span> Paid
                        </div>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Security Deposit</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">{leaseData.securityDeposit}</span>
                        <span className="text-xs text-slate-500">Held in escrow</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Lease Start</span>
                        <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{leaseData.leaseStart}</span>
                        <span className="text-xs text-slate-500">{leaseData.term}</span>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-1">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Lease End</span>
                        <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{leaseData.leaseEnd}</span>
                        <span className="text-xs text-orange-500 font-medium">Expiring soon</span>
                    </div>
                </section>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column - Main Content */}
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
                                <button className="text-sm text-[#137fec] font-semibold hover:underline">View Full Ledger</button>
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
                                            {leaseData.payments.map((payment) => (
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
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#137fec]">group</span> Tenant Information
                            </h4>
                            <Link to="/landlord/tenants/1/profile" className="flex items-center gap-4 mb-6 group cursor-pointer">
                                <div className="size-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden group-hover:ring-2 group-hover:ring-[#137fec] transition-all">
                                    <span className="material-symbols-outlined text-[32px]">face</span>
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white text-lg group-hover:text-[#137fec] transition-colors">{leaseData.tenant.name}</p>
                                    <p className="text-sm text-slate-500">Primary: {leaseData.tenant.primary}</p>
                                </div>
                            </Link>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                                        <span className="material-symbols-outlined text-[18px]">mail</span>
                                    </div>
                                    <span className="text-slate-600 dark:text-slate-300">{leaseData.tenant.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                                        <span className="material-symbols-outlined text-[18px]">call</span>
                                    </div>
                                    <span className="text-slate-600 dark:text-slate-300">{leaseData.tenant.phone}</span>
                                </div>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                                <button className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Message</button>
                                <Link to="/landlord/tenants/1/profile" className="flex-1 py-2 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center">View Profile</Link>
                            </div>
                        </div>

                        {/* Landlord / Agent */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                            <h4 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-500">real_estate_agent</span> Landlord / Agent
                            </h4>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                    {leaseData.manager.initials}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{leaseData.manager.name}</p>
                                    <p className="text-xs text-slate-500 uppercase tracking-wide">{leaseData.manager.role}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p className="text-slate-600 dark:text-slate-400"><strong>Agency:</strong> {leaseData.manager.agency}</p>
                                <p className="text-slate-600 dark:text-slate-400"><strong>Phone:</strong> {leaseData.manager.phone}</p>
                                <p className="text-slate-600 dark:text-slate-400"><strong>Email:</strong> {leaseData.manager.email}</p>
                            </div>
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
                                This lease expires in <strong className="text-slate-900 dark:text-white">{leaseData.daysRemaining} days</strong>. Based on payment history and market rates, we recommend offering a renewal at <strong className="text-green-600">{leaseData.renewalSuggestion}/mo</strong>.
                            </p>
                            <button
                                onClick={() => setIsRenewalModalOpen(true)}
                                className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 font-semibold text-sm text-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                            >
                                Draft Renewal Offer
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Action Bar */}
            <div className="fixed bottom-0 left-0 w-full z-20 bg-white dark:bg-[#101922] border-t border-slate-200 dark:border-slate-800 p-4 md:px-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="hidden md:flex items-center gap-4">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Lease Status</p>
                            <div className="flex items-center gap-2">
                                <span className="size-2.5 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="font-bold text-slate-900 dark:text-white">{leaseData.status}</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-0.5">Days Remaining</p>
                            <span className="font-bold text-slate-900 dark:text-white">{leaseData.daysRemaining} Days</span>
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
                        <button className="flex-1 md:flex-none px-5 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-red-600 hover:border-red-100 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors whitespace-nowrap flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[20px]">block</span>
                            Notice to Vacate
                        </button>
                        <button
                            onClick={() => setIsRenewalModalOpen(true)}
                            className="flex-1 md:flex-none px-8 py-3.5 rounded-xl bg-[#137fec] text-white font-bold hover:bg-[#0e64bd] transition-colors shadow-lg shadow-[#137fec]/25 whitespace-nowrap flex items-center justify-center gap-2"
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
                    property: leaseData.property.name,
                    modifiedTime: leaseData.leaseStart,
                    status: 'Signed',
                    totalPages: 14,
                }}
            />

            {/* Draft Renewal Offer Modal */}
            <DraftRenewalOfferModal
                isOpen={isRenewalModalOpen}
                onClose={() => setIsRenewalModalOpen(false)}
                propertyAddress={`${leaseData.property.name}, ${leaseData.property.address}`}
                leaseId={`#${leaseData.id}`}
                currentRent={leaseData.monthlyRent}
                expiryDate={leaseData.leaseEnd}
            />
        </div>
    );
}
