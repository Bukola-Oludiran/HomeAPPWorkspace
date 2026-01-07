import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export function AgentJobHistory() {
    const jobs = [
        {
            id: '1',
            title: 'VIP Client Property Tour',
            address: 'Victoria Island, Lagos',
            date: '2024-12-14',
            payout: 25000,
            rating: 5,
            status: 'completed',
            type: 'tour',
        },
        {
            id: '2',
            title: 'AC Repair - Emergency',
            address: 'Lekki Phase 1, Lagos',
            date: '2024-12-13',
            payout: 15000,
            rating: 4,
            status: 'completed',
            type: 'repair',
        },
        {
            id: '3',
            title: 'Move-out Inspection',
            address: 'Ikeja GRA, Lagos',
            date: '2024-12-12',
            payout: 8000,
            rating: 5,
            status: 'completed',
            type: 'inspection',
        },
        {
            id: '4',
            title: 'Key Handover to Tenant',
            address: 'Yaba, Lagos',
            date: '2024-12-11',
            payout: 5000,
            rating: 5,
            status: 'completed',
            type: 'handover',
        },
        {
            id: '5',
            title: 'Property Photography',
            address: 'Ikoyi, Lagos',
            date: '2024-12-10',
            payout: 12000,
            rating: null,
            status: 'cancelled',
            type: 'photography',
        },
    ]

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            tour: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
            repair: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600',
            inspection: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
            handover: 'bg-green-100 dark:bg-green-900/20 text-green-600',
            photography: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600',
        }
        return colors[type] || 'bg-slate-100 dark:bg-slate-800 text-slate-600'
    }

    const renderStars = (rating: number | null) => {
        if (rating === null) return <span className="text-slate-400 text-sm">No rating</span>
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        className={`material-symbols-outlined text-[18px] ${star <= rating ? 'text-amber-400 icon-filled' : 'text-slate-300'
                            }`}
                    >
                        star
                    </span>
                ))}
            </div>
        )
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Job History
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Review your past jobs and performance
                    </p>
                </div>
                <Button variant="outline">
                    <span className="material-symbols-outlined text-[20px]">file_download</span>
                    Export History
                </Button>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-slate-900 dark:text-white">156</p>
                    <p className="text-sm text-slate-500">Total Jobs</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-green-600">148</p>
                    <p className="text-sm text-slate-500">Completed</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-amber-500">4.8</p>
                    <p className="text-sm text-slate-500">Avg Rating</p>
                </Card>
                <Card className="p-4 text-center">
                    <p className="text-3xl font-bold text-primary">95%</p>
                    <p className="text-sm text-slate-500">Completion Rate</p>
                </Card>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <Input
                    icon={<span className="material-symbols-outlined text-[18px]">search</span>}
                    placeholder="Search jobs..."
                    className="flex-1"
                />
                <div className="flex gap-2 flex-wrap">
                    {['All', 'Completed', 'Cancelled'].map((filter, i) => (
                        <button
                            key={filter}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${i === 0
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </Card>

            {/* Jobs List */}
            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payout</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Rating</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {jobs.map((job) => (
                                <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-10 rounded-xl flex items-center justify-center ${getTypeColor(job.type)}`}>
                                                <span className="material-symbols-outlined text-[20px]">work</span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white">{job.title}</p>
                                                <p className="text-sm text-slate-500">{job.address}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                        {new Date(job.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-bold ${job.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-green-600'}`}>
                                            ₦{job.payout.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {renderStars(job.rating)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant={job.status === 'completed' ? 'success' : 'error'}>
                                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="outline" size="sm">
                                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
