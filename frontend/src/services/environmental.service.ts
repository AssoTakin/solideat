import api from './api';

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
    const response = await api.get('/users/me/environmental-impact');
    return response.data;
  },
};
