import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'

export function LandlordFinancials() {
    const transactions = [
        { id: '1', type: 'income', description: 'Rent - Highland Park 4B', amount: 3200, date: '2024-10-01', tenant: 'Sarah Johnson' },
        { id: '2', type: 'income', description: 'Rent - Downtown Loft', amount: 2800, date: '2024-10-01', tenant: 'Mike Davis' },
        { id: '3', type: 'expense', description: 'Maintenance - Plumbing', amount: 450, date: '2024-09-28', property: 'Downtown Loft' },
        { id: '4', type: 'income', description: 'Late Fee', amount: 150, date: '2024-09-25', tenant: 'Mike Davis' },
        { id: '5', type: 'expense', description: 'Property Tax Q3', amount: 1200, date: '2024-09-15', property: 'All Properties' },
    ]

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Financials
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Track your property income and expenses
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <span className="material-symbols-outlined text-[20px]">file_download</span>
                        Export Report
                    </Button>
                    <Button variant="secondary">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        Add Expense
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Revenue (Oct)"
                    value="$9,350"
                    icon="trending_up"
                    iconBgColor="bg-green-50 dark:bg-green-900/20"
                    iconColor="text-green-600 dark:text-green-400"
                    trend={{ value: "+8.2%", isPositive: true }}
                />
                <StatCard
                    title="Total Expenses (Oct)"
                    value="$1,650"
                    icon="trending_down"
                    iconBgColor="bg-red-50 dark:bg-red-900/20"
                    iconColor="text-red-600 dark:text-red-400"
                    trend={{ value: "-12%", isPositive: true }}
                />
                <StatCard
                    title="Net Income (Oct)"
                    value="$7,700"
                    icon="account_balance"
                    iconBgColor="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-600 dark:text-blue-400"
                />
                <StatCard
                    title="Outstanding Balance"
                    value="$2,800"
                    icon="pending"
                    iconBgColor="bg-amber-50 dark:bg-amber-900/20"
                    iconColor="text-amber-600 dark:text-amber-400"
                    badge={<Badge variant="warning">1 Late</Badge>}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Transactions List */}
                <div className="xl:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
                        <div className="flex gap-2">
                            {['All', 'Income', 'Expenses'].map((filter, i) => (
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
                                    <div className={`size-10 rounded-xl flex items-center justify-center ${tx.type === 'income'
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-600'
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-600'
                                        }`}>
                                        <span className="material-symbols-outlined text-[20px]">
                                            {tx.type === 'income' ? 'arrow_downward' : 'arrow_upward'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">{tx.description}</p>
                                        <p className="text-sm text-slate-500">
                                            {tx.tenant || tx.property} • {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                                <p className={`text-lg font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                    {/* Income by Property */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Income by Property</h3>
                        <div className="space-y-4">
                            {[
                                { property: 'Highland Park 4B', income: 3200, percentage: 53 },
                                { property: 'Downtown Loft', income: 2800, percentage: 47 },
                            ].map((item) => (
                                <div key={item.property}>
                                    <div className="flex justify-between mb-1">
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{item.property}</span>
                                        <span className="text-sm font-bold text-slate-900 dark:text-white">${item.income.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-5">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <Button variant="outline" className="w-full justify-start">
                                <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                                Generate Invoice
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <span className="material-symbols-outlined text-[18px]">notifications</span>
                                Send Payment Reminder
                            </Button>
                            <Button variant="outline" className="w-full justify-start">
                                <span className="material-symbols-outlined text-[18px]">summarize</span>
                                Monthly Statement
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
