// Service mock pour les notifications
import { mockNotifications, USE_MOCK_DATA } from '../data/mockData';

export const notificationServiceMock = {
  async getNotifications(read?: boolean): Promise<{ success: boolean; data?: any[]; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    let notifications = [...mockNotifications];

    if (read !== undefined) {
      notifications = notifications.filter((n) => n.read === read);
    }

    return {
      success: true,
      data: notifications,
    };
  },

  async markAsRead(notificationId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const notification = mockNotifications.find((n) => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }

    return { success: true, message: 'Notification marquée comme lue' };
  },

  async markAllAsRead(): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    mockNotifications.forEach((n) => {
      n.read = true;
    });

    return { success: true, message: 'Toutes les notifications marquées comme lues' };
  },
};
