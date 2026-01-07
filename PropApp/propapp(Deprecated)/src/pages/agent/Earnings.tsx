import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

export function AgentEarnings() {
    const transactions = [
        { id: '1', date: '2024-12-14', description: 'VIP Property Tour', amount: 25000, status: 'completed' },
        { id: '2', date: '2024-12-13', description: 'AC Repair - Emergency', amount: 15000, status: 'completed' },
        { id: '3', date: '2024-12-12', description: 'Move-out Inspection', amount: 8000, status: 'completed' },
        { id: '4', date: '2024-12-11', description: 'Key Handover', amount: 5000, status: 'completed' },
        { id: '5', date: '2024-12-10', description: 'Property Photography', amount: 12000, status: 'pending' },
    ]

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Earnings
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Track your income and payouts
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <span className="material-symbols-outlined text-[20px]">file_download</span>
                        Export
                    </Button>
                    <Button>
                        <span className="material-symbols-outlined text-[20px]">account_balance</span>
                        Withdraw
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Available Balance"
                    value="₦65,000"
                    icon="account_balance_wallet"
                    iconBgColor="bg-green-50 dark:bg-green-900/20"
                    iconColor="text-green-600 dark:text-green-400"
                />
                <StatCard
                    title="This Month"
                    value="₦185,000"
                    icon="trending_up"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                    trend={{ value: "+23%", isPositive: true }}
                />
                <StatCard
                    title="Pending Payout"
                    value="₦12,000"
                    icon="schedule"
                    iconBgColor="bg-amber-50 dark:bg-amber-900/20"
                    iconColor="text-amber-600 dark:text-amber-400"
                    badge={<Badge variant="warning">1 Job</Badge>}
                />
                <StatCard
                    title="Jobs Completed"
                    value="24"
                    icon="task_alt"
                    iconBgColor="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-600 dark:text-purple-400"
                    subtext="This month"
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Transactions */}
                <div className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Earnings</h2>
                        <div className="flex gap-2">
                            {['All', 'Completed', 'Pending'].map((filter, i) => (
                                <button
                                    key={filter}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${i === 0
                                            ? 'bg-primary text-white'
                                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                        }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <Card className="divide-y divide-slate-100 dark:divide-slate-700">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">payments</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{tx.description}</p>
                                        <p className="text-sm text-slate-500">
                                            {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-green-600">+₦{tx.amount.toLocaleString()}</p>
                                    <Badge variant={tx.status === 'completed' ? 'success' : 'warning'}>
                                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Earnings Chart */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Monthly Breakdown</h3>
                        <div className="space-y-4">
                            {[
                                { month: 'December', amount: 185000, percentage: 100 },
                                { month: 'November', amount: 150000, percentage: 81 },
                                { month: 'October', amount: 120000, percentage: 65 },
                            ].map((item) => (
                                <div key={item.month}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-slate-600 dark:text-slate-400">{item.month}</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">₦{item.amount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Payout Methods */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Payout Methods</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <div className="size-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                    <span className="material-symbols-outlined text-[20px]">account_balance</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-slate-900 dark:text-white">First Bank</p>
                                    <p className="text-xs text-slate-500">****4521</p>
                                </div>
                                <Badge variant="success">Default</Badge>
                            </div>
                            <Button variant="outline" className="w-full">
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add New Account
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
