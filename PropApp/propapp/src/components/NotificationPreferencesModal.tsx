import { useState } from 'react';

interface NotificationPreferencesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NotificationCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    email: boolean;
    push: boolean;
    sms: boolean;
}

export default function NotificationPreferencesModal({ isOpen, onClose }: NotificationPreferencesModalProps) {
    const [categories, setCategories] = useState<NotificationCategory[]>([
        {
            id: 'messages',
            name: 'Messages',
            description: 'When you receive a new message',
            icon: 'chat',
            email: true,
            push: true,
            sms: false,
        },
        {
            id: 'appointments',
            name: 'Appointments',
            description: 'Viewing reminders and schedule changes',
            icon: 'event',
            email: true,
            push: true,
            sms: true,
        },
        {
            id: 'payments',
            name: 'Payments',
            description: 'Payment confirmations and reminders',
            icon: 'payments',
            email: true,
            push: true,
            sms: false,
        },
        {
            id: 'maintenance',
            name: 'Maintenance',
            description: 'Updates on maintenance requests',
            icon: 'build',
            email: true,
            push: true,
            sms: false,
        },
        {
            id: 'marketing',
            name: 'Promotions',
            description: 'News, tips, and special offers',
            icon: 'campaign',
            email: false,
            push: false,
            sms: false,
        },
    ]);

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const togglePreference = (categoryId: string, type: 'email' | 'push' | 'sms') => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId
                ? { ...cat, [type]: !cat[type] }
                : cat
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onClose();
        }, 1500);
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
            <div className="relative bg-white dark:bg-[#1a2632] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 fade-in duration-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-[#137fec]/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-[#137fec]">notifications</span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Channel Headers */}
                    <div className="flex items-center justify-end gap-6 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-wide pr-2">
                        <span className="w-12 text-center">Email</span>
                        <span className="w-12 text-center">Push</span>
                        <span className="w-12 text-center">SMS</span>
                    </div>

                    {/* Categories */}
                    <div className="space-y-3">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">
                                            {category.icon}
                                        </span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-sm text-slate-900 dark:text-white">
                                            {category.name}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            {category.description}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6 shrink-0">
                                    {(['email', 'push', 'sms'] as const).map((type) => (
                                        <div key={type} className="w-12 flex justify-center">
                                            <button
                                                onClick={() => togglePreference(category.id, type)}
                                                className={`size-6 rounded-md flex items-center justify-center transition-all ${category[type]
                                                        ? 'bg-[#137fec] text-white'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                    }`}
                                            >
                                                <span className="material-symbols-outlined text-[16px]">
                                                    {category[type] ? 'check' : 'close'}
                                                </span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-6 flex gap-2">
                        <button
                            onClick={() => setCategories(prev => prev.map(c => ({ ...c, email: true, push: true, sms: false })))}
                            className="text-xs font-semibold text-[#137fec] hover:underline"
                        >
                            Enable all
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                            onClick={() => setCategories(prev => prev.map(c => ({ ...c, email: false, push: false, sms: false })))}
                            className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                            Disable all
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-[#137fec] text-white font-bold text-sm hover:bg-[#137fec]/90 transition-colors shadow-lg shadow-[#137fec]/20 disabled:opacity-70 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                Saving...
                            </>
                        ) : saved ? (
                            <>
                                <span className="material-symbols-outlined text-[18px]">check</span>
                                Saved!
                            </>
                        ) : (
                            'Save Preferences'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
