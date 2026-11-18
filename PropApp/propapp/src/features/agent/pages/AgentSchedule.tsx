import { useState, useEffect } from 'react';
import AddPersonalEventModal from '../../../components/AddPersonalEventModal';
import MonthNavigator from '../../../components/MonthNavigator';
import AddAvailabilityModal from '../../../components/AddAvailabilityModal';
import NotificationPreferencesModal from '../../../components/NotificationPreferencesModal';
import PageContainer from '../../../components/common/PageContainer';
import PageHeader from '../../../components/common/PageHeader';
import StatusBadge from '../../../components/common/StatusBadge';
import type { ContourFragment } from '../../../components/common/ContourMotif';
import { Link } from 'react-router-dom';
import { agentService } from '../../../lib/api/services/agentService';
import type { AgentScheduleItem } from '../../../types/dashboard';
import { formatCurrency } from '@/lib/format';

// The calendar fills the page, so the motif stays in the corners
const CONTOUR: ContourFragment[] = [
    '-top-24 -right-48 w-[50vw] max-w-[520px]',
    '-bottom-28 -left-48 w-[50vw] max-w-[520px] rotate-180',
];

type EventType = 'completed' | 'scheduled' | 'urgent' | 'available';

// UI interfaces for transformed schedule data
interface UICalendarEvent {
    id: string;
    day: number;
    time: string;
    title: string;
    type: EventType;
    isToday?: boolean;
}

interface UISelectedJob {
    id: string;
    title: string;
    location: string;
    type: string;
    isUrgent: boolean;
    date: string;
    time: string;
    client: string;
    clientPhone?: string;
    payout: string;
}

interface UIUpcomingJob {
    id: string;
    title: string;
    time: string;
    location: string;
}

// "9:00" -> "09:00": times read in 24-hour form, as elsewhere in Keystead
function formatTime(timeString: string): string {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    if (minutes === undefined) return timeString;
    return `${hours.padStart(2, '0')}:${minutes.slice(0, 2)}`;
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

    return date.toLocaleDateString('en-NG', { weekday: 'long', day: 'numeric', month: 'long' });
}

// Get event type based on status
function getEventType(status: string): EventType {
    const statusLower = (status ?? '').toLowerCase();
    if (statusLower === 'completed') return 'completed';
    if (statusLower === 'urgent' || statusLower === 'emergency') return 'urgent';
    return 'scheduled';
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
        title: `${item.type} — ${item.property}`,
        location: item.address,
        type: item.type,
        isUrgent: getEventType(item.status) === 'urgent',
        date: formatDateDisplay(item.date),
        time: formatTime(item.time),
        client: item.clientName || 'Not given',
        clientPhone: item.clientPhone,
        payout: formatCurrency(item.payout || 0),
    };
}

// Transform API schedule item to upcoming job
function transformToUpcomingJob(item: AgentScheduleItem): UIUpcomingJob {
    return {
        id: item.id,
        title: item.type,
        time: `${formatDateDisplay(item.date)}, ${formatTime(item.time)}`,
        location: item.address.split(',')[0] || item.address,
    };
}

// Nothing selected: the panel shows an empty state instead of placeholder values
const defaultSelectedJob: UISelectedJob = {
    id: '',
    title: '',
    location: '',
    type: '',
    isUrgent: false,
    date: '',
    time: '',
    client: '',
    payout: '',
};

const LEGEND: { type: EventType; label: string }[] = [
    { type: 'scheduled', label: 'Scheduled' },
    { type: 'completed', label: 'Completed' },
    { type: 'urgent', label: 'Urgent' },
    { type: 'available', label: 'Available' },
];

const EVENT_STYLES: Record<EventType, { chip: string; dot: string }> = {
    scheduled: { chip: 'bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky', dot: 'bg-brand-ink dark:bg-sky' },
    completed: { chip: 'bg-verified-bg text-verified', dot: 'bg-verified' },
    urgent: { chip: 'bg-alert-bg text-alert', dot: 'bg-alert' },
    available: { chip: 'bg-neutral-bg text-muted-foreground', dot: 'bg-muted-foreground' },
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
                    type: 'available',
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


    return (
        <PageContainer maxWidth="2xl" motif={CONTOUR}>
            <PageHeader
                title="My schedule"
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
                            className="px-5 py-2.5 rounded-lg bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <span className="material-symbols-outlined text-[20px]">add</span>
                            Add personal event
                        </button>
                    </>
                }
            />

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6 min-h-[700px]">
                {/* Calendar */}
                <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border overflow-hidden">
                    {/* Calendar Header */}
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <MonthNavigator
                                currentDate={currentDate}
                                onDateChange={setCurrentDate}
                                variant="compact"
                            />
                        </div>
                        {/* Key to the event colours */}
                        <div className="hidden sm:flex items-center gap-4">
                            {LEGEND.map((item) => (
                                <span key={item.type} className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    <span className={`size-2 rounded-full ${EVENT_STYLES[item.type].dot}`}></span>
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Day Headers */}
                    <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div key={day} className="py-3 text-center text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wide">
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
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Loading schedule...</span>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="absolute inset-0 bg-white/90 dark:bg-canvas-dark/90 flex items-center justify-center z-10">
                                <div className="flex flex-col items-center gap-3 p-6 text-center">
                                    <span className="material-symbols-outlined text-4xl text-alert">error</span>
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
                                    <span className={`text-sm font-medium ml-1 ${dayData.isCurrentMonth ? 'text-slate-900 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                        {dayData.day}
                                    </span>
                                )}
                                {dayData.events?.map((event, eventIndex) => (
                                    <div
                                        key={eventIndex}
                                        onClick={() => handleSelectJob(event.id)}
                                        className={`px-2 py-1 rounded text-xs font-semibold truncate ${event.type === 'available' ? '' : 'cursor-pointer hover:opacity-80'} ${EVENT_STYLES[event.type].chip}`}
                                    >
                                        {event.time} {event.title}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar - Job Details */}
                <div className="w-full lg:w-[400px] shrink-0 flex flex-col gap-6">
                    {/* Selected Job Card */}
                    <div className="bg-card rounded-2xl border border-border shadow-lg flex flex-col overflow-hidden">
                        {selectedJob.id ? (
                            <>
                                <div className="p-5 border-b border-border">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            {selectedJob.isUrgent && <StatusBadge status="Urgent" variant="error" />}
                                            <span className="bg-neutral-bg text-muted-foreground text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                                                {selectedJob.type}
                                            </span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">Ref {selectedJob.id.slice(-8).toUpperCase()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{selectedJob.title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedJob.location}</p>
                                </div>

                                <div className="p-5 flex-1 space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="size-10 rounded-lg bg-neutral-bg flex items-center justify-center shrink-0 text-muted-foreground">
                                            <span className="material-symbols-outlined">event</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Date &amp; time</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedJob.date}</p>
                                            <p className="text-sm text-brand-ink dark:text-sky font-semibold">{selectedJob.time}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="size-10 rounded-lg bg-neutral-bg flex items-center justify-center shrink-0 text-muted-foreground">
                                            <span className="material-symbols-outlined">person</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Client</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{selectedJob.client}</p>
                                            {selectedJob.clientPhone && (
                                                <a
                                                    href={`tel:${selectedJob.clientPhone}`}
                                                    className="mt-2 inline-flex px-3 py-1 border border-border-strong rounded-md text-xs font-bold text-slate-700 dark:text-white hover:bg-accent transition-colors items-center gap-1"
                                                >
                                                    <span className="material-symbols-outlined text-[14px]">call</span>
                                                    Call
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="size-10 rounded-lg bg-neutral-bg flex items-center justify-center shrink-0 text-muted-foreground">
                                            <span className="material-symbols-outlined">payments</span>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Payout</h4>
                                            <p className="text-lg font-extrabold text-slate-900 dark:text-white">{selectedJob.payout}</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="p-8 text-center">
                                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">event_available</span>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Pick a job on the calendar to see its details.</p>
                            </div>
                        )}

                        <div className="p-5 border-t border-border space-y-3">
                            {selectedJob.id && (
                                <Link
                                    to={`/agent/my-jobs/${selectedJob.id}`}
                                    className="w-full bg-brand-ink hover:bg-brand-ink/90 text-on-brand font-bold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
                                >
                                    Open job
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </Link>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setIsAddAvailabilityOpen(true)}
                                    className="bg-card border border-border-strong hover:bg-accent text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">event_available</span>
                                    Add availability
                                </button>
                                <button
                                    onClick={() => setIsNotificationPrefsOpen(true)}
                                    className="bg-card border border-border-strong hover:bg-accent text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">notifications</span>
                                    Notifications
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Jobs */}
                    <div className="bg-card rounded-2xl border border-border p-5 flex-1 overflow-hidden flex flex-col">
                        <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-4">Upcoming next</h3>
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
                                        className="p-3 rounded-xl border border-border flex items-center gap-3 hover:bg-accent transition-colors cursor-pointer group"
                                    >
                                        <div className="size-9 rounded-lg bg-brand/10 text-brand-ink dark:bg-sky/15 dark:text-sky flex items-center justify-center shrink-0">
                                            <span className="material-symbols-outlined text-[20px]">event</span>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-ink transition-colors">
                                                {job.title}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {job.time} · {job.location}
                                            </p>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">chevron_right</span>
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
