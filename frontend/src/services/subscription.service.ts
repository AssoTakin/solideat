import api from './api';
import { USE_MOCK_DATA, mockSubscriptionPlans, mockUsers } from '../data/mockData';

let mockCurrentSubscription: any = null;


export interface SubscriptionPlan {
  id: string;
  name: string;
  type: string;
  price: number;
  period: 'week' | 'month' | 'year';
  pricePerMonth: number;
  savings?: number;
  features: string[];
}

export interface CurrentSubscription {
  type: string;
  active: boolean;
  startDate?: string;
  endDate?: string;
  stripeCustomerId?: string;
}

export interface CreateSubscriptionDto {
  planId: string;
  paymentMethodId?: string; // Pour Stripe
}

export const subscriptionService = {
  /**
   * Récupère les plans d'abonnement disponibles
   */
  async getPlans(): Promise<{ success: boolean; data?: SubscriptionPlan[]; error?: string }> {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        data: mockSubscriptionPlans as any[],
      };
    }
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  /**
   * Récupère l'abonnement actuel de l'utilisateur
   */
  async getCurrentSubscription(): Promise<{ success: boolean; data?: CurrentSubscription; error?: string }> {
    if (USE_MOCK_DATA) {
      const isUserPremium = mockUsers[0].subscriptionType === 'PREMIUM';
      if (isUserPremium && !mockCurrentSubscription) {
        mockCurrentSubscription = {
          type: 'PREMIUM',
          active: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
      }
      return {
        success: true,
        data: mockCurrentSubscription || undefined,
      };
    }
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  /**
   * Crée un nouvel abonnement
   */
  async createSubscription(data: CreateSubscriptionDto): Promise<{ success: boolean; data?: any; error?: string }> {
    if (USE_MOCK_DATA) {
      mockCurrentSubscription = {
        type: 'PREMIUM',
        active: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      // Mettre à jour l'utilisateur connecté mocké
      const user = mockUsers[0] as any;
      user.subscriptionType = 'PREMIUM';
      return {
        success: true,
        data: mockCurrentSubscription,
      };
    }
    const response = await api.post('/subscriptions', data);
    return response.data;
  },

  /**
   * Annule l'abonnement actuel (US-036)
   */
  async cancelSubscription(): Promise<{ success: boolean; message?: string; error?: string }> {
    if (USE_MOCK_DATA) {
      mockCurrentSubscription = null;
      // Mettre à jour l'utilisateur connecté mocké
      const user = mockUsers[0] as any;
      user.subscriptionType = 'FREE';
      return {
        success: true,
        message: 'Abonnement annulé avec succès',
      };
    }
    const response = await api.delete('/subscriptions');
    return response.data;
  },
};
