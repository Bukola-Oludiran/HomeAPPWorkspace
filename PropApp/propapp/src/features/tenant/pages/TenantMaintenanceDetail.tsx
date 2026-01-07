import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ConfirmationModal from '../../../components/ConfirmationModal';
import PageContainer from '../../../components/common/PageContainer';

// Mock maintenance request data
const requestData = {
    id: 'REQ-2024-001',
    title: 'Leaky Faucet',
    status: 'In Progress',
    statusColor: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    dateSubmitted: 'Oct 24, 2024',
    category: 'Plumbing',
    urgency: 'Medium',
    urgencyColor: 'text-orange-600 dark:text-orange-400',
    description: "The kitchen sink is dripping constantly into the cabinet below. I've placed a bucket underneath but it fills up every few hours. The wood in the cabinet is starting to warp slightly. Please address this as soon as possible to prevent mold.",
    property: {
        name: '5500 Highland Park',
        unit: 'Unit 4B',
        address: '5500 Highland Park Blvd, Miami FL',
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9e_2ULRQ227PvtVeIOD_4NZZMh0g-OUNXmXzn_TfV8Ndro3xbNF2jbh6HgeeSNsENiaG9Y8OZI2uFVETjB4ZipmBBq2Ls0O24nYbxnWaFTNZFcws1owDG2pA-rIQIYiLJJhgpYVw7laejncko84gJKTE_Ykfs6ozHSotR_D6Jy73nmn_r6UQFh8PUWUd_1IyFNgBCzhRVBi18lsXl33xVxb0VCkNsueqMJVooBmVehpEBo_dZ1_JQBz5upmi23mmPxTrYcma7BgPS',
    },
    vendor: {
        name: "Mike's Plumbing",
        type: 'Licensed Vendor',
        icon: 'plumbing',
    },
    manager: {
        name: 'Robert Johnson',
        initials: 'RJ',
    },
    timeline: [
        { date: 'Oct 26, 2024 - 10:00 AM', title: 'Maintenance In Progress', description: 'Technician arrived on site. Started diagnosis of the pipe leakage.', icon: 'build', iconColor: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' },
        { date: 'Oct 25, 2024 - 09:15 AM', title: 'Visit Scheduled', description: "Appointment scheduled with Mike's Plumbing Services for Oct 26, 10:00 AM - 12:00 PM.", icon: 'event', iconColor: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' },
        { date: 'Oct 24, 2024 - 4:00 PM', title: 'Request Reviewed', description: 'Property Manager (Robert Johnson) reviewed the request and assigned it to a vendor.', icon: 'assignment_turned_in', iconColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
        { date: 'Oct 24, 2024 - 2:30 PM', title: 'Request Submitted', description: 'You submitted a new maintenance request.', icon: 'send', iconColor: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' },
    ],
    messages: [
        { id: 1, from: 'manager', name: 'Robert Johnson', message: "Hi! I've contacted the plumber. They should be reaching out to schedule a time shortly.", time: 'Oct 24, 4:05 PM' },
        { id: 2, from: 'user', message: "Great, thanks Robert. I'll be home all day tomorrow.", time: 'Oct 24, 4:10 PM' },
        { id: 3, from: 'vendor', name: "Mike's Plumbing Services", message: 'Appointment confirmed for Oct 26, 10:00 AM - 12:00 PM. Please ensure access to the unit.', time: 'Oct 25, 9:15 AM' },
    ],
};

export default function TenantMaintenanceDetail() {
    const { id } = useParams();
    const [newMessage, setNewMessage] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    console.log('Request ID:', id);

    return (
        <PageContainer maxWidth="lg">
            <ConfirmationModal
                isOpen={showCancelModal}
                onClose={() => setShowCancelModal(false)}
                onConfirm={() => console.log('Request cancelled')}
                title="Cancel Maintenance Request?"
                description="Are you sure you want to cancel this maintenance request? The vendor will be notified and any scheduled visit will be cancelled."
                confirmText="Cancel Request"
                icon="cancel"
            />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-2 text-slate-500 dark:text-slate-400 text-sm font-medium">
                        <Link to="/tenant/my-home" className="hover:text-[#137fec] transition-colors">My Home</Link>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="hover:text-[#137fec] transition-colors cursor-pointer">Maintenance</span>
                        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        <span className="text-slate-900 dark:text-white">{requestData.title} (#{requestData.id})</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                            {requestData.title}
                        </h1>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${requestData.statusColor} border gap-1.5`}>
                            <span className="animate-pulse w-2 h-2 rounded-full bg-amber-500"></span>
                            {requestData.status}
                        </span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#101922] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">upload_file</span>
                        Add Files
                    </button>
                    <button className="px-4 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
                        Update
                    </button>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Request Details */}
                    <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#137fec]">description</span>
                            Request Details
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                            <div>
                                <span className="block text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Date Submitted</span>
                                <span className="font-bold text-slate-900 dark:text-white">{requestData.dateSubmitted}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Category</span>
                                <span className="font-bold text-slate-900 dark:text-white">{requestData.category}</span>
                            </div>
                            <div>
                                <span className="block text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Urgency</span>
                                <span className={`inline-flex items-center gap-1.5 font-bold ${requestData.urgencyColor}`}>
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    {requestData.urgency}
                                </span>
                            </div>
                            <div>
                                <span className="block text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wide mb-1">Request ID</span>
                                <span className="font-mono text-slate-500 dark:text-slate-400">#{requestData.id}</span>
                            </div>
                        </div>
                        <div className="mb-6">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Description</h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                {requestData.description}
                            </p>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Attached Media</h3>
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                <div className="relative w-32 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group overflow-hidden cursor-pointer">
                                    <span className="material-symbols-outlined text-slate-400">image</span>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </div>
                                </div>
                                <div className="relative w-32 h-24 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group overflow-hidden cursor-pointer">
                                    <span className="material-symbols-outlined text-slate-400">image</span>
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">visibility</span>
                                    </div>
                                </div>
                                <button className="w-32 h-24 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center text-slate-500 hover:text-[#137fec] hover:border-[#137fec] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all gap-1">
                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                    <span className="text-[10px] font-bold uppercase">Add More</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Activity Timeline */}
                    <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#137fec]">history</span>
                            Activity Timeline
                        </h2>
                        <ol className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8">
                            {requestData.timeline.map((event, index) => (
                                <li key={index} className="ml-6">
                                    <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-[1.1rem] ring-4 ring-white dark:ring-[#101922] ${event.iconColor}`}>
                                        <span className="material-symbols-outlined text-[18px]">{event.icon}</span>
                                    </span>
                                    <h3 className="flex items-center mb-1 text-sm font-bold text-slate-900 dark:text-white">{event.title}</h3>
                                    <time className="block mb-2 text-xs font-normal leading-none text-slate-400">{event.date}</time>
                                    <p className="text-sm font-normal text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        {event.description}
                                    </p>
                                </li>
                            ))}
                        </ol>
                    </div>

                    {/* Communication Log */}
                    <div className="bg-white dark:bg-[#101922] p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#137fec]">forum</span>
                            Communication Log
                        </h2>
                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                            {requestData.messages.map((msg) => (
                                <div key={msg.id} className={`flex gap-3 ${msg.from === 'user' ? 'flex-row-reverse' : ''}`}>
                                    {msg.from === 'manager' && (
                                        <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                                            <span className="material-symbols-outlined text-sm">person</span>
                                        </div>
                                    )}
                                    {msg.from === 'user' && (
                                        <div className="size-8 rounded-full bg-[#137fec] flex items-center justify-center text-white shrink-0">
                                            <span className="material-symbols-outlined text-sm">face</span>
                                        </div>
                                    )}
                                    {msg.from === 'vendor' && (
                                        <div className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                                            <span className="material-symbols-outlined text-sm">engineering</span>
                                        </div>
                                    )}
                                    <div className={msg.from === 'user' ? 'flex flex-col items-end' : ''}>
                                        <div className={`p-3.5 rounded-2xl text-sm ${msg.from === 'user'
                                            ? 'bg-[#137fec]/10 dark:bg-[#137fec]/20 rounded-tr-none text-slate-900 dark:text-white border border-[#137fec]/10 dark:border-[#137fec]/20'
                                            : msg.from === 'vendor'
                                                ? 'bg-purple-50 dark:bg-purple-900/20 rounded-tl-none text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-purple-800/30'
                                                : 'bg-slate-100 dark:bg-slate-800 rounded-tl-none text-slate-700 dark:text-slate-300'
                                            }`}>
                                            {msg.from === 'vendor' && (
                                                <span className="font-bold block text-purple-700 dark:text-purple-400 text-xs mb-1">{msg.name}</span>
                                            )}
                                            {msg.message}
                                        </div>
                                        <div className={`text-[10px] text-slate-400 mt-1 ${msg.from === 'user' ? 'pr-1' : 'pl-1'}`}>
                                            {msg.from === 'manager' ? `${msg.name} • ` : msg.from === 'vendor' ? 'System Update • ' : 'You • '}
                                            {msg.time}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="relative">
                            <textarea
                                className="w-full p-3 pr-12 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-[#137fec]/20 focus:border-[#137fec] outline-none min-h-[50px] resize-none leading-relaxed transition-colors"
                                placeholder="Type a message or update..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button className="absolute right-2 bottom-2 size-8 flex items-center justify-center bg-[#137fec] hover:bg-[#137fec]/90 text-white rounded-lg transition-colors">
                                <span className="material-symbols-outlined text-[18px]">send</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="space-y-6">
                    {/* Property Card */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="h-32 bg-slate-200 dark:bg-slate-700 relative">
                            <img
                                alt="Property"
                                className="w-full h-full object-cover"
                                src={requestData.property.image}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            <div className="absolute bottom-3 left-4 text-white">
                                <h3 className="font-bold text-lg leading-tight">{requestData.property.name}</h3>
                                <p className="text-xs opacity-90">{requestData.property.unit}</p>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-3">
                                <span className="material-symbols-outlined text-slate-400 text-[18px]">location_on</span>
                                <span>{requestData.property.address}</span>
                            </div>
                            <Link
                                to="/tenant/my-home"
                                className="w-full py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors block text-center"
                            >
                                View Property Details
                            </Link>
                        </div>
                    </div>

                    {/* Assigned Vendor */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-4">Assigned Vendor</h3>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                                <span className="material-symbols-outlined">{requestData.vendor.icon}</span>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{requestData.vendor.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{requestData.vendor.type}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 bg-[#137fec]/10 hover:bg-[#137fec]/20 text-[#137fec] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">call</span>
                                Call
                            </button>
                            <button className="flex-1 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px]">mail</span>
                                Email
                            </button>
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Property Manager</h3>
                            <div className="flex items-center gap-3">
                                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-xs font-bold">
                                    {requestData.manager.initials}
                                </div>
                                <h4 className="text-sm font-medium text-slate-900 dark:text-white">{requestData.manager.name}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white dark:bg-[#101922] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Actions</h3>
                        <div className="space-y-2">
                            <button className="w-full py-2.5 px-4 rounded-lg bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/30 text-sm font-bold transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                Mark as Resolved
                            </button>
                            <button className="w-full py-2.5 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[18px]">event_busy</span>
                                Reschedule
                            </button>
                            <button
                                onClick={() => setShowCancelModal(true)}
                                className="w-full py-2.5 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 dark:text-red-400 border border-transparent hover:border-red-200 dark:hover:border-red-800/30 text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <span className="material-symbols-outlined text-[18px]">cancel</span>
                                Cancel Request
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
