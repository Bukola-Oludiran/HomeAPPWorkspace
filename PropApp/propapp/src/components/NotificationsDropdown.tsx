import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Notification {
    id: number;
    type: 'message' | 'alert' | 'payment' | 'maintenance' | 'application' | 'system';
    title: string;
    description: string;
    time: string;
    read: boolean;
    link?: string;
}

interface NotificationsDropdownProps {
    isOpen: boolean;
    onClose: () => void;
}

const mockNotifications: Notification[] = [
    {
        id: 1,
        type: 'payment',
        title: 'Payment Received',
        description: 'Rent payment of $2,450 received from John Doe',
        time: '5 min ago',
        read: false,
        link: '/landlord/transactions',
    },
    {
        id: 2,
        type: 'maintenance',
        title: 'Maintenance Request',
        description: 'New request: HVAC not cooling at 5500 Highland Park',
        time: '1 hour ago',
        read: false,
        link: '/landlord/maintenance/1',
    },
    {
        id: 3,
        type: 'application',
        title: 'New Application',
        description: 'Sarah Williams applied for 1243 Oakwood Ave',
        time: '3 hours ago',
        read: true,
        link: '/landlord/applicants',
    },
    {
        id: 4,
        type: 'message',
        title: 'New Message',
        description: 'Agent Marcus replied to your inquiry',
        time: 'Yesterday',
        read: true,
        link: '/messages',
    },
    {
        id: 5,
        type: 'alert',
        title: 'Lease Expiring Soon',
        description: 'Lease for Unit 4B expires in 30 days',
        time: '2 days ago',
        read: true,
        link: '/landlord/leases',
    },
];

const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
        case 'message': return 'chat';
        case 'alert': return 'warning';
        case 'payment': return 'payments';
        case 'maintenance': return 'build';
        case 'application': return 'description';
        case 'system': return 'info';
        default: return 'notifications';
    }
};

const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
        case 'message': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
        case 'alert': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
        case 'payment': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
        case 'maintenance': return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
        case 'application': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
        case 'system': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        default: return 'bg-slate-100 text-slate-600';
    }
};

export default function NotificationsDropdown({ isOpen, onClose }: NotificationsDropdownProps) {
    const [notifications, setNotifications] = useState(mockNotifications);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const markAsRead = (id: number) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    if (!isOpen) return null;

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#1a2632] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
            {/* Header */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="size-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-xs font-semibold text-[#137fec] hover:underline"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="py-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2 block">
                            notifications_off
                        </span>
                        <p className="text-sm text-slate-500">No notifications</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <Link
                            key={notification.id}
                            to={notification.link || '#'}
                            onClick={() => {
                                markAsRead(notification.id);
                                onClose();
                            }}
                            className={`block px-4 py-3 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${!notification.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                }`}
                        >
                            <div className="flex gap-3">
                                <div className={`size-10 rounded-full flex items-center justify-center shrink-0 ${getNotificationColor(notification.type)}`}>
                                    <span className="material-symbols-outlined text-[20px]">
                                        {getNotificationIcon(notification.type)}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-semibold truncate ${!notification.read ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {notification.title}
                                        </p>
                                        {!notification.read && (
                                            <span className="size-2 bg-[#137fec] rounded-full shrink-0 mt-1.5"></span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {notification.description}
                                    </p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                        {notification.time}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
                <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                        onClick={clearAll}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                        Clear all
                    </button>
                    <Link
                        to="/notifications"
                        onClick={onClose}
                        className="text-xs font-semibold text-[#137fec] hover:underline flex items-center gap-1"
                    >
                        View all
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
