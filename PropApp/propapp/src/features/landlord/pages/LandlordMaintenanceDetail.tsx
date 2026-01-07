import { Link, useParams } from 'react-router-dom';
import PageContainer from '../../../components/common/PageContainer';

// Mock maintenance request data
const maintenanceRequest = {
    id: 'MR-8921',
    title: 'Water Leak in Master Bathroom',
    status: 'in-progress',
    statusLabel: 'In Progress',
    urgency: 'high',
    urgencyLabel: 'High Urgency',
    submittedDate: 'Oct 24, 2023 at 09:15 AM',
    property: {
        name: '1243 Oakwood Avenue',
        location: 'Austin, TX • Unit 4B',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBLkek33Arklj-USfcZgsPPZBOtl1xgDJAc8qsaWZ51gxbtpP66zlBLUyVnWMpQ-RJU5fAKgdnj0tinIhcrgAuGWf_niUPah6-Hj6KCuAOZJ1oJeGLHdy_jbHn5xP6TCcvkQ0v6oV6MWpgzwG1uQh7warVguTEVUbQUB9wMrWkVh9U5_S11vnDM5dVGchCc5Fy0-1NtBVIsr5FxhqIlixEvd_nVwqEC79YUlQwHMv9eJt54ZPwjFYLaoQKEBsFjNqbqRuketxBrs4l',
    },
    tenant: {
        name: 'Sarah Johnson',
        initials: 'SJ',
        verified: true,
        leaseEnd: 'Nov 2024',
    },
    description: `"I came home from work around 6 PM and noticed water dripping from the ceiling in the master bathroom, right above the vanity. There is a small puddle forming on the floor. I've placed a bucket underneath for now, but the dripping seems to be getting faster. It might be coming from the unit upstairs."`,
    vendor: {
        name: 'Speedy Fix Plumbing',
        icon: 'plumbing',
        rating: 4.8,
        jobs: 24,
        responseTime: '2 hours',
    },
    estimatedCost: '$150 - $300',
    timeline: [
        { id: 1, time: 'Today, 10:30 AM', title: 'Vendor On-Site', description: 'Speedy Fix Plumbing has checked in at the property.', color: 'bg-amber-500' },
        { id: 2, time: 'Today, 09:45 AM', title: 'Vendor Assigned', description: 'You assigned Speedy Fix Plumbing to this request.', color: 'bg-blue-500' },
        { id: 3, time: 'Oct 24, 09:30 AM', title: 'Viewed by Landlord', description: "Status changed from 'New' to 'In Review'.", color: 'bg-slate-300 dark:bg-slate-600' },
        { id: 4, time: 'Oct 24, 09:15 AM', title: 'Request Submitted', description: 'Tenant submitted a new maintenance request.', color: 'bg-slate-300 dark:bg-slate-600' },
    ],
    messages: [
        { id: 1, from: 'tenant', name: 'Sarah Johnson (Tenant)', initials: 'SJ', time: 'Oct 24, 09:20 AM', text: "Is there an ETA on when someone can come look at this? It's dripping pretty fast." },
        { id: 2, from: 'landlord', name: 'You', time: 'Oct 24, 09:40 AM', text: "Hi Sarah, I've just contacted a plumber. They should be reaching out to you shortly to schedule a time. Please keep the bucket there for now." },
    ],
};

export default function LandlordMaintenanceDetail() {
    const { id } = useParams();
    console.log('Maintenance ID:', id);

    return (
        <PageContainer>
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-400 mb-6">
                <Link to="/landlord/dashboard" className="hover:text-[#137fec] transition-colors">Dashboard</Link>
                <span className="material-symbols-outlined text-[16px] text-slate-800 dark:text-slate-400">chevron_right</span>
                <Link to="/landlord/alerts" className="hover:text-[#137fec] transition-colors">Maintenance</Link>
                <span className="material-symbols-outlined text-[16px] text-slate-800 dark:text-slate-400">chevron_right</span>
                <span className="text-slate-900 dark:text-white font-medium">Request #{maintenanceRequest.id}</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {maintenanceRequest.title}
                        </h1>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            {maintenanceRequest.statusLabel}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">priority_high</span>
                            {maintenanceRequest.urgencyLabel}
                        </span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-800">
                        Request #{maintenanceRequest.id} • Submitted on {maintenanceRequest.submittedDate}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 bg-slate-50">
                        <span className="material-symbols-outlined text-[20px]">cancel</span>
                        Cancel Request
                    </button>
                    <button className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Mark as Resolved
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Property & Tenant Info */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                            <div className="p-6 flex gap-4 items-start">
                                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                                    <img
                                        alt="Property thumbnail"
                                        className="w-full h-full object-cover"
                                        src={maintenanceRequest.property.image}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Property</h3>
                                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{maintenanceRequest.property.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{maintenanceRequest.property.location}</p>
                                    <Link to="/landlord/properties/1" className="text-sm font-semibold text-[#137fec] hover:underline flex items-center gap-1">
                                        View Property Details <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                    </Link>
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Tenant Details</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-lg">
                                        {maintenanceRequest.tenant.initials}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                            {maintenanceRequest.tenant.name}
                                            {maintenanceRequest.tenant.verified && (
                                                <span className="material-symbols-outlined text-blue-500 text-[16px]" title="Verified Tenant">verified</span>
                                            )}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Lease ends {maintenanceRequest.tenant.leaseEnd}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined text-[16px] text-slate-800 dark:text-slate-400">call</span> Call
                                    </button>
                                    <button className="flex-1 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors">
                                        <span className="material-symbols-outlined text-[16px] text-slate-800 dark:text-slate-400">mail</span> Message
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Request Details */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">description</span>
                            Request Details
                        </h3>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-6">
                            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                {maintenanceRequest.description}
                            </p>
                        </div>
                        <h4 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Attached Media</h4>
                        <div className="flex gap-4 overflow-x-auto pb-2">
                            <div className="relative group w-32 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200 dark:bg-slate-700">
                                    <span className="material-symbols-outlined">image</span>
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button className="text-white hover:text-[#137fec] transition-colors"><span className="material-symbols-outlined">visibility</span></button>
                                    <button className="text-white hover:text-[#137fec] transition-colors"><span className="material-symbols-outlined">download</span></button>
                                </div>
                            </div>
                            <div className="relative group w-32 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-200 dark:bg-slate-700">
                                    <span className="material-symbols-outlined">videocam</span>
                                </div>
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button className="text-white hover:text-[#137fec] transition-colors"><span className="material-symbols-outlined">play_circle</span></button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="material-symbols-outlined text-slate-400">history</span>
                                Activity Timeline
                            </h3>
                            <button className="text-xs font-bold text-[#137fec] hover:underline">Add Note</button>
                        </div>
                        <div className="relative pl-6 border-l-2 border-slate-100 dark:border-slate-800 space-y-8">
                            {maintenanceRequest.timeline.map((item) => (
                                <div key={item.id} className="relative">
                                    <div className={`absolute -left-[31px] top-1 size-4 rounded-full ${item.color} border-4 border-white dark:border-[#101922]`}></div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 mb-0.5">{item.time}</p>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Communication Log */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">forum</span>
                            Communication Log
                        </h3>
                        <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                            {maintenanceRequest.messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-4 ${msg.from === 'landlord' ? 'flex-row-reverse' : ''}`}>
                                    {msg.from === 'tenant' ? (
                                        <div className="size-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-xs font-bold text-slate-600 mt-1">
                                            {msg.initials}
                                        </div>
                                    ) : (
                                        <div className="size-8 rounded-full bg-[#137fec] shrink-0 flex items-center justify-center text-white mt-1">
                                            <span className="material-symbols-outlined text-[16px]">person</span>
                                        </div>
                                    )}
                                    <div className={`p-4 rounded-2xl ${msg.from === 'tenant'
                                        ? 'bg-slate-50 dark:bg-slate-800 rounded-tl-none'
                                        : 'bg-blue-50 dark:bg-blue-900/20 rounded-tr-none border border-blue-100 dark:border-blue-800'
                                        }`}>
                                        <div className="flex justify-between items-center mb-1 gap-4">
                                            <span className={`text-xs font-bold ${msg.from === 'landlord' ? 'text-[#137fec] dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>
                                                {msg.name}
                                            </span>
                                            <span className="text-[10px] text-slate-400">{msg.time}</span>
                                        </div>
                                        <p className={`text-sm ${msg.from === 'landlord' ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}>
                                            {msg.text}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Type a message or internal note..."
                                    className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                                <button className="absolute right-2 top-1.5 p-1.5 bg-[#137fec] text-white rounded-lg hover:bg-[#137fec]/90 transition-colors">
                                    <span className="material-symbols-outlined text-[18px]">send</span>
                                </button>
                            </div>
                            <div className="flex gap-4 mt-2 px-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="msg-type" defaultChecked className="text-[#137fec] focus:ring-[#137fec]" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Message Tenant</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="msg-type" className="text-amber-500 focus:ring-amber-500" />
                                    <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Internal Note</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    {/* Actions */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 sticky top-24">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Actions</h3>
                        <div className="flex flex-col gap-3">
                            <button className="w-full py-3 px-4 bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#137fec]/20 transition-all flex items-center justify-between group">
                                Schedule Maintenance
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">calendar_clock</span>
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-50 dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 hover:border-[#137fec] hover:text-[#137fec] text-slate-800 dark:text-slate-300 font-bold text-sm rounded-xl transition-all flex items-center justify-between">
                                Send Update to Tenant
                                <span className="material-symbols-outlined text-slate-800 dark:text-slate-400">send</span>
                            </button>
                            <button className="w-full py-3 px-4 bg-slate-50 dark:bg-[#1a2632] border border-slate-200 dark:border-slate-700 hover:border-amber-500 hover:text-amber-600 text-slate-800 dark:text-slate-300 font-bold text-sm rounded-xl transition-all flex items-center justify-between">
                                Report Issue with Vendor
                                <span className="material-symbols-outlined text-slate-800 dark:text-slate-400">flag</span>
                            </button>
                        </div>
                        <hr className="my-5 border-slate-100 dark:border-slate-800" />

                        {/* Assigned Vendor */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Assigned Vendor</h3>
                                <button className="text-xs font-bold text-[#137fec] hover:underline">Change</button>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="size-10 bg-white dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-500 shadow-sm">
                                        <span className="material-symbols-outlined">{maintenanceRequest.vendor.icon}</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{maintenanceRequest.vendor.name}</h4>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px] text-amber-400 icon-filled">star</span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{maintenanceRequest.vendor.rating}</span>
                                            <span className="text-xs text-slate-400">({maintenanceRequest.vendor.jobs} jobs)</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="flex-1 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                                        Contact
                                    </button>
                                    <button className="flex-1 py-1.5 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50 flex gap-3">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 shrink-0">info</span>
                                <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
                                    This vendor typically responds within <span className="font-bold">{maintenanceRequest.vendor.responseTime}</span> for emergency requests.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Estimated Cost */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
                        <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl text-white/5 rotate-12">paid</span>
                        <div className="relative z-10">
                            <h4 className="font-bold text-base mb-1">Estimated Cost</h4>
                            <p className="text-xs text-slate-300 mb-3">Based on similar repairs in Austin, TX.</p>
                            <h3 className="text-2xl font-bold mb-4">{maintenanceRequest.estimatedCost}</h3>
                            <button className="w-full py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white font-bold text-xs rounded-lg transition-colors">
                                View Cost Breakdown
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
