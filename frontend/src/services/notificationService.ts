import request from '../utils/request';
import type { Notification, ApiResponse, PageResponse } from '../types';

export const notificationService = {
  getNotifications: (page: number, size: number) =>
    request.get<ApiResponse<PageResponse<Notification>>>('/notifications', { params: { page, size } }),

  getUnreadCount: () =>
    request.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAsRead: (id: number) =>
    request.put<ApiResponse<void>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    request.put<ApiResponse<void>>('/notifications/read-all'),
};
