import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

export function AgentSchedule() {
    const todayJobs = [
        { id: '1', time: '09:00 AM', title: 'Property Tour - VIP Client', address: 'Victoria Island, Lagos', type: 'tour', duration: '2 hrs' },
        { id: '2', time: '02:00 PM', title: 'AC Repair - Emergency', address: 'Lekki Phase 1, Lagos', type: 'repair', duration: '1 hr' },
        { id: '3', time: '04:30 PM', title: 'Move-out Inspection', address: 'Ikeja GRA, Lagos', type: 'inspection', duration: '45 min' },
    ]

    const upcomingJobs = [
        { id: '4', date: 'Tomorrow', time: '10:00 AM', title: 'Key Handover', address: 'Yaba, Lagos' },
        { id: '5', date: 'Wed, Dec 18', time: '11:00 AM', title: 'Property Photography', address: 'Ikoyi, Lagos' },
        { id: '6', date: 'Thu, Dec 19', time: '03:00 PM', title: 'Tenant Screening Interview', address: 'Surulere, Lagos' },
    ]

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'tour': return 'tour'
            case 'repair': return 'build'
            case 'inspection': return 'fact_check'
            default: return 'work'
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'tour': return 'bg-purple-100 dark:bg-purple-900/20 text-purple-600'
            case 'repair': return 'bg-orange-100 dark:bg-orange-900/20 text-orange-600'
            case 'inspection': return 'bg-blue-100 dark:bg-blue-900/20 text-blue-600'
            default: return 'bg-slate-100 dark:bg-slate-800 text-slate-600'
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        My Schedule
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
                        Manage your appointments and jobs
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        <span className="material-symbols-outlined text-[20px]">sync</span>
                        Sync Calendar
                    </Button>
                    <Button variant="secondary">
                        <span className="material-symbols-outlined text-[20px]">block</span>
                        Block Time
                    </Button>
                </div>
            </div>

            {/* Today's Date Banner */}
            <Card className="p-4 mb-6 bg-gradient-to-r from-primary to-blue-600 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="size-14 bg-white/20 rounded-xl flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold leading-none">14</span>
                            <span className="text-xs uppercase">Dec</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Today</h2>
                            <p className="text-white/80">Saturday, December 14, 2024</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold">{todayJobs.length}</p>
                        <p className="text-white/80 text-sm">Jobs scheduled</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Today's Schedule */}
                <div className="xl:col-span-2">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">today</span>
                        Today's Jobs
                    </h2>
                    <div className="space-y-4">
                        {todayJobs.map((job, index) => (
                            <Card key={job.id} className="p-5 hover:border-primary/50 transition-colors">
                                <div className="flex gap-4">
                                    {/* Time */}
                                    <div className="text-center w-20 shrink-0">
                                        <p className="text-lg font-bold text-slate-900 dark:text-white">{job.time}</p>
                                        <p className="text-xs text-slate-500">{job.duration}</p>
                                    </div>

                                    {/* Timeline */}
                                    <div className="flex flex-col items-center">
                                        <div className={`size-10 rounded-full flex items-center justify-center ${getTypeColor(job.type)}`}>
                                            <span className="material-symbols-outlined text-[20px]">{getTypeIcon(job.type)}</span>
                                        </div>
                                        {index < todayJobs.length - 1 && (
                                            <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 my-2" />
                                        )}
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 dark:text-white">{job.title}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                                            {job.address}
                                        </p>
                                        <div className="flex gap-2 mt-3">
                                            <Button variant="secondary" size="sm">
                                                <span className="material-symbols-outlined text-[16px]">navigation</span>
                                                Navigate
                                            </Button>
                                            <Button variant="outline" size="sm">Details</Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Upcoming */}
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">event</span>
                        Upcoming
                    </h2>
                    <Card className="divide-y divide-slate-100 dark:divide-slate-700">
                        {upcomingJobs.map((job) => (
                            <div key={job.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant="default">{job.date}</Badge>
                                    <span className="text-sm font-medium text-slate-500">{job.time}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 dark:text-white">{job.title}</h4>
                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                    {job.address}
                                </p>
                            </div>
                        ))}
                    </Card>

                    {/* Quick Stats */}
                    <Card className="p-5 mt-6">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">This Week</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">12</p>
                                <p className="text-xs text-slate-500">Total Jobs</p>
                            </div>
                            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <p className="text-2xl font-bold text-green-600">8</p>
                                <p className="text-xs text-slate-500">Completed</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
