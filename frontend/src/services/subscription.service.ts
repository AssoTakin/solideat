import api from './api';

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
    const response = await api.get('/subscriptions/plans');
    return response.data;
  },

  /**
   * Récupère l'abonnement actuel de l'utilisateur
   */
  async getCurrentSubscription(): Promise<{ success: boolean; data?: CurrentSubscription; error?: string }> {
    const response = await api.get('/subscriptions/current');
    return response.data;
  },

  /**
   * Crée un nouvel abonnement
   */
  async createSubscription(data: CreateSubscriptionDto): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await api.post('/subscriptions', data);
    return response.data;
  },
};
