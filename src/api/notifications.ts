/**
 * Notifications API
 */
import api from './client';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export const notifApi = {
  /** 取得所有通知 */
  getAll: (params?: { unread_only?: boolean }) => {
    const qs = params?.unread_only ? '?unread_only=true' : '';
    return api.get<{ notifications: Notification[]; total: number }>(
      `/api/events/notifications${qs}`,
    );
  },

  /** 取得未讀數 */
  getUnreadCount: () =>
    api.get<{ count: number }>('/api/events/notifications/unread'),

  /** 標記已讀 */
  markRead: (id: number) =>
    api.post(`/api/events/notifications/${id}/read`),

  /** 全部已讀 */
  markAllRead: () => api.post('/api/events/notifications/read-all'),
};
