import api from './api';
import { USE_MOCK_DATA, mockDashboardStats } from '../data/mockData';


export interface QuotaStatus {
  weekly: {
    reservations: { current: number; limit: number };
    proposals: { current: number; limit: number };
  };
  monthly: {
    cancellations: { current: number; limit: number; isReduced?: boolean; explanation?: string };
    notPickedUp: { current: number; limit: number; isReduced?: boolean; explanation?: string };
  };
  sanctions?: {
    reservationBlocked: boolean;
    cancellationBlocked: boolean;
    activeSanctions: Array<{
      id: string;
      type: string;
      reason: string;
      startDate: string;
      endDate?: string;
    }>;
  };
}

export const quotaService = {
  /**
   * Récupérer le statut détaillé des quotas
   */
  async getQuotaStatus(): Promise<{ success: boolean; data?: QuotaStatus; error?: string }> {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        data: mockDashboardStats.quotas,
      };
    }
    try {
      const response = await api.get('/users/me/quotas');
      return response.data;
    } catch (error: any) {
      // Si erreur 401, l'intercepteur API gère la redirection
      if (error.response?.status === 401) {
        throw error; // Laisser l'intercepteur gérer
      }
      return {
        success: false,
        error: error.response?.data?.error || 'Erreur lors du chargement des quotas',
      };
    }
  },
};
