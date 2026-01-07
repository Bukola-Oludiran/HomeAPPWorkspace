import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';
import { SuccessCelebration } from '../../../components/animation';

// Mock job detail data
const jobDetail = {
    id: 1,
    jobId: 'AC-4921',
    title: 'AC Repair & Service',
    category: 'HVAC',
    status: 'in-progress',
    statusLabel: 'In Progress',
    statusBg: 'bg-amber-100 dark:bg-amber-900/30',
    statusColor: 'text-amber-700 dark:text-amber-500',
    statusBorder: 'border-amber-200 dark:border-amber-800',
    price: '$120.00',
    description: `The central AC unit in the master bedroom is blowing warm air and making a rattling noise when the compressor turns on. The unit is a 2019 LG Split System. Please inspect the outdoor condenser unit and the indoor evaporator coil.`,
    clientNote: `"Please arrive through the side gate. The noise is very loud so I turned it off completely."`,
    schedule: {
        month: 'Oct',
        day: '24',
        dayText: 'Today',
        time: '02:00 PM - 04:00 PM',
    },
    property: {
        name: 'Lekki Phase 1, Block 4',
        unit: 'Apartment 4B, 2nd Floor',
        accessInstructions: 'Gate code: 8822. Key is in the lockbox code 1234.',
        mapImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOTg83NtPQPRro6RUBdyaMVuI8lPxiQ3cDShXimL7VcvQrPtrxVmeYVYhXoUDaB-K-HqHTYvUmStdO5k5tRggvexwwKaFvQfl3HZkrwnVI-PpW7tfiRHacuVI6Xz0ekMXDv3AKjppt5XgxmMnv7M0QUvzn_UMyFpaz2i-QS3Vohu8yKzlVyuhBUp15RrlGSKQoue_T4OyHynUVAsyUzfP6wwrP60yisItE8bTh6bQTnYUWTy3nFEMH2pt5QYLPF6ZTT9b6bIkZuz4W',
    },
    client: {
        name: 'Tunde Bakare',
        initials: 'TB',
        role: 'Landlord',
        rating: 4.8,
    },
    attachments: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuDCTOnkqU755_6MbtdTWhJ-06_1L60Pq8PEkra_UqpQ9CKoJPB6EhnKg6NJmwE3a1S2kKobkQHOuXpOIN2X0i2d3o6aq_d6XhrB7XFT6SIZXZzvKaWs-fQUJk3BbdE4yJD2Mn6qckcadT8yiMW6qAN_RQ4_faCWQIMphsnjqrK0m2WdU1ER5DF2HEe_AaMUpLynVzKql1apRyF88a3jxdO1jpX_Uxb4LKmfr2Vce7GW3r2aGlLeJjBTfM-g5Y3EUeK4OD5NaeflMeOb',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuB93b4L1_91azvja2N-bbdloDvWvZcqX_Ud68eywPHhJLMTyiHe5gedFk1DJrQKhI-PxDDe3mwgHfRTQdUn_sN9-OroxButhrhCgaYYmj7KL70sUxFFAJm2YvmUBhdi0c27MJ_w47E-YJrRSDpJEBiMMA5R4_iij6YjE9wrPEsP7KUf-JS-ZmA57FwE0htqUFhNY-SbEIzsECa2IweVC-0HWLdgBmFYQHuLo_yPUtfSI9c3BFPgRCf6e5Mm3gtEP6bh1uEdvlpjCO0u',
    ],
    suggestedTools: [
        { name: 'R-410A Refrigerant Gauge', icon: 'build' },
        { name: 'Standard HVAC Toolkit (Wrenches, Drivers)', icon: 'handyman' },
        { name: 'Multimeter (Voltage testing)', icon: 'electrical_services' },
    ],
};

export default function AgentJobDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isSuccessOpen, setIsSuccessOpen] = useState(false);

    // In a real app, fetch job details based on id
    console.log('Job ID:', id);

    return (
        <PageContainer>
            {/* Breadcrumb */}
            <div className="mb-6">
                <Link
                    to="/agent/my-jobs"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 dark:text-slate-400 hover:text-[#137fec] transition-colors"
                >
                    <span className="material-symbols-outlined text-lg text-slate-800 dark:text-slate-400">arrow_back</span>
                    Back to My Jobs
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className="inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300">
                            {jobDetail.category}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${jobDetail.statusBg} ${jobDetail.statusColor} border ${jobDetail.statusBorder}`}>
                            <span className="material-symbols-outlined text-[14px] animate-spin" style={{ animationDuration: '3s' }}>sync</span>
                            {jobDetail.statusLabel}
                        </span>
                        <span className="text-sm text-slate-800">Job ID: #{jobDetail.jobId}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                        {jobDetail.title}
                    </h1>
                </div>
                <div className="flex flex-col items-end">
                    <p className="text-sm text-slate-800 dark:text-slate-400 mb-1 font-medium">Total Payment</p>
                    <span className="text-3xl font-extrabold text-[#137fec]">{jobDetail.price}</span>
                    <p className="text-xs text-slate-800 mt-1">Payment released upon completion</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Mobile Actions */}
                    <div className="lg:hidden bg-white dark:bg-[#101922] rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Job Actions</h3>
                        <div className="flex gap-3">
                            <button className="flex-1 px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">warning</span>
                                Report Issue
                            </button>
                            <button
                                onClick={() => setIsSuccessOpen(true)}
                                className="flex-1 px-5 py-3 bg-[#137fec] text-white text-sm font-bold rounded-xl hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">check_circle</span>
                                Mark Complete
                            </button>
                        </div>
                    </div>

                    {/* Job Description */}
                    <section className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">description</span>
                            Job Description
                        </h2>
                        <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300">
                            <p className="mb-4">{jobDetail.description}</p>
                            <div className="bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 p-4 rounded-r-lg">
                                <p className="text-sm font-medium text-amber-800 dark:text-amber-400 mb-1">Client Note:</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 italic">{jobDetail.clientNote}</p>
                            </div>
                        </div>
                    </section>

                    {/* Attachments */}
                    <section className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">image</span>
                            Attachments &amp; Media
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {jobDetail.attachments.map((attachment, index) => (
                                <div
                                    key={index}
                                    className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
                                >
                                    <img
                                        alt={`AC Unit Issue ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        src={attachment}
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span className="material-symbols-outlined text-white">visibility</span>
                                    </div>
                                </div>
                            ))}
                            <div className="aspect-square rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:text-[#137fec] hover:border-[#137fec] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                                <span className="material-symbols-outlined mb-1">upload_file</span>
                                <span className="text-xs font-bold">Add Photo</span>
                            </div>
                        </div>
                    </section>

                    {/* Suggested Tools */}
                    <section className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">home_repair_service</span>
                            Suggested Tools &amp; Parts
                        </h2>
                        <ul className="space-y-3">
                            {jobDetail.suggestedTools.map((tool, index) => (
                                <li
                                    key={index}
                                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800"
                                >
                                    <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-sm">{tool.icon}</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{tool.name}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Current Actions - Desktop */}
                    <div className="hidden lg:block bg-white dark:bg-[#101922] rounded-2xl border border-amber-200 dark:border-amber-900/50 p-6 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Current Actions</h3>
                        <div className="space-y-3">
                            <button className="w-full px-5 py-3 bg-[#137fec] text-white text-sm font-bold rounded-xl hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">check_circle</span>
                                Mark as Completed
                            </button>
                            <button className="w-full px-5 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-amber-500">warning</span>
                                Report an Issue
                            </button>
                        </div>
                    </div>

                    {/* Schedule */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">schedule</span>
                            Schedule
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-lg p-3 w-16">
                                <span className="text-xs font-bold text-slate-500 uppercase">{jobDetail.schedule.month}</span>
                                <span className="text-xl font-extrabold text-slate-900 dark:text-white">{jobDetail.schedule.day}</span>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-900 dark:text-white">{jobDetail.schedule.dayText}</p>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{jobDetail.schedule.time}</p>
                            </div>
                        </div>
                        <button className="w-full py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px] text-slate-800 dark:text-slate-400">calendar_clock</span>
                            Request Reschedule
                        </button>
                    </div>

                    {/* Property Details */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">location_on</span>
                            Property Details
                        </h3>
                        <div className="mb-4 rounded-xl overflow-hidden h-32 w-full relative">
                            <img
                                alt="Map Location"
                                className="w-full h-full object-cover"
                                src={jobDetail.property.mapImage}
                            />
                            <div className="absolute inset-0 bg-black/10"></div>
                            <div className="absolute bottom-2 right-2 bg-white dark:bg-slate-900 p-1.5 rounded-lg shadow-sm cursor-pointer hover:bg-slate-100">
                                <span className="material-symbols-outlined text-slate-700 dark:text-white text-sm">open_in_new</span>
                            </div>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white mb-1">{jobDetail.property.name}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{jobDetail.property.unit}</p>
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                            <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Access Instructions</h4>
                            <div className="flex items-start gap-2">
                                <span className="material-symbols-outlined text-slate-400 text-sm mt-0.5">key</span>
                                <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">
                                    {jobDetail.property.accessInstructions}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                            <button className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-slate-800 dark:text-slate-400">directions</span>
                                Directions
                            </button>
                        </div>
                    </div>

                    {/* Client Details */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">person</span>
                            Client Details
                        </h3>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="size-12 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                                {jobDetail.client.initials}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 dark:text-white">{jobDetail.client.name}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {jobDetail.client.role} • {jobDetail.client.rating} <span className="text-amber-400">★</span>
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button className="flex-1 py-2.5 bg-[#137fec]/10 text-[#137fec] hover:bg-[#137fec]/20 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">call</span>
                                Call
                            </button>
                            <button className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-slate-800 dark:text-slate-400">chat</span>
                                Message
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Complete Success Celebration */}
            <SuccessCelebration
                isOpen={isSuccessOpen}
                onClose={() => {
                    setIsSuccessOpen(false);
                    navigate('/agent/my-jobs');
                }}
                title="Job Completed!"
                description="Great work! Your job has been marked as complete. Payment will be released within 24-48 hours."
                buttonText="Back to My Jobs"
                icon="check_circle"
            />
        </PageContainer>
    );
}
