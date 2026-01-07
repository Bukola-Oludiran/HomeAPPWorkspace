import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'

export function TenantDashboard() {
    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Tenant Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Welcome back, Sarah. Here's your rental overview.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <span className="material-symbols-outlined text-[20px]">build</span>
                        Request Maintenance
                    </Button>
                    <Button>
                        <span className="material-symbols-outlined text-[20px]">payments</span>
                        Pay Rent
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Next Rent Payment"
                    value="$2,450"
                    icon="calendar_today"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    badge={<Badge variant="warning">Due Soon</Badge>}
                    subtext="Due: Nov 1, 2024"
                />
                <StatCard
                    title="Lease Status"
                    value="11 Months"
                    icon="contract"
                    iconBgColor="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    badge={<Badge variant="success">Active</Badge>}
                    subtext="Ends: Aug 31, 2025"
                />
                <StatCard
                    title="Open Requests"
                    value="1 Open"
                    icon="home_repair_service"
                    iconBgColor="bg-amber-50 dark:bg-amber-900/20"
                    iconColor="text-amber-600 dark:text-amber-400"
                    subtext="Last update: 2 hrs ago"
                />
                <StatCard
                    title="Applications"
                    value="1 Pending"
                    icon="description"
                    iconBgColor="bg-indigo-50 dark:bg-indigo-900/20"
                    iconColor="text-indigo-600 dark:text-indigo-400"
                    badge={<Badge variant="default">2 Saved</Badge>}
                    subtext="Awaiting approval"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Current Rental */}
                <div className="xl:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Current Rental</h2>
                        <Link to="/tenant/home" className="text-sm text-primary font-semibold hover:underline">
                            View Lease Details
                        </Link>
                    </div>

                    <Card className="overflow-hidden">
                        {/* Property Image */}
                        <div className="relative h-64 w-full">
                            <img
                                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80"
                                alt="Current Property"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-slate-900 dark:text-white shadow-sm flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                                Verified Listing
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">5500 Highland Park, Unit 4B</h3>
                                    <p className="text-slate-500 dark:text-slate-400">Dallas, TX 75205</p>
                                </div>
                                <Button variant="secondary">
                                    <span className="material-symbols-outlined text-[18px]">chat</span>
                                    Message Landlord
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">Monthly Rent</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">$2,450</p>
                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                        <span className="material-symbols-outlined text-[14px]">check</span>
                                        Auto-pay on
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">Lease Period</p>
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">Sep 2024 - Aug 2025</p>
                                    <p className="text-xs text-slate-400 mt-1">12 Months</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">Property Manager</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Avatar fallback="Robert Johnson" size="sm" />
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Robert Johnson</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Maintenance Log</h2>
                    <Card className="p-5 space-y-4">
                        {/* In Progress Item */}
                        <div className="flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="size-8 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[18px]">plumbing</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Leaky Faucet</h4>
                                    <Badge variant="warning">In Progress</Badge>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Plumber scheduled for tomorrow 2PM.
                                </p>
                            </div>
                        </div>

                        {/* Completed Item */}
                        <div className="flex gap-3 items-start opacity-70">
                            <div className="size-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[18px]">check</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">AC Filter Replacement</h4>
                                    <Badge variant="success">Completed</Badge>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Resolved on Sep 15.
                                </p>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full">View All Requests</Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
