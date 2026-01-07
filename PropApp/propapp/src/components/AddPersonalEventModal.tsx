import { useState } from 'react';
import ModalPortal from './ModalPortal';

interface AddPersonalEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (event: PersonalEvent) => void;
}

interface PersonalEvent {
    title: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    allDay: boolean;
    location: string;
    reminder: string;
    visibility: 'busy' | 'private';
    description: string;
}

export default function AddPersonalEventModal({
    isOpen,
    onClose,
    onSave,
}: AddPersonalEventModalProps) {
    const [event, setEvent] = useState<PersonalEvent>({
        title: '',
        startDate: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endDate: new Date().toISOString().split('T')[0],
        endTime: '10:00',
        allDay: false,
        location: '',
        reminder: '15 minutes before',
        visibility: 'busy',
        description: '',
    });

    const handleSave = () => {
        onSave?.(event);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalPortal>
            <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-all duration-300">
                {/* Backdrop */}
                <div className="absolute inset-0 cursor-default" onClick={onClose}></div>

                {/* Modal */}
                <div className="relative bg-white dark:bg-[#101922] w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Personal Event</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Schedule time for yourself or blocked slots.</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="size-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full cursor-pointer text-slate-500 transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Form Content */}
                    <div className="p-6 overflow-y-auto">
                        {/* Event Title */}
                        <div className="mb-5">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Event Title</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">event</span>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 dark:text-white font-medium focus:ring-[#137fec] focus:border-[#137fec] transition-all placeholder:text-slate-400"
                                    placeholder="e.g., Dentist Appointment"
                                    type="text"
                                    value={event.title}
                                    onChange={(e) => setEvent({ ...event, title: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Date/Time Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Starts</label>
                                <div className="flex gap-2">
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-slate-900 dark:text-white text-sm font-medium focus:ring-[#137fec] focus:border-[#137fec]"
                                        type="date"
                                        value={event.startDate}
                                        onChange={(e) => setEvent({ ...event, startDate: e.target.value })}
                                    />
                                    <input
                                        className="w-28 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-2 px-2 text-slate-900 dark:text-white text-sm font-medium focus:ring-[#137fec] focus:border-[#137fec]"
                                        type="time"
                                        value={event.startTime}
                                        onChange={(e) => setEvent({ ...event, startTime: e.target.value })}
                                        disabled={event.allDay}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Ends</label>
                                <div className="flex gap-2">
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-2 px-3 text-slate-900 dark:text-white text-sm font-medium focus:ring-[#137fec] focus:border-[#137fec]"
                                        type="date"
                                        value={event.endDate}
                                        onChange={(e) => setEvent({ ...event, endDate: e.target.value })}
                                    />
                                    <input
                                        className="w-28 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-2 px-2 text-slate-900 dark:text-white text-sm font-medium focus:ring-[#137fec] focus:border-[#137fec]"
                                        type="time"
                                        value={event.endTime}
                                        onChange={(e) => setEvent({ ...event, endTime: e.target.value })}
                                        disabled={event.allDay}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* All Day Toggle */}
                        <div className="flex items-center gap-2 mb-6 ml-1">
                            <input
                                className="rounded border-slate-300 dark:border-slate-600 text-[#137fec] focus:ring-[#137fec] bg-slate-50 dark:bg-slate-800 size-4"
                                id="all-day"
                                type="checkbox"
                                checked={event.allDay}
                                onChange={(e) => setEvent({ ...event, allDay: e.target.checked })}
                            />
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none" htmlFor="all-day">
                                All day event
                            </label>
                        </div>

                        {/* Location */}
                        <div className="mb-5">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                Location <span className="text-slate-400 font-normal normal-case opacity-70 ml-1">(Optional)</span>
                            </label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">location_on</span>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 dark:text-white font-medium focus:ring-[#137fec] focus:border-[#137fec] transition-all placeholder:text-slate-400"
                                    placeholder="Add location"
                                    type="text"
                                    value={event.location}
                                    onChange={(e) => setEvent({ ...event, location: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Reminder & Visibility Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Reminder</label>
                                <div className="relative">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">notifications</span>
                                    <select
                                        className="w-full appearance-none bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-8 text-slate-900 dark:text-white font-medium focus:ring-[#137fec] focus:border-[#137fec] transition-all cursor-pointer"
                                        value={event.reminder}
                                        onChange={(e) => setEvent({ ...event, reminder: e.target.value })}
                                    >
                                        <option>15 minutes before</option>
                                        <option>30 minutes before</option>
                                        <option>1 hour before</option>
                                        <option>1 day before</option>
                                    </select>
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[20px]">expand_more</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Visibility</label>
                                <div className="grid grid-cols-2 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                    <label className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            className="peer hidden"
                                            checked={event.visibility === 'busy'}
                                            onChange={() => setEvent({ ...event, visibility: 'busy' })}
                                        />
                                        <div className="text-center py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-slate-600 peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm transition-all">
                                            Busy
                                        </div>
                                    </label>
                                    <label className="cursor-pointer">
                                        <input
                                            type="radio"
                                            name="visibility"
                                            className="peer hidden"
                                            checked={event.visibility === 'private'}
                                            onChange={() => setEvent({ ...event, visibility: 'private' })}
                                        />
                                        <div className="text-center py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 peer-checked:bg-white dark:peer-checked:bg-slate-600 peer-checked:text-slate-900 dark:peer-checked:text-white peer-checked:shadow-sm transition-all">
                                            Private
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                                Description <span className="text-slate-400 font-normal normal-case opacity-70 ml-1">(Optional)</span>
                            </label>
                            <textarea
                                className="w-full bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-slate-900 dark:text-white font-medium focus:ring-[#137fec] focus:border-[#137fec] transition-all placeholder:text-slate-400 resize-none"
                                placeholder="Add details..."
                                rows={3}
                                value={event.description}
                                onChange={(e) => setEvent({ ...event, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#151f2a] flex justify-end gap-3 rounded-b-2xl">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer bg-white dark:bg-transparent shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-6 py-2.5 rounded-xl bg-[#137fec] text-white font-bold text-sm hover:bg-[#137fec]/90 shadow-lg shadow-[#137fec]/20 transition-all flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">check</span>
                            Save Event
                        </button>
                    </div>
                </div>
            </div>
        </ModalPortal>
    );
}
