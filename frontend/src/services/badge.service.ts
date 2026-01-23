import api from './api';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  premiumOnly: boolean;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  badge: Badge;
  earnedAt: string;
}

export const badgeService = {
  /**
   * Récupère les badges de l'utilisateur connecté
   */
  async getMyBadges(): Promise<{ success: boolean; data?: UserBadge[]; error?: string }> {
    const response = await api.get('/badges');
    return response.data;
  },
};
