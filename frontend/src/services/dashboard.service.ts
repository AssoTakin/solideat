import api from './api';
import { dashboardServiceMock } from './dashboard.service.mock';
import { USE_MOCK_DATA } from '../data/mockData';

export interface DashboardStats {
  activity: {
    mealsProposed: {
      available: number;
      reserved: number;
    };
    mealsReserved: {
      reserved: number;
      upcoming: number;
    };
    mealsPendingReview: number;
  };
  history: {
    mealsServed: number;
    mealsReceived: number;
    mealsExpired: number;
    mealsCancelled: number;
  };
  personal: {
    globalRating: number;
    mealsServed: number;
    mealsReceived: number;
    bonusDonorsAvailable: number;
    badges: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      earnedAt: string;
    }>;
    registrationDate: string;
  };
  premium?: {
    mealsSaved: number;
    co2Avoided: number;
    monthlyImpact: {
      mealsSaved: number;
      co2Avoided: number;
    };
    yearlyImpact: {
      mealsSaved: number;
      co2Avoided: number;
    };
  };
  quotas: {
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
      activeSanctions: any[];
    };
  };
}

export const dashboardService = {
  /**
   * Récupérer les statistiques du tableau de bord
   */
  async getDashboardStats(): Promise<{ success: boolean; data?: DashboardStats; error?: string }> {
    if (USE_MOCK_DATA) {
      return dashboardServiceMock.getDashboardStats();
    }
    const response = await api.get('/users/me/dashboard');
    return response.data;
  },
};
