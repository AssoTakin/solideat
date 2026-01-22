import api from './api';

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
    const response = await api.get('/users/me/quotas');
    return response.data;
  },
};
