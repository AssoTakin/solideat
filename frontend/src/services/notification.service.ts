import api from './api';
import { notificationServiceMock } from './notification.service.mock';
import { USE_MOCK_DATA } from '../data/mockData';

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
    try {
      const response = await api.get('/notifications/system');
      return response.data;
    } catch (error: any) {
      // Si erreur 401, l'intercepteur API gère la redirection
      if (error.response?.status === 401) {
        throw error; // Laisser l'intercepteur gérer
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du chargement des messages système',
      };
    }
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
    if (USE_MOCK_DATA) {
      return notificationServiceMock.getNotifications(read);
    }
    const params = read !== undefined ? { read: read.toString() } : {};
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (USE_MOCK_DATA) {
      return notificationServiceMock.markAsRead(notificationId);
    }
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<{ success: boolean; message?: string; error?: string }> {
    if (USE_MOCK_DATA) {
      return notificationServiceMock.markAllAsRead();
    }
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
