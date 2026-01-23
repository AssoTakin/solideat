import api from './api';

export interface BonusDonor {
  id: string;
  userId: string;
  acquiredAt: string;
  expiresAt: string;
  usedAt: string | null;
  transferredToId: string | null;
}

export const bonusDonorService = {
  /**
   * Récupère les bonus donateurs disponibles
   */
  async getAvailableBonuses(): Promise<{ success: boolean; data?: BonusDonor[]; error?: string }> {
    const response = await api.get('/bonus-donors');
    return response.data;
  },

  /**
   * Transfère un bonus donateur à un autre membre (Premium uniquement)
   */
  async transferBonus(bonusId: string, recipientUsername: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.post(`/bonus-donors/${bonusId}/transfer`, {
      recipientUsername,
    });
    return response.data;
  },
};
