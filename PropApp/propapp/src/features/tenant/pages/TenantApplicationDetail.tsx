import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import WithdrawApplicationModal from '../../../components/WithdrawApplicationModal';
import PageContainer from '../../../components/common/PageContainer';
import Breadcrumb from '../../../components/common/Breadcrumb';

// Mock application data
const applicationData = {
    id: 'APP-8921-TX',
    propertyName: '1243 Oakwood Ave',
    propertyLocation: 'Austin, TX',
    propertyImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
    beds: 2,
    baths: 2,
    rent: '$3,100',
    deposit: '$3,100',
    submittedDate: 'Oct 24, 2024',
    status: 'Action Required',
    statusColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    applicant: {
        name: 'Sarah Jenkins',
        address: '5500 Highland Park, Unit 4B, Dallas, TX',
        email: 'sarah.j@example.com',
        phone: '+1 (214) 555-0192',
    },
    employment: {
        title: 'Senior Software Engineer',
        company: 'TechCorp Inc.',
        type: 'Full-time',
        income: '$145,000',
        duration: '3 Years, 2 Months',
    },
    documents: [
        { id: 1, name: 'Paystubs_Q3_2024.pdf', status: 'verified', size: '1.2 MB', icon: 'picture_as_pdf' },
        { id: 2, name: 'Drivers_License_Front.jpg', status: 'flagged', size: '800 KB', icon: 'id_card', issue: 'Flagged as blurry' },
    ],
    landlordComment: {
        name: 'Robert Johnson',
        role: 'Property Manager',
        time: 'Yesterday, 4:30 PM',
        initials: 'RJ',
        message: "Hi Sarah, thanks for your application. Everything looks great, but the copy of your Driver's License uploaded seems a bit blurry. Could you please re-upload a clearer scan or photo? Once we have that, we can move to the lease agreement stage.",
    },
    history: [
        { date: 'Yesterday, 4:30 PM', title: 'Action Required', description: 'Status updated by Landlord (Robert Johnson).', isCurrent: true },
        { date: 'Oct 26, 2024', title: 'Under Review', description: 'Application viewed by property manager.', isCurrent: false },
        { date: 'Oct 24, 2024', title: 'Application Submitted', description: 'You completed the application form.', isCurrent: false },
    ],
};

export default function TenantApplicationDetail() {
    const { id } = useParams();
    console.log('Application ID:', id);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    return (
        <PageContainer>
            {/* Breadcrumb */}
            <Breadcrumb
                items={[
                    { label: 'Applications', href: '/tenant/applications' },
                    { label: 'Details' },
                ]}
            />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            Your Application for {applicationData.propertyName}
                        </h1>
                        <span className={`${applicationData.statusColor} border px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1.5`}>
                            <span className="material-symbols-outlined text-[16px]">info</span>
                            {applicationData.status}
                        </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-300 text-lg">
                        Application ID: <span className="font-mono text-slate-800 dark:text-slate-300">#{applicationData.id}</span> • Submitted on {applicationData.submittedDate}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        className="px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                        Withdraw Application
                    </button>
                    <button className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                        Upload Missing Documents
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Attention Banner */}
                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start">
                        <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined">priority_high</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Attention Needed</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">
                                The landlord has requested additional documentation to proceed with your application. Please review the comments below and upload the necessary files.
                            </p>
                            <button className="text-sm font-bold text-amber-700 dark:text-amber-400 hover:underline">
                                Jump to Upload Section
                            </button>
                        </div>
                    </div>

                    {/* Landlord Comments */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/50 dark:bg-[#101922]">
                            <span className="material-symbols-outlined text-slate-400">comment</span>
                            <h3 className="font-bold text-slate-900 dark:text-white">Landlord Comments</h3>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4">
                                <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-300 font-bold">
                                    {applicationData.landlordComment.initials}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 w-full">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                                            {applicationData.landlordComment.name}
                                            <span className="font-normal text-slate-500 ml-2">{applicationData.landlordComment.role}</span>
                                        </h4>
                                        <span className="text-xs text-slate-400">{applicationData.landlordComment.time}</span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                        {applicationData.landlordComment.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submitted Information */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-[#101922]">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">description</span>
                                <h3 className="font-bold text-slate-900 dark:text-white">Submitted Information</h3>
                            </div>
                            <button className="text-xs font-bold text-[#137fec] hover:underline">Edit Details</button>
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {/* Personal Details */}
                            <div className="p-6">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 opacity-70">Personal Details</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Full Name</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{applicationData.applicant.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Current Address</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{applicationData.applicant.address}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email Address</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{applicationData.applicant.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phone Number</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{applicationData.applicant.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Employment History */}
                            <div className="p-6">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 opacity-70">Employment History</h4>
                                <div className="flex items-start gap-4">
                                    <div className="size-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                                        <span className="material-symbols-outlined">work</span>
                                    </div>
                                    <div className="flex-1">
                                        <h5 className="font-bold text-slate-900 dark:text-white">{applicationData.employment.title}</h5>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{applicationData.employment.company} • {applicationData.employment.type}</p>
                                        <div className="grid grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Annual Income</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{applicationData.employment.income}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Duration</p>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{applicationData.employment.duration}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider opacity-70">Documents</h4>
                                    <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded border border-red-100 font-medium">1 Issue Detected</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {applicationData.documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className={`border rounded-lg p-3 flex items-center gap-3 ${doc.status === 'flagged'
                                                ? 'border-red-300 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10 relative overflow-hidden'
                                                : 'border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            {doc.status === 'flagged' && (
                                                <div className="absolute right-0 top-0 bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded-bl">Re-upload</div>
                                            )}
                                            <div className={`size-10 rounded-lg flex items-center justify-center shrink-0 ${doc.status === 'flagged'
                                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                : 'bg-red-50 dark:bg-red-900/20 text-red-500'
                                                }`}>
                                                <span className="material-symbols-outlined">{doc.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                                                <p className={`text-xs ${doc.status === 'flagged' ? 'text-red-500 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                                    {doc.status === 'flagged' ? doc.issue : `Verified • ${doc.size}`}
                                                </p>
                                            </div>
                                            <button className={`${doc.status === 'flagged' ? 'text-[#137fec] bg-white dark:bg-slate-800 rounded-full p-1 shadow-sm hover:bg-slate-50' : 'text-slate-400 hover:text-[#137fec]'}`}>
                                                <span className="material-symbols-outlined text-sm">{doc.status === 'flagged' ? 'cloud_upload' : 'visibility'}</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="flex flex-col gap-6">
                    {/* Property Card */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group">
                        <div className="relative h-48 w-full overflow-hidden">
                            <img
                                alt={applicationData.propertyName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={applicationData.propertyImage}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                                <h3 className="text-white font-bold text-lg">{applicationData.propertyName}</h3>
                                <p className="text-white/80 text-sm">{applicationData.propertyLocation} • {applicationData.beds} Bed, {applicationData.baths} Bath</p>
                            </div>
                        </div>
                        <div className="p-5">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Monthly Rent</p>
                                    <p className="text-xl font-extrabold text-slate-900 dark:text-white">{applicationData.rent}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Deposit</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">{applicationData.deposit}</p>
                                </div>
                            </div>
                            <Link
                                to={`/property/1`}
                                className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors block text-center"
                            >
                                View Full Listing
                            </Link>
                        </div>
                    </div>

                    {/* Application History */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-5">Application History</h3>
                        <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-3 space-y-6">
                            {applicationData.history.map((event, index) => (
                                <div key={index} className="relative pl-6">
                                    <div className={`absolute -left-[9px] top-0 size-4 rounded-full border-4 border-white dark:border-[#101922] ${event.isCurrent ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                                    <p className="text-xs text-slate-400 font-mono mb-0.5">{event.date}</p>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{event.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Assistant Card */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl text-white/10 rotate-12">assistant</span>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="material-symbols-outlined">auto_awesome</span>
                                <span className="text-xs font-bold uppercase tracking-wider opacity-80">AI Assistant</span>
                            </div>
                            <h4 className="font-bold text-sm leading-tight mb-2">Have questions about this application?</h4>
                            <p className="text-xs text-indigo-100 mb-3">Ask HomeAI about typical wait times or clarification on the landlord's request.</p>
                            <button className="cursor-pointer inline-block w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white font-bold text-xs rounded-lg transition-colors text-center">Ask Assistant</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Withdraw Application Modal */}
            <WithdrawApplicationModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                propertyName={applicationData.propertyName}
            />
        </PageContainer>
    );
}
