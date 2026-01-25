import api from './api';
import { USE_MOCK_DATA } from '../data/mockData';

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
    if (USE_MOCK_DATA) {
      // Retourner des données mock
      return {
        success: true,
        data: [
          {
            id: '1',
            userId: '1',
            acquiredAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
            usedAt: null,
            transferredToId: null,
          },
          {
            id: '2',
            userId: '1',
            acquiredAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            expiresAt: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
            usedAt: null,
            transferredToId: null,
          },
        ],
      };
    }
    const response = await api.get('/bonus-donors');
    return response.data;
  },

  /**
   * Transfère un bonus donateur à un autre membre (Premium uniquement)
   */
  async transferBonus(bonusId: string, recipientUsername: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (USE_MOCK_DATA) {
      // Simuler un transfert réussi
      return {
        success: true,
        message: 'Bonus transféré avec succès',
      };
    }
    const response = await api.post(`/bonus-donors/${bonusId}/transfer`, {
      recipientUsername,
    });
    return response.data;
  },
};
