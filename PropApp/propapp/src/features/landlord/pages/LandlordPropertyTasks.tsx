import { Link, useParams } from 'react-router-dom';

export default function LandlordPropertyTasks() {
    const { id } = useParams();

    return (
        <>
            {/* Header - Page's own navbar */}
            <header className="fixed top-0 left-0 w-full z-40 bg-white/80 dark:bg-[#101922]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 md:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/landlord/properties/${id}`}
                            className="flex items-center justify-center size-10 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-white"
                        >
                            <span className="material-symbols-outlined">arrow_back</span>
                        </Link>
                        <div className="hidden md:block">
                            <h1 className="text-sm font-bold text-slate-900 dark:text-white">Modern Oakwood Estate</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400">1243 Oakwood Avenue, Austin, TX</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center justify-center size-10 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-900 dark:text-white relative">
                            <span className="material-symbols-outlined">notifications</span>
                            <span className="absolute top-2 right-2 size-2.5 bg-red-500 rounded-full border-2 border-slate-100 dark:border-slate-800"></span>
                        </button>
                        <div className="size-10 rounded-full bg-[#137fec]/10 flex items-center justify-center text-[#137fec] font-bold border border-[#137fec]/20">
                            JD
                        </div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-[1200px] mx-auto px-4 md:px-8 pt-24 pb-8 flex-1">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-800 dark:text-slate-300 mb-1">
                            <span>Properties</span>
                            <span className="material-symbols-outlined text-[14px] text-slate-800 dark:text-slate-300">chevron_right</span>
                            <span>Modern Oakwood Estate</span>
                            <span className="material-symbols-outlined text-[14px] text-slate-800 dark:text-slate-300">chevron_right</span>
                            <span className="text-slate-900 dark:text-white font-medium">Tasks</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">All Property Tasks</h2>
                    </div>
                    <button className="px-5 py-2.5 bg-[#137fec] hover:bg-[#0e64bd] text-white font-bold rounded-xl shadow-lg shadow-[#137fec]/25 transition-colors flex items-center gap-2">
                        <span className="material-symbols-outlined">add</span>
                        New Task
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                    <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                            <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-[#137fec]">
                                <span className="material-symbols-outlined">assignment</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Total Tasks</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">24</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-900/50 shadow-sm flex items-center gap-3">
                            <div className="size-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Overdue</p>
                                <p className="text-xl font-bold text-red-600 dark:text-red-400">3</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                            <div className="size-10 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500">
                                <span className="material-symbols-outlined">schedule</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Pending</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">8</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                            <div className="size-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-500">
                                <span className="material-symbols-outlined">check_circle</span>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-wide">Completed</p>
                                <p className="text-xl font-bold text-slate-900 dark:text-white">13</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                        <input
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#137fec] focus:border-transparent outline-none text-slate-900 dark:text-white"
                            placeholder="Search tasks by name, assignee..."
                            type="text"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer min-w-max">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">filter_list</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status: All</span>
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">arrow_drop_down</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer min-w-max">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">priority_high</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Priority: All</span>
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">arrow_drop_down</span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer min-w-max">
                            <span className="material-symbols-outlined text-slate-500 text-[18px]">category</span>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Type: All</span>
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">arrow_drop_down</span>
                        </div>
                    </div>
                </div>

                {/* Tasks Table */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Task Details</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Priority</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {/* Row 1 - Overdue */}
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                                                <span className="material-symbols-outlined text-[18px]">plumbing</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">Fix Leaky Faucet</p>
                                                <p className="text-xs text-slate-500">Master Bathroom</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-red-600 font-medium flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">event_busy</span>
                                            Yesterday
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
                                            Overdue
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded w-fit">
                                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                                            High
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold">JP</div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">John's Plumbing</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-[#137fec] hover:text-[#137fec] text-slate-400 transition-colors" title="Mark Complete">
                                                <span className="material-symbols-outlined text-[18px]">check</span>
                                            </button>
                                            <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-[#137fec] hover:text-[#137fec] text-slate-400 transition-colors" title="Edit Task">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-[#137fec] hover:text-[#137fec] text-slate-400 transition-colors" title="Remind Vendor">
                                                <span className="material-symbols-outlined text-[18px]">notification_important</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Row 2 - Pending Approval */}
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                                <span className="material-symbols-outlined text-[18px]">description</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">Approve Lease Renewal</p>
                                                <p className="text-xs text-slate-500">Anderson Family</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                                            Tomorrow, 5:00 PM
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                                            Pending Approval
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 px-2 py-1 rounded w-fit">
                                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                                            Medium
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-[#137fec]/10 flex items-center justify-center text-[10px] font-bold text-[#137fec]">ME</div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">Self</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="px-3 py-1 rounded-lg bg-[#137fec] text-white text-xs font-bold hover:bg-[#0e64bd] transition-colors">Review</button>
                                            <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-[#137fec] hover:text-[#137fec] text-slate-400 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">more_vert</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Row 3 - Scheduled */}
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1.5 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                                                <span className="material-symbols-outlined text-[18px]">cleaning_services</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">Gutter Cleaning</p>
                                                <p className="text-xs text-slate-500">Seasonal Maintenance</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            Nov 15, 2024
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                            Scheduled
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit">
                                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                                            Low
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold">CC</div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">CleanCo Inc.</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-[#137fec] hover:text-[#137fec] text-slate-400 transition-colors" title="View Details">
                                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Row 4 - In Progress */}
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1.5 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                                <span className="material-symbols-outlined text-[18px]">format_paint</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">Repaint Guest Bedroom</p>
                                                <p className="text-xs text-slate-500">Tenant Request</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            Nov 20, 2024
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                            In Progress
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/10 px-2 py-1 rounded w-fit">
                                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                                            Medium
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold">HA</div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">HandyAnd Services</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-[#137fec] hover:text-[#137fec] text-slate-400 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">chat</span>
                                            </button>
                                            <button className="size-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 hover:border-[#137fec] hover:text-[#137fec] text-slate-400 transition-colors">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>

                                {/* Row 5 - Completed */}
                                <tr className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors opacity-60 hover:opacity-100">
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-0.5 p-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                                                <span className="material-symbols-outlined text-[18px]">detector_smoke</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white line-through decoration-slate-400">Smoke Detector Check</p>
                                                <p className="text-xs text-slate-500">Annual Safety Inspection</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-500 dark:text-slate-500 font-medium">
                                            Oct 01, 2024
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 flex items-center w-fit gap-1">
                                            <span className="material-symbols-outlined text-[14px]">check</span> Completed
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded w-fit grayscale">
                                            <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>flag</span>
                                            High
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="size-6 rounded-full bg-[#137fec]/10 flex items-center justify-center text-[10px] font-bold text-[#137fec]">ME</div>
                                            <span className="text-sm text-slate-600 dark:text-slate-300">Self</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="text-xs text-[#137fec] font-bold hover:underline">View Receipt</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                        <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900 dark:text-white">1-5</span> of <span className="font-bold text-slate-900 dark:text-white">24</span> tasks</p>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-sm hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
                            <button className="px-3 py-1 rounded border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white text-sm hover:bg-white dark:hover:bg-slate-800 font-medium">Next</button>
                        </div>
                    </div>
                </div>
            </main>

            {/* AI Assistant Bar */}
            <div className="fixed bottom-[40px] left-0 right-0 flex justify-center z-30 px-4 pointer-events-none">
                <div className="w-full max-w-2xl bg-white/95 dark:bg-[#101922]/95 backdrop-blur-xl border border-[#137fec]/20 shadow-2xl shadow-[#137fec]/10 rounded-full py-2 px-2 flex items-center gap-3 pointer-events-auto transition-all hover:scale-[1.01]" style={{ boxShadow: '0 0 15px rgba(19, 127, 236, 0.4)' }}>
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#137fec] to-blue-400 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-white">auto_awesome</span>
                    </div>
                    <div className="flex-1 overflow-hidden h-10 flex items-center">
                        <p className="text-slate-600 dark:text-slate-300 text-sm truncate animate-pulse">
                            Draft a reminder for the leak repair, schedule lease renewal, or prioritize overdue items...
                        </p>
                    </div>
                    <button className="size-10 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors shrink-0">
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">mic</span>
                    </button>
                    <button className="size-10 rounded-full bg-[#137fec] hover:bg-[#0e64bd] flex items-center justify-center transition-colors shrink-0 shadow-lg shadow-[#137fec]/30">
                        <span className="material-symbols-outlined text-white">arrow_upward</span>
                    </button>
                </div>
            </div>
        </>
    );
}
