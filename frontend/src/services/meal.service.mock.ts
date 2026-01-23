// Service mock pour les repas - utilise les données virtuelles
import { mockMeals, mockSaveThemMeals, USE_MOCK_DATA } from '../data/mockData';
import { Meal, MealsResponse } from './meal.service';

export const mealServiceMock = {
  async getMeals(filters?: any): Promise<MealsResponse> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    let meals = [...mockMeals];

    // Appliquer les filtres
    if (filters?.status) {
      meals = meals.filter((m) => m.status === filters.status);
    }

    if (filters?.maxDistance) {
      meals = meals.filter((m) => m.distance <= filters.maxDistance);
    }

    if (filters?.portions) {
      meals = meals.filter((m) => m.portions >= filters.portions);
    }

    // Tri
    if (filters?.sortBy === 'distance') {
      meals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const skip = (page - 1) * limit;

    return {
      success: true,
      data: {
        meals: meals.slice(skip, skip + limit),
        total: meals.length,
        page,
        limit,
      },
    };
  },

  async getMealById(id: string): Promise<{ success: boolean; data?: Meal; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const meal = mockMeals.find((m) => m.id === id);
    if (!meal) {
      return { success: false, error: 'Repas non trouvé' };
    }

    return { success: true, data: meal as any };
  },

  async getSaveThemMeals(limit?: number): Promise<{ success: boolean; data?: { meals: Meal[]; total: number }; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const meals = limit ? mockSaveThemMeals.slice(0, limit) : mockSaveThemMeals;

    return {
      success: true,
      data: {
        meals: meals as any[],
        total: mockSaveThemMeals.length,
      },
    };
  },

  async createMeal(data: any): Promise<{ success: boolean; data?: Meal; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const newMeal = {
      ...data,
      id: `meal-${Date.now()}`,
      status: 'AVAILABLE',
      cook: mockMeals[0].cook, // Utilisateur actuel
      distance: Math.random() * 5, // Distance aléatoire
    };

    mockMeals.push(newMeal as any);

    return { success: true, data: newMeal as any };
  },
};
