/**
 * Notification Service
 * API calls for notifications and devices
 */

import { api } from '../client';
import { API_ENDPOINTS } from '../config';
import type {
    Notification,
    NotificationDevice,
    NotificationPreferences,
} from '../../../types/dashboard';

/**
 * Get user's notifications
 */
export async function getNotifications(params?: { page?: number; limit?: number; type?: string }) {
    return api.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.LIST, params);
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
    return api.get<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
}

/**
 * Mark notifications as read
 */
export async function markAsRead(notificationIds: string[]) {
    return api.post<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ, { notificationIds });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
    return api.post<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
}

/**
 * Get registered devices
 */
export async function getDevices() {
    return api.get<NotificationDevice[]>(API_ENDPOINTS.NOTIFICATIONS.DEVICES);
}

/**
 * Register a device for push notifications
 */
export async function registerDevice(data: { token: string; platform: 'ios' | 'android' | 'web'; deviceName?: string }) {
    return api.post<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.DEVICES, data);
}

/**
 * Unregister a device
 */
export async function unregisterDevice(token: string) {
    return api.delete<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.DEVICE(token));
}

/**
 * Get notification preferences
 */
export async function getPreferences() {
    return api.get<NotificationPreferences>(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES);
}

/**
 * Update notification preferences
 */
export async function updatePreferences(data: Partial<NotificationPreferences>) {
    return api.put<NotificationPreferences>(API_ENDPOINTS.NOTIFICATIONS.PREFERENCES, data);
}

/**
 * Delete specific notifications
 */
export async function deleteNotifications(notificationIds: string[]) {
    return api.delete<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.DELETE, { notificationIds });
}

/**
 * Clear all notifications
 */
export async function clearAllNotifications() {
    return api.delete<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL);
}

/**
 * Send a notification (Admin only)
 */
export async function sendNotification(data: { userId: string; title: string; body: string; type: string }) {
    return api.post<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.SEND, data);
}

// Export all functions as named exports and as default object
export const notificationService = {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    getDevices,
    registerDevice,
    unregisterDevice,
    getPreferences,
    updatePreferences,
    deleteNotifications,
    clearAllNotifications,
    sendNotification,
};

export default notificationService;
