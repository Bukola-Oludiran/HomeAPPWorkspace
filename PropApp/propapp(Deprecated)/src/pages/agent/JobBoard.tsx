import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function AgentJobBoard() {
    const jobs = [
        {
            id: '1',
            title: 'AC Repair - Leakage',
            location: 'Lekki Phase 1, Lagos',
            tags: ['Urgent', 'Repair'],
            tagColors: ['bg-orange-100 text-orange-700', 'bg-blue-50 text-blue-700'],
            time: 'Today, 2:00 PM',
            distance: '2.5 km away',
            payout: 15000,
            verified: true,
        },
        {
            id: '2',
            title: 'VIP Client Property Tour',
            location: 'Victoria Island, Lagos',
            tags: ['High Pay', 'Tour'],
            tagColors: ['bg-green-100 text-green-700', 'bg-purple-50 text-purple-700'],
            time: 'Tomorrow, 10:00 AM',
            distance: '5.1 km away',
            payout: 25000,
            verified: false,
        },
        {
            id: '3',
            title: 'Move-out Inspection',
            location: 'Ikeja GRA, Lagos',
            tags: ['Standard', 'Inspect'],
            tagColors: ['bg-slate-100 text-slate-600', 'bg-indigo-50 text-indigo-700'],
            time: 'Today, 4:30 PM',
            distance: '12 km away',
            payout: 8000,
            verified: false,
        },
        {
            id: '4',
            title: 'Key Handover to Tenant',
            location: 'Yaba, Lagos',
            tags: ['Quick', 'Admin'],
            tagColors: ['bg-teal-50 text-teal-700', 'bg-blue-50 text-blue-700'],
            time: 'Wed, 9:00 AM',
            distance: '1.2 km away',
            payout: 5000,
            verified: false,
        },
    ]

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Agent Job Board
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Pick up new gigs and manage your schedule.
                    </p>
                </div>
                <div className="flex gap-3 items-center">
                    <div className="text-right mr-4 hidden md:block">
                        <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Today's Earnings</p>
                        <p className="text-xl font-bold text-green-600">₦25,000</p>
                    </div>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 hidden md:block"></div>
                    <Button variant="secondary">
                        <span className="material-symbols-outlined text-[20px]">history</span>
                        History
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400 mr-2">Filter by:</span>
                    {['Near Me', 'High Pay', 'Urgent'].map((filter, i) => (
                        <button
                            key={filter}
                            className={`px-4 py-2 rounded-full border font-medium text-sm flex items-center gap-2 transition-all ${i === 1
                                ? 'bg-green-600 text-white border-green-600'
                                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">
                                {i === 0 ? 'near_me' : i === 1 ? 'payments' : 'hourglass_top'}
                            </span>
                            {filter}
                        </button>
                    ))}
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button className="px-4 py-1.5 rounded-md bg-white dark:bg-slate-600 shadow-sm text-slate-900 dark:text-white text-sm font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">list</span> List
                    </button>
                    <button className="px-4 py-1.5 rounded-md text-slate-500 dark:text-slate-400 text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px]">map</span> Map
                    </button>
                </div>
            </Card>

            {/* Jobs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {jobs.map((job) => (
                    <Card key={job.id} className="flex flex-col overflow-hidden hover:border-primary/50 transition-all">
                        <div className="p-5 flex-1 flex flex-col">
                            {/* Tags */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-2">
                                    {job.tags.map((tag, i) => (
                                        <span
                                            key={tag}
                                            className={`${job.tagColors[i]} text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide`}
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <button className="text-slate-400 hover:text-slate-600">
                                    <span className="material-symbols-outlined text-[20px]">bookmark</span>
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{job.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">{job.location}</p>

                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">schedule</span>
                                    <span className="font-medium">{job.time}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <span className="material-symbols-outlined text-slate-400 text-[18px]">distance</span>
                                    <span>{job.distance}</span>
                                </div>
                            </div>
                        </div>

                        <div className="px-5 pb-5 pt-2">
                            <div className="flex items-end justify-between mb-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-semibold">Payout</p>
                                    <p className="text-xl font-extrabold text-green-600">₦{job.payout.toLocaleString()}</p>
                                </div>
                                {job.verified && (
                                    <div className="size-8 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[20px]">verified</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-3 items-center">
                                <Button className="flex-1">Accept Job</Button>
                                <button className="text-slate-500 hover:text-red-500 text-sm font-semibold">Decline</button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}
