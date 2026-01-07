import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../../../components/ConfirmationModal';
import Breadcrumb from '../../../components/common/Breadcrumb';

export default function ApplicantDetail() {
    const { id } = useParams();
    const [showAIChat, setShowAIChat] = useState(false);
    const [internalNote, setInternalNote] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);

    return (
        <>
            <ConfirmationModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={() => console.log('Applicant rejected')}
                title="Reject Application?"
                description="Are you sure you want to reject Sarah Jenkins's application? They will be notified and removed from consideration for this property."
                confirmText="Reject Application"
                icon="block"
            />
            {/* Header - Page's own navbar */}
            <header className="sticky top-0 z-40 flex items-center justify-between whitespace-nowrap border-b border-solid border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-[#101922]/90 backdrop-blur-md px-10 py-3">
                <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                    <Link to="/landlord/dashboard" className="size-8 bg-[#137fec] rounded-lg flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">real_estate_agent</span>
                    </Link>
                    <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">PropertyApp</h2>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-2 py-1 rounded font-medium ml-2">Landlord Portal</span>
                </div>
                <div className="flex flex-1 justify-end gap-8">
                    <div className="hidden md:flex items-center gap-9">
                        <Link className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-[#137fec] transition-colors" to="/landlord/dashboard">Dashboard</Link>
                        <Link className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-[#137fec] transition-colors" to="#">Listings</Link>
                        <Link className="text-[#137fec] font-bold leading-normal transition-colors" to="/landlord/tenants">Applications</Link>
                        <Link className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-[#137fec] transition-colors" to="#">Tenants</Link>
                        <Link className="text-slate-900 dark:text-slate-200 text-sm font-medium leading-normal hover:text-[#137fec] transition-colors" to="#">Messages</Link>
                    </div>
                    <div className="flex gap-3">
                        <button className="relative flex items-center justify-center overflow-hidden rounded-lg size-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button className="flex items-center justify-center overflow-hidden rounded-lg size-10 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            <div className="size-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300">RJ</div>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex flex-col py-8 px-4 md:px-10 lg:px-20 pb-32">
                <div className="max-w-[1400px] w-full mx-auto">
                    {/* Breadcrumb */}
                    <Breadcrumb
                        items={[
                            { label: 'Applications', href: '/landlord/tenants' },
                            { label: 'Sarah Jenkins' },
                        ]}
                    />

                    {/* Page Header */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sarah Jenkins</h1>
                                <span className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span> Pending Review
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm md:text-base">
                                <p>Application ID: <span className="font-mono text-slate-700 dark:text-slate-300">#APP-8921-TX</span></p>
                                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                <p>Submitted: Oct 24, 2024</p>
                                <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                <Link className="text-[#137fec] hover:underline" to="/landlord/properties/1">1243 Oakwood Ave, Austin TX</Link>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(true)}
                                className="px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[20px]">close</span> Reject
                            </button>
                            <button className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">check</span> Approve Application
                            </button>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            {/* Applicant Summary */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xl font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                                            SJ
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Applicant Summary</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">Senior Software Engineer • TechCorp Inc.</p>
                                        </div>
                                    </div>
                                    <Link className="text-[#137fec] text-sm font-bold hover:underline flex items-center gap-1" to={`/landlord/tenants/${id}/profile`}>
                                        View Full Profile <span className="material-symbols-outlined text-sm">open_in_new</span>
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Credit Score</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-extrabold text-green-600 dark:text-green-400">745</span>
                                            <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-bold">Good</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Monthly Income</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-extrabold text-slate-900 dark:text-white">$12.1k</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Rent Coverage</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl font-extrabold text-slate-900 dark:text-white">3.9x</span>
                                            <span className="text-xs text-slate-400">Rent</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Identity</p>
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-green-500 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">Verified</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Background Screening */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#101922]">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">policy</span>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Background Screening</h3>
                                    </div>
                                    <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2.5 py-0.5 rounded-full text-xs font-bold border border-green-200 dark:border-green-800">
                                        Completed Oct 25
                                    </span>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                                                <span className="material-symbols-outlined text-lg">check</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Criminal History</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">No records found</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                                                <span className="material-symbols-outlined text-lg">check</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Eviction History</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">No records found</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
                                                <span className="material-symbols-outlined text-lg">warning</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">Reference Check</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Action Required</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                        <button className="text-[#137fec] text-sm font-bold hover:underline flex items-center gap-1">
                                            View Detailed Report
                                        </button>
                                        <button className="text-slate-500 text-sm font-medium hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-1">
                                            Download PDF <span className="material-symbols-outlined text-sm">download</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Submitted Documents */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#101922]">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-slate-400">folder_open</span>
                                        <h3 className="font-bold text-slate-900 dark:text-white">Submitted Documents</h3>
                                    </div>
                                    <button className="text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[16px]">add</span> Request Missing
                                    </button>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-center gap-3 hover:border-[#137fec]/50 transition-colors group">
                                            <div className="size-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                                                <span className="material-symbols-outlined">description</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Employment Verification.pdf</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded 2 days ago</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-[#137fec]"><span className="material-symbols-outlined text-lg">visibility</span></button>
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-[#137fec]"><span className="material-symbols-outlined text-lg">download</span></button>
                                            </div>
                                        </div>
                                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex items-center gap-3 hover:border-[#137fec]/50 transition-colors group">
                                            <div className="size-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-500 shrink-0">
                                                <span className="material-symbols-outlined">account_balance</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Bank_Statements_Oct.pdf</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded 2 days ago</p>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-[#137fec]"><span className="material-symbols-outlined text-lg">visibility</span></button>
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-[#137fec]"><span className="material-symbols-outlined text-lg">download</span></button>
                                            </div>
                                        </div>
                                        <div className="border border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10 rounded-lg p-3 flex items-center gap-3 relative">
                                            <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                                                <span className="material-symbols-outlined">id_card</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Drivers_License_Front.jpg</p>
                                                <p className="text-xs text-red-500 font-medium">Flagged: Blurry image</p>
                                            </div>
                                            <button className="text-xs font-bold text-[#137fec] hover:underline whitespace-nowrap">Resend Request</button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Internal Notes */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-[#101922]">
                                    <span className="material-symbols-outlined text-slate-400">lock</span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Internal Notes</h3>
                                    <span className="text-xs text-slate-400 font-normal ml-auto">Visible only to team</span>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4 mb-6">
                                        <div className="flex gap-3">
                                            <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-xs font-bold">RJ</div>
                                            <div className="flex-1">
                                                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300">
                                                    Called references. Previous landlord (Mike) spoke highly of her. Confirmed timely payments for 3 years.
                                                </div>
                                                <p className="text-[10px] text-slate-400 mt-1 pl-1">Today, 10:30 AM</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            className="w-full p-3 pr-12 bg-white dark:bg-[#101922] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none resize-none transition-colors"
                                            placeholder="Add a private note..."
                                            rows={2}
                                            value={internalNote}
                                            onChange={(e) => setInternalNote(e.target.value)}
                                        ></textarea>
                                        <button className="absolute right-2 bottom-2 p-1.5 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 transition-colors shadow-sm">
                                            <span className="material-symbols-outlined text-[18px]">send</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="flex flex-col gap-6">
                            {/* Property Card */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
                                <div className="relative h-40 w-full overflow-hidden">
                                    <img alt="Property" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-3 left-4 text-white">
                                        <h3 className="font-bold text-base shadow-sm">1243 Oakwood Ave</h3>
                                        <p className="text-xs opacity-90">Unit 4B • Austin, TX</p>
                                    </div>
                                </div>
                                <div className="p-4 grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
                                    <div className="text-center px-2">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Monthly Rent</p>
                                        <p className="text-base font-bold text-slate-900 dark:text-white">$3,100</p>
                                    </div>
                                    <div className="text-center px-2">
                                        <p className="text-[10px] text-slate-500 uppercase font-bold">Lease Term</p>
                                        <p className="text-base font-bold text-slate-900 dark:text-white">12 Mos</p>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-4 text-sm uppercase tracking-wider opacity-70">Quick Actions</h3>
                                <div className="flex flex-col gap-2.5">
                                    <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3 group">
                                        <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center group-hover:text-[#137fec] transition-colors">
                                            <span className="material-symbols-outlined text-lg">mail</span>
                                        </div>
                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-[#137fec]">Send Message</span>
                                    </button>
                                    <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3 group">
                                        <div className="size-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-500 flex items-center justify-center group-hover:text-[#137fec] transition-colors">
                                            <span className="material-symbols-outlined text-lg">calendar_month</span>
                                        </div>
                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-[#137fec]">Schedule Interview</span>
                                    </button>
                                    <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center gap-3 group">
                                        <div className="size-8 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-500 flex items-center justify-center group-hover:text-[#137fec] transition-colors">
                                            <span className="material-symbols-outlined text-lg">history_edu</span>
                                        </div>
                                        <span className="font-bold text-sm text-slate-700 dark:text-slate-200 group-hover:text-[#137fec]">Draft Lease</span>
                                    </button>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                                <h3 className="font-bold text-slate-900 dark:text-white mb-5">Timeline</h3>
                                <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[9px] top-0 size-4 bg-amber-500 rounded-full border-4 border-white dark:border-[#101922]"></div>
                                        <p className="text-xs text-slate-400 font-mono mb-0.5">Yesterday, 4:30 PM</p>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Doc Request Sent</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Requested re-upload of ID.</p>
                                    </div>
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[9px] top-0 size-4 bg-green-500 rounded-full border-4 border-white dark:border-[#101922]"></div>
                                        <p className="text-xs text-slate-400 font-mono mb-0.5">Oct 26, 2024</p>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Background Check</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Screening completed automatically.</p>
                                    </div>
                                    <div className="relative pl-6">
                                        <div className="absolute -left-[9px] top-0 size-4 bg-slate-300 dark:bg-slate-600 rounded-full border-4 border-white dark:border-[#101922]"></div>
                                        <p className="text-xs text-slate-400 font-mono mb-0.5">Oct 24, 2024</p>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Application Received</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Applicant submitted form.</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Insight Card */}
                            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                                <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12">psychology</span>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="material-symbols-outlined text-yellow-300">lightbulb</span>
                                        <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Insight</span>
                                    </div>
                                    <h4 className="font-bold text-sm leading-tight mb-2">Analyze Applicant Risk</h4>
                                    <p className="text-xs text-indigo-100 mb-3">Ask HomeAI to summarize financial health or compare with other applicants.</p>
                                    <button
                                        onClick={() => setShowAIChat(true)}
                                        className="cursor-pointer inline-block w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold text-xs rounded-lg transition-colors text-center"
                                    >
                                        Ask Assistant
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating AI Assistant */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-2">
                {/* AI Modal */}
                {showAIChat && (
                    <div className="flex flex-col w-[360px] md:w-[480px] bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-50 to-white dark:from-[#1e293b] dark:to-[#1e293b]">
                            <div className="flex items-center gap-2">
                                <div className="size-8 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md">
                                    <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Landlord Assistant</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className="size-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Ready to help</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowAIChat(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                                <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                        </div>
                        <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto max-h-[60vh] bg-white dark:bg-[#1e293b]">
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3.5 rounded-2xl rounded-tl-sm flex gap-3 items-start border border-blue-100 dark:border-blue-800 shadow-sm">
                                <span className="material-symbols-outlined text-[#137fec] text-xl mt-0.5">smart_toy</span>
                                <div className="text-sm">
                                    <p className="text-slate-900 dark:text-white font-medium leading-relaxed">Hello! I'm reviewing Sarah's application. How can I assist you?</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2">
                                <button className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#137fec]/50 transition-colors text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#137fec] text-lg">analytics</span>
                                    Analyze Rent-to-Income Ratio
                                </button>
                                <button className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#137fec]/50 transition-colors text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#137fec] text-lg">edit_note</span>
                                    Draft Request for Missing ID
                                </button>
                                <button className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#137fec]/50 transition-colors text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[#137fec] text-lg">gavel</span>
                                    Generate Lease Agreement
                                </button>
                            </div>
                            <div className="relative mt-2">
                                <input className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-[#101922] border border-slate-200 dark:border-slate-700 rounded-full text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none shadow-sm" placeholder="Ask anything about this application..." />
                                <button className="absolute right-2 top-2 p-1 bg-[#137fec] text-white rounded-full hover:bg-[#137fec]/90 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* AI Trigger Button */}
                <button
                    onClick={() => setShowAIChat(!showAIChat)}
                    className={`group flex items-center gap-3 bg-white dark:bg-[#1e293b] text-slate-900 dark:text-white pl-1.5 pr-5 py-1.5 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-700 hover:scale-105 hover:shadow-[0_8px_30px_rgb(0,0,0,0.18)] transition-all duration-300 ${showAIChat ? 'hidden' : ''}`}
                >
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="text-sm font-bold leading-none">AI Assistant</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">Analyze application</span>
                    </div>
                </button>
            </div>
        </>
    );
}
