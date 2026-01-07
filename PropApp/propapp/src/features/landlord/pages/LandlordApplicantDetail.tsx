import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../../../components/ConfirmationModal';
import PageContainer from '../../../components/common/PageContainer';
import Breadcrumb from '../../../components/common/Breadcrumb';

// Mock applicant data
const applicantData = {
    id: 'APP-8921-TX',
    name: 'Sarah Jenkins',
    initials: 'SJ',
    status: 'Pending Review',
    statusColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    submittedDate: 'Oct 24, 2024',
    occupation: 'Senior Software Engineer • TechCorp Inc.',
    creditScore: 745,
    creditRating: 'Good',
    monthlyIncome: '$12.1k',
    rentCoverage: '3.9x',
    identityVerified: true,
    property: {
        name: '1243 Oakwood Ave',
        unit: 'Unit 4B',
        location: 'Austin, TX',
        rent: '$3,100',
        leaseTerm: '12 Mos',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
    },
    screening: {
        completedDate: 'Oct 25',
        criminal: { status: 'pass', text: 'No records found' },
        eviction: { status: 'pass', text: 'No records found' },
        reference: { status: 'warning', text: 'Action Required' },
    },
    documents: [
        { id: 1, name: 'Employment Verification.pdf', icon: 'description', uploaded: '2 days ago', status: 'ok' },
        { id: 2, name: 'Bank_Statements_Oct.pdf', icon: 'account_balance', uploaded: '2 days ago', status: 'ok' },
        { id: 3, name: 'Drivers_License_Front.jpg', icon: 'id_card', uploaded: '2 days ago', status: 'flagged', flagReason: 'Blurry image' },
    ],
    notes: [
        { id: 1, author: 'RJ', message: 'Called references. Previous landlord (Mike) spoke highly of her. Confirmed timely payments for 3 years.', time: 'Today, 10:30 AM' },
    ],
    timeline: [
        { id: 1, date: 'Yesterday, 4:30 PM', title: 'Doc Request Sent', description: 'Requested re-upload of ID.', color: 'bg-amber-500' },
        { id: 2, date: 'Oct 26, 2024', title: 'Background Check', description: 'Screening completed automatically.', color: 'bg-green-500' },
        { id: 3, date: 'Oct 24, 2024', title: 'Application Received', description: 'Applicant submitted form.', color: 'bg-slate-300 dark:bg-slate-600' },
    ],
};

export default function LandlordApplicantDetail() {
    const { id } = useParams();
    const [newNote, setNewNote] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    console.log('Applicant ID:', id);

    return (
        <PageContainer>
            <ConfirmationModal
                isOpen={showRejectModal}
                onClose={() => setShowRejectModal(false)}
                onConfirm={() => console.log('Applicant rejected')}
                title="Reject Application?"
                description={`Are you sure you want to reject ${applicantData.name}'s application? They will be notified and removed from consideration for this property.`}
                confirmText="Reject Application"
                icon="block"
            />
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: 'Applications', href: '/landlord/tenants' },
                    { label: applicantData.name },
                ]}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">{applicantData.name}</h1>
                        <span className={`${applicantData.statusColor} border px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5`}>
                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>pending</span>
                            {applicantData.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-800 dark:text-slate-400 text-sm md:text-base">
                        <p>Application ID: <span className="font-mono text-slate-700 dark:text-slate-300">#{applicantData.id}</span></p>
                        <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <p>Submitted: {applicantData.submittedDate}</p>
                        <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                        <Link to="#" className="text-[#137fec] hover:underline">{applicantData.property.name}, {applicantData.property.location}</Link>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowRejectModal(true)}
                        className="px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span> Reject
                    </button>
                    <button className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">check</span> Approve Application
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Applicant Summary */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                                <div className="size-16 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-600 dark:text-indigo-300 flex items-center justify-center text-xl font-bold border-2 border-white dark:border-slate-700 shadow-sm">
                                    {applicantData.initials}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Applicant Summary</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{applicantData.occupation}</p>
                                </div>
                            </div>
                            <Link to={`/landlord/tenants/${id}/profile`} className="text-[#137fec] text-sm font-bold hover:underline flex items-center gap-1">
                                View Full Profile <span className="material-symbols-outlined text-sm">open_in_new</span>
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Credit Score</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-extrabold text-green-600 dark:text-green-400">{applicantData.creditScore}</span>
                                    <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded font-bold">{applicantData.creditRating}</span>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Monthly Income</p>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{applicantData.monthlyIncome}</span>
                            </div>
                            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Rent Coverage</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl font-extrabold text-slate-900 dark:text-white">{applicantData.rentCoverage}</span>
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
                                Completed {applicantData.screening.completedDate}
                            </span>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-full flex items-center justify-center ${applicantData.screening.criminal.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                                        <span className="material-symbols-outlined text-lg">{applicantData.screening.criminal.status === 'pass' ? 'check' : 'warning'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Criminal History</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{applicantData.screening.criminal.text}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-full flex items-center justify-center ${applicantData.screening.eviction.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                                        <span className="material-symbols-outlined text-lg">{applicantData.screening.eviction.status === 'pass' ? 'check' : 'warning'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Eviction History</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{applicantData.screening.eviction.text}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`size-8 rounded-full flex items-center justify-center ${applicantData.screening.reference.status === 'pass' ? 'bg-green-50 dark:bg-green-900/20 text-green-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                                        <span className="material-symbols-outlined text-lg">{applicantData.screening.reference.status === 'pass' ? 'check' : 'warning'}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Reference Check</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{applicantData.screening.reference.text}</p>
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
                                {applicantData.documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className={`border rounded-lg p-3 flex items-center gap-3 transition-colors group ${doc.status === 'flagged'
                                            ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-[#137fec]/50'
                                            }`}
                                    >
                                        <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${doc.status === 'flagged' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-500'}`}>
                                            <span className="material-symbols-outlined">{doc.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                                            {doc.status === 'flagged' ? (
                                                <p className="text-xs text-red-500 font-medium">Flagged: {doc.flagReason}</p>
                                            ) : (
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Uploaded {doc.uploaded}</p>
                                            )}
                                        </div>
                                        {doc.status === 'flagged' ? (
                                            <button className="text-xs font-bold text-[#137fec] hover:underline whitespace-nowrap">Resend Request</button>
                                        ) : (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-[#137fec]">
                                                    <span className="material-symbols-outlined text-lg">visibility</span>
                                                </button>
                                                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-[#137fec]">
                                                    <span className="material-symbols-outlined text-lg">download</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
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
                                {applicantData.notes.map((note) => (
                                    <div key={note.id} className="flex gap-3">
                                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-xs font-bold">{note.author}</div>
                                        <div className="flex-1">
                                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl rounded-tl-none text-sm text-slate-700 dark:text-slate-300">
                                                {note.message}
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1 pl-1">{note.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="relative">
                                <textarea
                                    className="w-full p-3 pr-12 bg-white dark:bg-[#101922] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none resize-none transition-colors"
                                    placeholder="Add a private note..."
                                    rows={2}
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <button className="absolute right-2 bottom-2 p-1.5 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 transition-colors shadow-sm">
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="flex flex-col gap-6">
                    {/* Property Card */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
                        <div className="relative h-40 w-full overflow-hidden">
                            <img
                                alt="Property"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={applicantData.property.image}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-4 text-white">
                                <h3 className="font-bold text-base shadow-sm">{applicantData.property.name}</h3>
                                <p className="text-xs opacity-90">{applicantData.property.unit} • {applicantData.property.location}</p>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-2 divide-x divide-slate-100 dark:divide-slate-800">
                            <div className="text-center px-2">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Monthly Rent</p>
                                <p className="text-base font-bold text-slate-900 dark:text-white">{applicantData.property.rent}</p>
                            </div>
                            <div className="text-center px-2">
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Lease Term</p>
                                <p className="text-base font-bold text-slate-900 dark:text-white">{applicantData.property.leaseTerm}</p>
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
                            {applicantData.timeline.map((event) => (
                                <div key={event.id} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-0 size-4 ${event.color} rounded-full border-4 border-white dark:border-[#101922]`}></div>
                                    <p className="text-xs text-slate-400 font-mono mb-0.5">{event.date}</p>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{event.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insight */}
                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12">psychology</span>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined text-yellow-300">lightbulb</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Insight</span>
                            </div>
                            <h4 className="font-bold text-sm leading-tight mb-2">Analyze Applicant Risk</h4>
                            <p className="text-xs text-indigo-100 mb-3">Ask HomeAI to summarize financial health or compare with other applicants.</p>
                            <button className="cursor-pointer inline-block w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold text-xs rounded-lg transition-colors text-center">Ask Assistant</button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
