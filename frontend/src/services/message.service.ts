import api from './api';

export interface Message {
  id: string;
  mealId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  readAt?: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    profilePhoto?: string;
  };
  receiver: {
    id: string;
    username: string;
    profilePhoto?: string;
  };
  meal: {
    id: string;
    name: string;
    photo: string;
    status: string;
  };
}

export interface Conversation {
  mealId: string;
  meal: {
    id: string;
    name: string;
    photo: string;
    status: string;
  };
  otherUser: {
    id: string;
    username: string;
    profilePhoto?: string;
  };
  lastMessage: Message;
  unreadCount: number;
  messages: Message[];
}

export interface SendMessageDto {
  mealId: string;
  content: string;
}

export const messageService = {
  /**
   * Envoyer un message
   */
  async sendMessage(data: SendMessageDto): Promise<{ success: boolean; data?: Message; error?: string }> {
    const response = await api.post('/messages', data);
    return response.data;
  },

  /**
   * Récupérer les conversations
   */
  async getConversations(): Promise<{ success: boolean; data?: Conversation[]; error?: string }> {
    const response = await api.get('/messages');
    return response.data;
  },

  /**
   * Récupérer les messages d'une conversation
   */
  async getConversationMessages(mealId: string): Promise<{ success: boolean; data?: Message[]; error?: string }> {
    const response = await api.get(`/messages/conversation/${mealId}`);
    return response.data;
  },

  /**
   * Marquer un message comme lu
   */
  async markAsRead(messageId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.put(`/messages/${messageId}/read`);
    return response.data;
  },

  /**
   * Récupérer le nombre de messages non lus
   */
  async getUnreadCount(): Promise<{ success: boolean; data?: { count: number }; error?: string }> {
    const response = await api.get('/messages/unread-count');
    return response.data;
  },
};
