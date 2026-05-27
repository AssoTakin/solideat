// Service mock pour les repas - utilise les données virtuelles
import { mockMeals, mockSaveThemMeals, USE_MOCK_DATA } from '../data/mockData';
import { Meal, MealsResponse } from './meal.service';

export const mealServiceMock = {
  async getMeals(filters?: any): Promise<MealsResponse> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    let meals = [...mockMeals];

    // 1. Filtrer par statut
    if (filters?.status) {
      meals = meals.filter((m) => m.status === filters.status);
    }

    // 2. Filtre distance
    if (filters?.maxDistance) {
      meals = meals.filter((m) => (m.distance || 0) <= filters.maxDistance);
    }

    // 3. Filtre portions
    if (filters?.portions) {
      meals = meals.filter((m) => m.portions >= filters.portions);
    }

    // 4. Filtre type de cuisine
    if (filters?.cuisine) {
      const cuisineLower = filters.cuisine.toLowerCase();
      meals = meals.filter((m) => 
        (m.cuisine && m.cuisine.toLowerCase() === cuisineLower) ||
        (m.cook?.culinaryStyle && m.cook.culinaryStyle.toLowerCase().includes(cuisineLower)) ||
        m.name.toLowerCase().includes(cuisineLower) ||
        m.ingredients?.some((i: any) => i.name.toLowerCase().includes(cuisineLower))
      );
    }

    // 5. Filtre date de service
    if (filters?.date) {
      const filterDateStr = filters.date;
      if (filterDateStr === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        meals = meals.filter((m) => m.serviceDate.startsWith(todayStr));
      } else if (filterDateStr === 'this-week') {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        meals = meals.filter((m) => {
          const sDate = new Date(m.serviceDate);
          return sDate >= startOfWeek && sDate < endOfWeek;
        });
      } else {
        meals = meals.filter((m) => m.serviceDate.startsWith(filterDateStr));
      }
    }

    // 6. Filtre heure / créneau horaire
    const hourOrSlot = filters?.hour || filters?.timeSlot;
    if (hourOrSlot && hourOrSlot !== 'all') {
      const slot = hourOrSlot.toLowerCase();
      meals = meals.filter((m) => {
        const start = new Date(m.pickupTimeStart);
        const startHour = start.getHours();
        const startMin = start.getMinutes();
        const startTotalMin = startHour * 60 + startMin;

        const end = new Date(m.pickupTimeEnd);
        const endHour = end.getHours();
        const endMin = end.getMinutes();
        const endTotalMin = endHour * 60 + endMin;

        if (slot === 'morning' || slot === 'matin') {
          return startHour >= 6 && startHour < 11;
        }
        if (slot === 'noon' || slot === 'midi') {
          return startHour >= 11 && startHour < 15;
        }
        if (slot === 'evening' || slot === 'soir') {
          return startHour >= 18 || startHour < 6;
        }

        // Heure précise HH:MM
        if (/^\d{2}:\d{2}$/.test(slot)) {
          const [fHour, fMin] = slot.split(':').map(Number);
          const fTotalMin = fHour * 60 + fMin;
          return fTotalMin >= startTotalMin && fTotalMin <= endTotalMin;
        }

        return true;
      });
    }

    // 7. Filtre note minimale (Premium)
    if (filters?.minRating) {
      meals = meals.filter((m) => m.cook && m.cook.globalRating >= filters.minRating);
    }

    // 8. Filtre date de préparation (Premium)
    if (filters?.preparationDate) {
      meals = meals.filter((m) => m.preparationDate.startsWith(filters.preparationDate));
    }

    // Tri
    if (filters?.sortBy === 'distance') {
      meals.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else if (filters?.sortBy === 'date') {
      meals.sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime());
    } else if (filters?.sortBy === 'rating') {
      meals.sort((a, b) => (b.cook?.globalRating || 0) - (a.cook?.globalRating || 0));
    } else if (filters?.sortBy === 'expiration') {
      meals.sort((a, b) => new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime());
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

  async updateMeal(id: string, data: any): Promise<{ success: boolean; data?: Meal; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const idx = mockMeals.findIndex((m) => m.id === id);
    if (idx === -1) {
      return { success: false, error: 'Repas non trouvé' };
    }

    const currentMeal = mockMeals[idx];
    const updatedMeal = {
      ...currentMeal,
      ...data,
      description: data.description !== undefined ? data.description : currentMeal.description,
      portions: data.portions !== undefined ? data.portions : currentMeal.portions,
    };

    mockMeals[idx] = updatedMeal;

    return { success: true, data: updatedMeal as any };
  },

  async deleteMeal(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const idx = mockMeals.findIndex((m) => m.id === id);
    if (idx === -1) {
      return { success: false, error: 'Repas non trouvé' };
    }

    mockMeals.splice(idx, 1);

    return { success: true, message: 'Repas supprimé avec succès' };
  },
};
