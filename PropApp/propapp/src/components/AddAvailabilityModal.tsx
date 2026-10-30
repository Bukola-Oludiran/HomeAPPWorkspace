import { useState } from 'react';
import { integrationService } from '../lib/api/services/integrationService';

interface AddAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (availability: AvailabilitySlot) => void | Promise<void>;
}

interface AvailabilitySlot {
    date: string;
    startTime: string;
    endTime: string;
    recurring: boolean;
    recurringDays?: string[];
}

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function AddAvailabilityModal({ isOpen, onClose, onSave }: AddAvailabilityModalProps) {
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('09:00');
    const [endTime, setEndTime] = useState('17:00');
    const [recurring, setRecurring] = useState(false);
    const [recurringDays, setRecurringDays] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleDay = (day: string) => {
        setRecurringDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        const availability = {
                date,
                startTime,
                endTime,
                recurring,
                recurringDays: recurring ? recurringDays : undefined,
        };
        try {
            await integrationService.createAvailability(availability);
            await onSave?.(availability);
            onClose();
            setDate('');
            setStartTime('09:00');
            setEndTime('17:00');
            setRecurring(false);
            setRecurringDays([]);
        } catch {
            setError('Unable to save availability. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-brand/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-brand-ink">event_available</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add Availability</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && <p role="alert" className="mb-4 text-sm text-red-600">{error}</p>}
                    {/* Date Selection */}
                    <div className="mb-5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4 mb-5">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                Start Time
                            </label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                End Time
                            </label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand transition-colors"
                            />
                        </div>
                    </div>

                    {/* Recurring Toggle */}
                    <div className="mb-5">
                        <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-brand/30 transition-colors">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">repeat</span>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                        Repeat weekly
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Set as recurring availability
                                    </p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={recurring}
                                onChange={(e) => setRecurring(e.target.checked)}
                                className="size-5 rounded border-slate-300 text-brand-ink focus:ring-brand"
                            />
                        </label>
                    </div>

                    {/* Recurring Days */}
                    {recurring && (
                        <div className="mb-5 animate-in slide-in-from-top-2 fade-in duration-200">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">
                                Repeat on
                            </label>
                            <div className="flex gap-2">
                                {daysOfWeek.map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(day)}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-colors ${recurringDays.includes(day)
                                                ? 'bg-brand-ink text-on-brand'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!date || saving}
                        className="px-6 py-2.5 rounded-xl bg-brand-ink text-on-brand font-bold text-sm hover:bg-brand-ink/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                Saving...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                Add Availability
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
