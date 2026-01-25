import api from './api';
import { USE_MOCK_DATA } from '../data/mockData';

export interface EnvironmentalImpact {
  total: {
    mealsSaved: number;
    co2Avoided: number; // kg CO2
  };
  monthly: {
    mealsSaved: number;
    co2Avoided: number; // kg CO2
  };
  yearly: {
    mealsSaved: number;
    co2Avoided: number; // kg CO2
  };
  monthlyHistory: Array<{
    month: string; // Format YYYY-MM
    mealsSaved: number;
    co2Avoided: number;
  }>;
}

export const environmentalService = {
  /**
   * Récupère les statistiques d'impact environnemental (Premium uniquement)
   */
  async getEnvironmentalImpact(): Promise<{ success: boolean; data?: EnvironmentalImpact; error?: string }> {
    if (USE_MOCK_DATA) {
      // Retourner des données mock
      return {
        success: true,
        data: {
          total: {
            mealsSaved: 45,
            co2Avoided: 12.5,
          },
          monthly: {
            mealsSaved: 8,
            co2Avoided: 2.2,
          },
          yearly: {
            mealsSaved: 45,
            co2Avoided: 12.5,
          },
          monthlyHistory: [
            { month: '2026-01', mealsSaved: 8, co2Avoided: 2.2 },
            { month: '2025-12', mealsSaved: 12, co2Avoided: 3.3 },
            { month: '2025-11', mealsSaved: 10, co2Avoided: 2.8 },
          ],
        },
      };
    }
    const response = await api.get('/users/me/environmental-impact');
    return response.data;
  },
};
