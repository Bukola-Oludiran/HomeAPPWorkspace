import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../lib/api/services/notificationService';
import type { Notification } from '../types/dashboard';

interface NotificationsDropdownProps { isOpen: boolean; onClose: () => void }

const iconFor = (type: string) => {
    const value = type.toLowerCase();
    if (value.includes('message')) return 'chat';
    if (value.includes('payment')) return 'payments';
    if (value.includes('maintenance')) return 'build';
    if (value.includes('application')) return 'description';
    return 'notifications';
};

export default function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const unreadCount = notifications.filter(item => !item.isRead).length;

    useEffect(() => {
        if (!isOpen) return;
        notificationService.getNotifications({ limit: 20 }).then(response => {
            setNotifications(response.data);
            setError(null);
        }).catch(() => setError('Unable to load notifications.'));
    }, [isOpen]);

    useEffect(() => {
        const closeOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) onClose();
        };
        if (isOpen) document.addEventListener('mousedown', closeOutside);
        return () => document.removeEventListener('mousedown', closeOutside);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const markRead = async (id: string) => {
        try {
            await notificationService.markAsRead([id]);
            setNotifications(current => current.map(item => item.id === id ? { ...item, isRead: true } : item));
        } catch { setError('Unable to update notification.'); }
    };
    const markAll = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(current => current.map(item => ({ ...item, isRead: true })));
        } catch { setError('Unable to update notifications.'); }
    };
    const clearAll = async () => {
        try {
            await notificationService.clearAllNotifications();
            setNotifications([]);
        } catch { setError('Unable to clear notifications.'); }
    };

    return (
        <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#1a2632] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">Notifications {unreadCount ? `(${unreadCount})` : ''}</h3>
                {unreadCount > 0 && <button onClick={() => void markAll()} className="text-xs font-semibold text-[#137fec]">Mark all read</button>}
            </div>
            {error && <p role="alert" className="p-4 text-sm text-red-600">{error}</p>}
            <div className="max-h-[400px] overflow-y-auto">
                {!notifications.length ? <p className="py-12 text-center text-sm text-slate-500">No notifications</p> : notifications.map(notification => (
                    <Link key={notification.id} to={typeof notification.data?.link === 'string' ? notification.data.link : '#'} onClick={() => { void markRead(notification.id); onClose(); }} className={`flex gap-3 p-4 border-b border-slate-100 dark:border-slate-800 ${notification.isRead ? '' : 'bg-blue-50/50 dark:bg-blue-900/10'}`}>
                        <span className="material-symbols-outlined text-[#137fec]">{iconFor(notification.type)}</span>
                        <span className="min-w-0">
                            <strong className="block text-sm text-slate-900 dark:text-white">{notification.title}</strong>
                            <span className="block text-xs text-slate-600 dark:text-slate-400">{notification.body}</span>
                            <span className="block mt-1 text-[11px] text-slate-400">{new Date(notification.createdAt).toLocaleString()}</span>
                        </span>
                    </Link>
                ))}
            </div>
            {!!notifications.length && <button onClick={() => void clearAll()} className="w-full p-3 text-xs font-semibold text-red-600">Clear all</button>}
        </div>
    );
}
