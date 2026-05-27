// Service mock pour les notifications
import { mockNotifications, mockSystemMessages, USE_MOCK_DATA } from '../data/mockData';


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

  async getSystemMessages(): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const unread = mockSystemMessages.filter((m) => !m.read);
    const read = mockSystemMessages.filter((m) => m.read);

    return {
      success: true,
      data: {
        unread,
        read,
        unreadCount: unread.length,
      },
    };
  },

  async markSystemMessageAsRead(messageId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const message = mockSystemMessages.find((m) => m.id === messageId);
    if (message) {
      message.read = true;
      (message as any).readAt = new Date().toISOString();
    }

    return {
      success: true,
      message: 'Message système marqué comme lu',
    };
  },

  async getUnreadCount(): Promise<{ success: boolean; data?: { count: number }; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const unreadNotificationsCount = mockNotifications.filter((n) => !n.read).length;
    const unreadSystemMessagesCount = mockSystemMessages.filter((m) => !m.read).length;

    return {
      success: true,
      data: {
        count: unreadNotificationsCount + unreadSystemMessagesCount,
      },
    };
  },
};

