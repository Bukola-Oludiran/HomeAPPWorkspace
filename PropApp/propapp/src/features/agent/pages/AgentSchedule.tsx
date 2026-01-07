import { useState } from 'react';
import AddPersonalEventModal from '../../../components/AddPersonalEventModal';
import MonthNavigator from '../../../components/MonthNavigator';
import CalendarSyncModal from '../../../components/CalendarSyncModal';
import AddAvailabilityModal from '../../../components/AddAvailabilityModal';
import NotificationPreferencesModal from '../../../components/NotificationPreferencesModal';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';

// Mock calendar events data
const calendarEvents = [
    { day: 1, time: '9:00 AM', title: 'Inspection', type: 'completed' },
    { day: 3, time: '2:00 PM', title: 'Tour', type: 'pending' },
    { day: 4, time: '10:00 AM', title: 'Emergency Repair', type: 'urgent', isToday: true },
    { day: 4, time: '4:30 PM', title: 'Key Handover', type: 'pending', isToday: true },
    { day: 6, time: '11:00 AM', title: 'Maintenance', type: 'completed' },
    { day: 9, time: '1:00 PM', title: 'Client Meeting', type: 'pending' },
    { day: 11, time: '9:00 AM', title: 'Training', type: 'personal' },
    { day: 14, time: '8:00 AM', title: 'Urgent Inspect', type: 'urgent' },
];

const selectedJob = {
    id: 'JOB-2938',
    title: 'AC Repair - Leakage',
    location: 'Lekki Phase 1, Lagos',
    type: 'Repair',
    priority: 'Urgent',
    date: 'Today, October 4th',
    time: '10:00 AM - 12:00 PM',
    client: 'Mrs. Adewale',
    instructions: 'Gate code is 4455. The AC unit is in the master bedroom on the second floor. Please wear shoe covers inside.',
    payout: '₦15,000',
};

const upcomingJobs = [
    { id: 1, title: 'Key Handover', time: 'Today, 4:30 PM', location: 'Yaba', color: 'bg-blue-500' },
    { id: 2, title: 'Client Meeting', time: 'Tomorrow, 9:00 AM', location: 'VI', color: 'bg-green-500' },
];

type ViewMode = 'month' | 'week' | 'day';

export default function AgentSchedule() {
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date(2023, 9, 1)); // October 2023
    const [isCalendarSyncOpen, setIsCalendarSyncOpen] = useState(false);
    const [isAddAvailabilityOpen, setIsAddAvailabilityOpen] = useState(false);
    const [isNotificationPrefsOpen, setIsNotificationPrefsOpen] = useState(false);

    // Generate calendar days for October 2023
    const generateCalendarDays = () => {
        const days = [];
        // Previous month days (Sep 29, 30)
        days.push({ day: 29, isCurrentMonth: false });
        days.push({ day: 30, isCurrentMonth: false });
        // Current month days (1-31)
        for (let i = 1; i <= 31; i++) {
            const dayEvents = calendarEvents.filter(e => e.day === i);
            days.push({ day: i, isCurrentMonth: true, events: dayEvents, isToday: i === 4 });
        }
        // Next month days (Nov 1-4)
        for (let i = 1; i <= 4; i++) {
            days.push({ day: i, isCurrentMonth: false });
        }
        return days;
    };

    const calendarDays = generateCalendarDays();

    const getEventStyle = (type: string) => {
        switch (type) {
            case 'completed':
                return 'bg-green-100 dark:bg-green-900/30 border-l-2 border-green-500 text-green-800 dark:text-green-300';
            case 'pending':
                return 'bg-blue-100 dark:bg-blue-900/30 border-l-2 border-blue-500 text-blue-800 dark:text-blue-300';
            case 'urgent':
                return 'bg-red-100 dark:bg-red-900/30 border-l-2 border-red-500 text-red-800 dark:text-red-300';
            case 'personal':
                return 'bg-purple-100 dark:bg-purple-900/30 border-l-2 border-purple-500 text-purple-800 dark:text-purple-300';
            default:
                return 'bg-slate-100 dark:bg-slate-800 border-l-2 border-slate-400 text-slate-700 dark:text-slate-300';
        }
    };

    return (
        <PageContainer maxWidth="2xl">
            <PageHeader
                title="My Schedule"
                subtitle="Manage your upcoming jobs and appointments."
                actions={
                    <>
                        {/* View Mode Toggle */}
                        <div className="flex bg-white dark:bg-[#101922] p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => setViewMode('month')}
                                className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${viewMode === 'month'
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                Month
                            </button>
                            <button
                                onClick={() => setViewMode('week')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'week'
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                Week
                            </button>
                            <button
                                onClick={() => setViewMode('day')}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'day'
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}
                            >
                                Day
                            </button>
                        </div>
                        <button
                            onClick={() => setIsAddEventModalOpen(true)}
                            className="px-5 py-2.5 rounded-lg bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold text-sm transition-all flex items-center gap-2 shadow-lg shadow-[#137fec]/20"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Add Personal Event
                        </button>
                    </>
                }
            />

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-[700px]">
                {/* Calendar */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    {/* Calendar Header */}
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <MonthNavigator
                                currentDate={currentDate}
                                onDateChange={setCurrentDate}
                                variant="compact"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-500">Filter:</span>
                            <div className="flex gap-2">
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded text-xs font-bold border border-green-200 dark:border-green-800/30">
                                    <div className="size-2 rounded-full bg-green-500"></div>
                                    Completed
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded text-xs font-bold border border-blue-200 dark:border-blue-800/30">
                                    <div className="size-2 rounded-full bg-blue-500"></div>
                                    Pending
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs font-bold border border-red-200 dark:border-red-800/30">
                                    <div className="size-2 rounded-full bg-red-500"></div>
                                    Urgent
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="py-3 text-center text-xs font-semibold uppercase text-slate-500 tracking-wide">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="flex-1 grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 overflow-y-auto">
                        {calendarDays.map((dayData, index) => (
                            <div
                                key={index}
                                className={`min-h-[100px] p-2 flex flex-col gap-1 relative transition-colors ${dayData.isCurrentMonth
                                    ? 'bg-white dark:bg-[#101922] hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    : 'bg-slate-50/50 dark:bg-[#151f2a] opacity-50'
                                    }`}
                            >
                                {dayData.isToday ? (
                                    <>
                                        <span className="text-sm font-bold text-white bg-[#137fec] rounded-full size-6 flex items-center justify-center -ml-1 -mt-1 shadow-sm">
                                            {dayData.day}
                                        </span>
                                        <div className="absolute inset-0 border-2 border-[#137fec] pointer-events-none"></div>
                                    </>
                                ) : (
                                    <span className={`text-sm font-medium ml-1 ${dayData.isCurrentMonth ? 'text-slate-900 dark:text-slate-300' : 'text-slate-400'}`}>
                                        {dayData.day}
                                    </span>
                                )}
                                {dayData.events?.map((event, eventIndex) => (
                                    <div
                                        key={eventIndex}
                                        className={`px-2 py-1 rounded text-xs font-semibold truncate cursor-pointer ${getEventStyle(event.type)}`}
                                    >
                                        {event.time} - {event.title}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar - Job Details */}
                <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
                    {/* Selected Job Card */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#151f2a]">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        {selectedJob.priority}
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        {selectedJob.type}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-slate-400">#{selectedJob.id}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedJob.title}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedJob.location}</p>
                        </div>

                        <div className="p-5 flex-1 overflow-y-auto">
                            <div className="space-y-6">
                                <div className="flex gap-4 items-start">
                                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined">event</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Date & Time</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedJob.date}</p>
                                        <p className="text-sm text-[#137fec] font-semibold">{selectedJob.time}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined">person</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Client</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{selectedJob.client}</p>
                                        <div className="flex gap-2 mt-2">
                                            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">call</span>
                                                Call
                                            </button>
                                            <button className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-xs font-bold text-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[14px]">chat</span>
                                                Chat
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                                        <span className="material-symbols-outlined">description</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Instructions</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                            {selectedJob.instructions}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-start">
                                    <div className="size-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center shrink-0 text-green-600">
                                        <span className="material-symbols-outlined">payments</span>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Estimated Payout</h4>
                                        <p className="text-lg font-extrabold text-green-600">{selectedJob.payout}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-5 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-[#151f2a]">
                            <button className="w-full bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-[#137fec]/20 transition-all text-sm flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">play_arrow</span>
                                Start Job
                            </button>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsCalendarSyncOpen(true)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">sync</span>
                                    Sync Calendar
                                </button>
                                <button
                                    onClick={() => setIsNotificationPrefsOpen(true)}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">notifications</span>
                                    Notifications
                                </button>
                            </div>
                            <button
                                onClick={() => setIsAddAvailabilityOpen(true)}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px]">event_available</span>
                                Add Availability
                            </button>
                        </div>
                    </div>

                    {/* Upcoming Jobs */}
                    <div className="bg-white dark:bg-[#101922] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Upcoming Next</h3>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {upcomingJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                                >
                                    <div className={`w-1 h-10 rounded-full ${job.color}`}></div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#137fec] transition-colors">
                                            {job.title}
                                        </h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {job.time} • {job.location}
                                        </p>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Personal Event Modal */}
            <AddPersonalEventModal
                isOpen={isAddEventModalOpen}
                onClose={() => setIsAddEventModalOpen(false)}
            />

            {/* Calendar Sync Modal */}
            <CalendarSyncModal
                isOpen={isCalendarSyncOpen}
                onClose={() => setIsCalendarSyncOpen(false)}
            />

            {/* Add Availability Modal */}
            <AddAvailabilityModal
                isOpen={isAddAvailabilityOpen}
                onClose={() => setIsAddAvailabilityOpen(false)}
            />

            {/* Notification Preferences Modal */}
            <NotificationPreferencesModal
                isOpen={isNotificationPrefsOpen}
                onClose={() => setIsNotificationPrefsOpen(false)}
            />
        </PageContainer>
    );
}
