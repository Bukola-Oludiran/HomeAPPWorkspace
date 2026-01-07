import { useState } from 'react';

interface CalendarSyncModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface CalendarConnection {
    id: string;
    name: string;
    icon: string;
    color: string;
    connected: boolean;
    email?: string;
}

export default function CalendarSyncModal({ isOpen, onClose }: CalendarSyncModalProps) {
    const [connections, setConnections] = useState<CalendarConnection[]>([
        {
            id: 'google',
            name: 'Google Calendar',
            icon: 'https://www.google.com/favicon.ico',
            color: '#4285F4',
            connected: false,
        },
        {
            id: 'outlook',
            name: 'Outlook Calendar',
            icon: 'https://outlook.live.com/favicon.ico',
            color: '#0078D4',
            connected: false,
        },
        {
            id: 'apple',
            name: 'Apple Calendar',
            icon: 'https://www.apple.com/favicon.ico',
            color: '#000000',
            connected: false,
        },
    ]);
    const [syncing, setSyncing] = useState<string | null>(null);
    const [syncAll, setSyncAll] = useState(true);
    const [syncDirection, setSyncDirection] = useState<'both' | 'import' | 'export'>('both');

    const handleConnect = async (id: string) => {
        setSyncing(id);
        // Simulate OAuth flow
        await new Promise(resolve => setTimeout(resolve, 2000));

        setConnections(prev => prev.map(c =>
            c.id === id
                ? { ...c, connected: true, email: 'user@example.com' }
                : c
        ));
        setSyncing(null);
    };

    const handleDisconnect = (id: string) => {
        setConnections(prev => prev.map(c =>
            c.id === id
                ? { ...c, connected: false, email: undefined }
                : c
        ));
    };

    if (!isOpen) return null;

    const connectedCalendars = connections.filter(c => c.connected);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#1a2632] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 fade-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#137fec]/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#137fec]">sync</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Sync Calendar</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Calendar Connections */}
                    <div className="mb-6">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                            Connect a Calendar
                        </label>
                        <div className="space-y-3">
                            {connections.map((calendar) => (
                                <div
                                    key={calendar.id}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${calendar.connected
                                            ? 'border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={calendar.icon}
                                            alt={calendar.name}
                                            className="size-8"
                                        />
                                        <div>
                                            <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                                {calendar.name}
                                            </p>
                                            {calendar.email && (
                                                <p className="text-xs text-slate-500">{calendar.email}</p>
                                            )}
                                        </div>
                                    </div>
                                    {calendar.connected ? (
                                        <button
                                            onClick={() => handleDisconnect(calendar.id)}
                                            className="text-xs font-semibold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            Disconnect
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleConnect(calendar.id)}
                                            disabled={syncing === calendar.id}
                                            className="text-xs font-semibold text-[#137fec] px-3 py-1.5 rounded-lg bg-[#137fec]/10 hover:bg-[#137fec]/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {syncing === calendar.id ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                                    Connecting...
                                                </>
                                            ) : (
                                                'Connect'
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sync Settings - Only show if connected */}
                    {connectedCalendars.length > 0 && (
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 block">
                                Sync Settings
                            </label>

                            {/* Sync Direction */}
                            <div className="mb-4">
                                <p className="text-xs text-slate-500 mb-2">Sync Direction</p>
                                <div className="flex gap-2">
                                    {[
                                        { value: 'both', label: 'Two-way', icon: 'sync_alt' },
                                        { value: 'import', label: 'Import only', icon: 'download' },
                                        { value: 'export', label: 'Export only', icon: 'upload' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => setSyncDirection(option.value as typeof syncDirection)}
                                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${syncDirection === option.value
                                                    ? 'bg-[#137fec] text-white'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">{option.icon}</span>
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sync All Events */}
                            <label className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-slate-400">event</span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                        Sync all events
                                    </span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={syncAll}
                                    onChange={(e) => setSyncAll(e.target.checked)}
                                    className="size-4 rounded border-slate-300 text-[#137fec] focus:ring-[#137fec]"
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl bg-[#137fec] text-white font-bold text-sm hover:bg-[#137fec]/90 transition-colors shadow-lg shadow-[#137fec]/20"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}
