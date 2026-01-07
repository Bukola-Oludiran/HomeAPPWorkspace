import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export function LandlordDashboard() {
    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Landlord Dashboard
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Welcome back. Here's what's happening with your portfolio today.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <span className="material-symbols-outlined text-[20px]">file_download</span>
                        Report
                    </Button>
                    <Button>
                        <span className="material-symbols-outlined text-[20px]">add_home</span>
                        Add Property
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard
                    title="Total Revenue (Monthly)"
                    value="$24,850"
                    icon="attach_money"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    trend={{ value: "+12.5%", isPositive: true }}
                />
                <StatCard
                    title="Occupancy Rate"
                    value="92%"
                    icon="pie_chart"
                    iconBgColor="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    badge={<Badge variant="default">4 Units Vacant</Badge>}
                />
                <StatCard
                    title="Active Listings"
                    value="12"
                    icon="real_estate_agent"
                    iconBgColor="bg-orange-50 dark:bg-orange-900/20"
                    iconColor="text-orange-600 dark:text-orange-400"
                    badge={<Badge variant="success">2 Pending</Badge>}
                />
                <StatCard
                    title="Action Required"
                    value="3 Alerts"
                    icon="warning"
                    iconBgColor="bg-red-50 dark:bg-red-900/20"
                    iconColor="text-red-600 dark:text-red-400"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Properties List */}
                <div className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Properties</h2>
                        <Link to="/landlord/properties" className="text-sm text-primary font-semibold hover:underline">
                            View All
                        </Link>
                    </div>

                    <Card className="p-0">
                        {/* Property Item */}
                        {[1, 2].map((i) => (
                            <div
                                key={i}
                                className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                            >
                                <img
                                    src={`https://images.unsplash.com/photo-160058515434${i}-be6161a56a0c?w=200&q=80`}
                                    alt="Property"
                                    className="w-24 h-24 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-900 dark:text-white">5500 Highland Park</h3>
                                        <Badge variant={i === 1 ? 'info' : 'success'}>{i === 1 ? 'Rented' : 'Active'}</Badge>
                                    </div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Dallas, TX • Unit 4B</p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-[14px]">bed</span> 2 Beds
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-slate-900 dark:text-white">$3,200<span className="text-xs font-normal text-slate-400">/mo</span></p>
                                    <p className="text-xs text-green-600">Paid on time</p>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Alerts Sidebar */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Actionable Alerts</h2>
                    <Card className="p-5 space-y-4">
                        {/* Alert Item */}
                        <div className="flex gap-3 items-start pb-4 border-b border-slate-100 dark:border-slate-800">
                            <div className="size-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[18px]">build</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Maintenance</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Downtown Loft reported water leak.
                                </p>
                                <div className="flex gap-2 mt-2">
                                    <Button size="sm" variant="danger">Respond</Button>
                                    <Button size="sm" variant="secondary">View</Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
