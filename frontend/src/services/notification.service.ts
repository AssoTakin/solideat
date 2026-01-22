import api from './api';

export interface SystemMessage {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  readAt?: string;
  link?: string;
  createdAt: string;
}

export interface SystemMessagesResponse {
  unread: SystemMessage[];
  read: SystemMessage[];
  unreadCount: number;
}

export const notificationService = {
  /**
   * Récupérer les messages système
   */
  async getSystemMessages(): Promise<{ success: boolean; data?: SystemMessagesResponse; error?: string }> {
    const response = await api.get('/notifications/system');
    return response.data;
  },

  /**
   * Marquer un message système comme lu
   */
  async markSystemMessageAsRead(messageId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.put(`/notifications/system/${messageId}/read`);
    return response.data;
  },

  /**
   * Récupérer toutes les notifications
   */
  async getNotifications(read?: boolean): Promise<{ success: boolean; data?: any[]; error?: string }> {
    const params = read !== undefined ? { read: read.toString() } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  /**
   * Récupérer le nombre de notifications non lues
   */
  async getUnreadCount(): Promise<{ success: boolean; data?: { count: number }; error?: string }> {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },
};
