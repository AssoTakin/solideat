import api from './api';

export interface Meal {
  id: string;
  name: string;
  photo: string;
  description?: string;
  preparationDate: string;
  serviceDate: string;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  expirationDate: string;
  ingredients: Array<{ name: string; allergens?: string[] }>;
  portions: number;
  price?: number | null;
  status: string;
  cook: {
    id: string;
    username: string;
    profilePhoto?: string;
    globalRating: number;
    addressCity: string;
  };
  distance?: number;
}

export interface CreateMealDto {
  name: string;
  photo: string;
  description?: string;
  preparationDate: string;
  serviceDate: string;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  pickupAddress: string;
  pickupLatitude: number;
  pickupLongitude: number;
  ingredients: Array<{ name: string; allergens?: string[] }>;
  portions: number;
  price?: number | null;
}

export interface MealsResponse {
  success: boolean;
  data: {
    meals: Meal[];
    total: number;
    page: number;
    limit: number;
  };
}

export const mealService = {
  /**
   * Créer un repas
   */
  async createMeal(data: CreateMealDto): Promise<{ success: boolean; data?: Meal; error?: string }> {
    const response = await api.post('/meals', data);
    return response.data;
  },

  /**
   * Récupérer la liste des repas avec filtres avancés
   */
  async getMeals(filters?: {
    status?: string;
    date?: string;
    portions?: number;
    page?: number;
    limit?: number;
    // Filtres de base
    maxDistance?: number;
    cuisine?: string;
    hour?: string;
    // Filtres avancés (premium)
    minRating?: number;
    preparationDate?: string;
    // Tri
    sortBy?: 'distance' | 'date' | 'rating' | 'expiration';
    sortOrder?: 'asc' | 'desc';
  }): Promise<MealsResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.portions) params.append('portions', filters.portions.toString());
    if (filters?.maxDistance) params.append('maxDistance', filters.maxDistance.toString());
    if (filters?.cuisine) params.append('cuisine', filters.cuisine);
    if (filters?.hour) params.append('hour', filters.hour);
    if (filters?.minRating) params.append('minRating', filters.minRating.toString());
    if (filters?.preparationDate) params.append('preparationDate', filters.preparationDate);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get<MealsResponse>(`/meals?${params.toString()}`);
    return response.data;
  },

  /**
   * Récupérer les détails d'un repas
   */
  async getMealById(id: string): Promise<{ success: boolean; data?: Meal; error?: string }> {
    const response = await api.get(`/meals/${id}`);
    return response.data;
  },

  /**
   * Modifier un repas
   */
  async updateMeal(id: string, data: Partial<CreateMealDto>): Promise<{ success: boolean; data?: Meal; error?: string }> {
    const response = await api.put(`/meals/${id}`, data);
    return response.data;
  },

  /**
   * Supprimer un repas
   */
  async deleteMeal(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.delete(`/meals/${id}`);
    return response.data;
  },
};
