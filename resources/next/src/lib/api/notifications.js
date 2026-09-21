import { apiRequest } from '@/lib/api/client';

export async function listNotifications(limit = 20) {
    return apiRequest('notifications', {
        query: { limit },
    });
}

export async function markNotificationRead(id) {
    return apiRequest(
        `notifications/${encodeURIComponent(id)}/read`,
        { method: 'POST' },
    );
}

export async function markAllNotificationsRead() {
    return apiRequest('notifications/read-all', {
        method: 'POST',
    });
}
