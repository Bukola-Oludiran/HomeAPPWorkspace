import { useState, useEffect } from 'react';
import AddPersonalEventModal from '../../../components/AddPersonalEventModal';
import MonthNavigator from '../../../components/MonthNavigator';
import AddAvailabilityModal from '../../../components/AddAvailabilityModal';
import NotificationPreferencesModal from '../../../components/NotificationPreferencesModal';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import { agentService } from '../../../lib/api/services/agentService';
import type { AgentScheduleItem } from '../../../types/dashboard';
import { formatCurrency } from '@/lib/format';

// UI interfaces for transformed schedule data
interface UICalendarEvent {
    id: string;
    day: number;
    time: string;
    title: string;
    type: 'completed' | 'pending' | 'urgent' | 'personal';
    isToday?: boolean;
}

interface UISelectedJob {
    id: string;
    title: string;
    location: string;
    type: string;
    priority: string;
    date: string;
    time: string;
    client: string;
    clientPhone?: string;
    instructions: string;
    payout: string;
}

interface UIUpcomingJob {
    id: string;
    title: string;
    time: string;
    location: string;
    color: string;
}

// Helper to format time
function formatTime(timeString: string): string {
    if (!timeString) return '';
    // If already formatted like "10:00 AM", return as-is
    if (timeString.includes('AM') || timeString.includes('PM')) return timeString;
    // Parse 24-hour time and convert
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes?.toString().padStart(2, '0') || '00'} ${period}`;
}

// Helper to format date for display
function formatDateDisplay(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

// Get event type based on status
function getEventType(status: string): 'completed' | 'pending' | 'urgent' | 'personal' {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'completed';
    if (statusLower === 'urgent' || statusLower === 'emergency') return 'urgent';
    if (statusLower === 'personal') return 'personal';
    return 'pending';
}

// Get color for upcoming job based on status
function getJobColor(status: string): string {
    const statusLower = status.toLowerCase();
    if (statusLower === 'completed') return 'bg-green-500';
    if (statusLower === 'urgent' || statusLower === 'emergency') return 'bg-red-500';
    return 'bg-blue-500';
}

// Transform API schedule item to calendar event
function transformToCalendarEvent(item: AgentScheduleItem, today: Date): UICalendarEvent {
    const itemDate = new Date(item.date);
    const isToday = itemDate.toDateString() === today.toDateString();

    return {
        id: item.id,
        day: itemDate.getDate(),
        time: formatTime(item.time),
        title: item.type,
        type: getEventType(item.status),
        isToday,
    };
}

// Transform API schedule item to selected job
function transformToSelectedJob(item: AgentScheduleItem): UISelectedJob {
    return {
        id: item.id,
        title: `${item.type} - ${item.property}`,
        location: item.address,
        type: item.type,
        priority: (item.status ?? "").toLowerCase() === 'urgent' ? 'Urgent' : 'Normal',
        date: formatDateDisplay(item.date),
        time: formatTime(item.time),
        client: item.clientName || 'N/A',
        clientPhone: item.clientPhone,
        instructions: 'Please arrive 10 minutes early and contact the client upon arrival.',
        payout: new Intl.NumberFormat(undefined, { style: 'currency', currency: 'CAD' }).format(item.payout || 0),
    };
}

// Transform API schedule item to upcoming job
function transformToUpcomingJob(item: AgentScheduleItem): UIUpcomingJob {
    return {
        id: item.id,
        title: item.type,
        time: `${formatDateDisplay(item.date)}, ${formatTime(item.time)}`,
        location: item.address.split(',')[0] || item.address,
        color: getJobColor(item.status),
    };
}

// Default empty states
const defaultSelectedJob: UISelectedJob = {
    id: '',
    title: 'No job selected',
    location: 'N/A',
    type: 'N/A',
    priority: 'Normal',
    date: 'N/A',
    time: 'N/A',
    client: 'N/A',
    instructions: 'Select a job from the calendar to view details.',
    payout: formatCurrency(0),
};

type ViewMode = 'month' | 'week' | 'day';

export default function AgentSchedule() {
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isAddAvailabilityOpen, setIsAddAvailabilityOpen] = useState(false);
    const [isNotificationPrefsOpen, setIsNotificationPrefsOpen] = useState(false);

    // API data state
    const [scheduleItems, setScheduleItems] = useState<AgentScheduleItem[]>([]);
    const [calendarEvents, setCalendarEvents] = useState<UICalendarEvent[]>([]);
    const [selectedJob, setSelectedJob] = useState<UISelectedJob>(defaultSelectedJob);
    const [upcomingJobs, setUpcomingJobs] = useState<UIUpcomingJob[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch schedule data from API
    useEffect(() => {
        async function fetchSchedule() {
            try {
                setIsLoading(true);
                setError(null);

                // Calculate date range for the current month view
                const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

                const response = await agentService.getSchedule({
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                });

                const items = response.data?.jobs || [];
                setScheduleItems(items);

                // Transform to calendar events
                const today = new Date();
                const availabilityEvents: UICalendarEvent[] = (response.data?.availability || []).map(item => ({
                    id: `availability-${item.id}`,
                    day: new Date(item.date).getDate(),
                    time: `${formatTime(item.startTime)}–${formatTime(item.endTime)}`,
                    title: 'Available',
                    type: 'personal',
                }));
                const events = [...items.map(item => transformToCalendarEvent(item, today)), ...availabilityEvents];
                setCalendarEvents(events);

                // Transform to upcoming jobs (filter future items, sort by date)
                const futureItems = items
                    .filter(item => new Date(item.date) >= today)
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .slice(0, 5);
                setUpcomingJobs(futureItems.map(transformToUpcomingJob));

                // Set first upcoming job as selected, or default if none
                if (futureItems.length > 0) {
                    setSelectedJob(transformToSelectedJob(futureItems[0]));
                } else {
                    setSelectedJob(defaultSelectedJob);
                }
            } catch (err) {
                console.error('Failed to fetch schedule:', err);
                setError('Failed to load schedule. Please try again.');
                // Set empty states on error
                setCalendarEvents([]);
                setUpcomingJobs([]);
                setSelectedJob(defaultSelectedJob);
            } finally {
                setIsLoading(false);
            }
        }

        fetchSchedule();
    }, [currentDate]);

    // Handle selecting a job from calendar or upcoming list
    const handleSelectJob = (jobId: string) => {
        const item = scheduleItems.find(s => s.id === jobId);
        if (item) {
            setSelectedJob(transformToSelectedJob(item));
        }
    };

    // Generate calendar days for current month dynamically
    const generateCalendarDays = () => {
        const days: Array<{
            day: number;
            isCurrentMonth: boolean;
            events?: UICalendarEvent[];
            isToday?: boolean;
        }> = [];

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const today = new Date();

        // First day of the month
        const firstDay = new Date(year, month, 1);
        const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Last day of previous month
        const prevMonthLastDay = new Date(year, month, 0).getDate();

        // Add previous month days
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            days.push({ day: prevMonthLastDay - i, isCurrentMonth: false });
        }

        // Add current month days
        for (let i = 1; i <= daysInMonth; i++) {
            const dayEvents = calendarEvents.filter(e => e.day === i);
            const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === i;
            days.push({ day: i, isCurrentMonth: true, events: dayEvents, isToday });
        }

        // Add next month days to complete the grid (6 rows * 7 days = 42)
        const remainingDays = 42 - days.length;
        for (let i = 1; i <= remainingDays; i++) {
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
                        <div className="flex bg-white dark:bg-canvas-dark p-1 rounded-lg border border-slate-200 dark:border-slate-800">
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
                            className="px-5 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2"
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
                <div className="flex-1 flex flex-col bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
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
                    <div className="flex-1 grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-800 overflow-y-auto relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-canvas-dark/80 flex items-center justify-center z-10">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="size-8 border-3 border-brand border-t-transparent rounded-full animate-spin"></div>
                                    <span className="text-sm text-slate-500">Loading schedule...</span>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="absolute inset-0 bg-white/90 dark:bg-canvas-dark/90 flex items-center justify-center z-10">
                                <div className="flex flex-col items-center gap-3 p-6 text-center">
                                    <span className="material-symbols-outlined text-4xl text-red-500">error</span>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
                                    <button
                                        onClick={() => setCurrentDate(new Date(currentDate))}
                                        className="px-4 py-2 bg-brand-ink text-on-brand text-sm font-bold rounded-lg hover:bg-brand-ink/90"
                                    >
                                        Retry
                                    </button>
                                </div>
                            </div>
                        )}
                        {calendarDays.map((dayData, index) => (
                            <div
                                key={index}
                                className={`min-h-[100px] p-2 flex flex-col gap-1 relative transition-colors ${dayData.isCurrentMonth
                                    ? 'bg-white dark:bg-canvas-dark hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                    : 'bg-slate-50/50 dark:bg-[#151f2a] opacity-50'
                                    }`}
                            >
                                {dayData.isToday ? (
                                    <>
                                        <span className="text-sm font-bold text-on-brand bg-brand-ink rounded-full size-6 flex items-center justify-center -ml-1 -mt-1">
                                            {dayData.day}
                                        </span>
                                        <div className="absolute inset-0 border-2 border-brand pointer-events-none"></div>
                                    </>
                                ) : (
                                    <span className={`text-sm font-medium ml-1 ${dayData.isCurrentMonth ? 'text-slate-900 dark:text-slate-300' : 'text-slate-400'}`}>
                                        {dayData.day}
                                    </span>
                                )}
                                {dayData.events?.map((event, eventIndex) => (
                                    <div
                                        key={eventIndex}
                                        onClick={() => handleSelectJob(event.id)}
                                        className={`px-2 py-1 rounded text-xs font-semibold truncate cursor-pointer hover:opacity-80 ${getEventStyle(event.type)}`}
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
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg flex flex-col overflow-hidden">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#151f2a]">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                        {selectedJob.priority}
                                    </span>
                                    <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
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
                                        <p className="text-sm text-brand-ink font-semibold">{selectedJob.time}</p>
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
                            <button className="w-full bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined">play_arrow</span>
                                Start Job
                            </button>
                            <div>
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
                    <div className="bg-white dark:bg-canvas-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Upcoming Next</h3>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {upcomingJobs.length === 0 && !isLoading ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">event_available</span>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming jobs</p>
                                </div>
                            ) : (
                                upcomingJobs.map((job) => (
                                    <div
                                        key={job.id}
                                        onClick={() => handleSelectJob(job.id)}
                                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
                                    >
                                        <div className={`w-1 h-10 rounded-full ${job.color}`}></div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-ink transition-colors">
                                                {job.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {job.time} • {job.location}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-400 text-[20px]">chevron_right</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Personal Event Modal */}
            <AddPersonalEventModal
                isOpen={isAddEventModalOpen}
                onClose={() => setIsAddEventModalOpen(false)}
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
