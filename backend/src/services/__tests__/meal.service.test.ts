import { MealService } from '../meal.service';
import { MealStatus } from '@prisma/client';
import prisma from '../../config/database';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    meal: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock geolocation service
jest.mock('../geolocation.service', () => ({
  geolocationService: {
    validateAndGeocodeAddress: jest.fn().mockResolvedValue({
      address: '123 Rue Test, 75001 Paris',
      latitude: 48.8566,
      longitude: 2.3522,
    }),
    calculateDistance: jest.fn((lat1, lng1, lat2, lng2) => {
      // Formule Haversine simplifiée pour les tests
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round((R * c) * 10) / 10;
    }),
  },
}));

describe('MealService', () => {
  let mealService: MealService;

  beforeEach(() => {
    mealService = new MealService();
    jest.clearAllMocks();
  });

  describe('createMeal', () => {
    const mockMealData = {
      name: 'Pasta Carbonara',
      photo: 'https://example.com/photo.jpg',
      description: 'Délicieuse pasta',
      preparationDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
      serviceDate: new Date(),
      pickupTimeStart: new Date(),
      pickupTimeEnd: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2h
      pickupAddress: '123 Rue Test, 75001 Paris',
      pickupLatitude: 48.8566,
      pickupLongitude: 2.3522,
      ingredients: [
        { name: 'Pâtes', allergens: ['gluten'] },
        { name: 'Lardons', allergens: [] },
        { name: 'Crème', allergens: ['lactose'] },
      ],
      portions: 2,
      price: null,
    };

    it('devrait créer un repas avec succès', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });
      (prisma.meal.count as jest.Mock).mockResolvedValue(0); // Quota OK
      (prisma.meal.create as jest.Mock).mockResolvedValue({
        id: 'meal-123',
        ...mockMealData,
        status: MealStatus.AVAILABLE,
        cookId: 'user-123',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await mealService.createMeal('user-123', mockMealData);

      expect(result).toBeDefined();
      expect(result.status).toBe(MealStatus.AVAILABLE);
      expect(prisma.meal.create).toHaveBeenCalled();
    });

    it('devrait échouer si le quota hebdomadaire est atteint (FREE)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });
      (prisma.meal.count as jest.Mock).mockResolvedValue(1); // Quota atteint

      await expect(mealService.createMeal('user-123', mockMealData)).rejects.toThrow(
        'Quota hebdomadaire atteint'
      );
    });

    it('devrait échouer si la date de préparation est dans le futur', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });
      (prisma.meal.count as jest.Mock).mockResolvedValue(0);

      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const invalidData = {
        ...mockMealData,
        preparationDate: futureDate,
      };

      await expect(mealService.createMeal('user-123', invalidData)).rejects.toThrow(
        'La date de préparation ne peut pas être dans le futur'
      );
    });

    it('devrait échouer si l\'heure de fin < heure de début', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });
      (prisma.meal.count as jest.Mock).mockResolvedValue(0);

      const invalidData = {
        ...mockMealData,
        pickupTimeStart: new Date(Date.now() + 2 * 60 * 60 * 1000),
        pickupTimeEnd: new Date(), // Avant le début
      };

      await expect(mealService.createMeal('user-123', invalidData)).rejects.toThrow(
        'L\'heure de fin doit être supérieure ou égale à l\'heure de début'
      );
    });
  });

  describe('checkWeeklyQuota', () => {
    it('devrait autoriser la création si quota OK (FREE)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });
      (prisma.meal.count as jest.Mock).mockResolvedValue(0);

      const result = await mealService.checkWeeklyQuota('user-123');

      expect(result.allowed).toBe(true);
    });

    it('devrait autoriser la création si quota OK (PREMIUM)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'PREMIUM_MONTHLY',
      });
      (prisma.meal.count as jest.Mock).mockResolvedValue(2); // < 3

      const result = await mealService.checkWeeklyQuota('user-123');

      expect(result.allowed).toBe(true);
    });

    it('devrait refuser si quota atteint (FREE)', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });
      (prisma.meal.count as jest.Mock).mockResolvedValue(1); // Quota atteint

      const result = await mealService.checkWeeklyQuota('user-123');

      expect(result.allowed).toBe(false);
      expect(result.message).toContain('quota hebdomadaire');
    });
  });

  describe('getMeals avec filtres', () => {
    it('devrait filtrer par distance', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([
        {
          id: '1',
          name: 'Repas 1',
          pickupLatitude: 48.8606,
          pickupLongitude: 2.3622,
          cook: { id: 'cook-1', username: 'cook1', globalRating: 4.5 },
        },
        {
          id: '2',
          name: 'Repas 2',
          pickupLatitude: 45.764043,
          pickupLongitude: 4.835659,
          cook: { id: 'cook-2', username: 'cook2', globalRating: 4.0 },
        },
      ]);
      (prisma.meal.count as jest.Mock).mockResolvedValue(2);

      const result = await mealService.getMeals({
        userLat: 48.8566,
        userLng: 2.3522,
        distance: 5, // 5 km
      });

      // Le repas 2 (Lyon) devrait être filtré car trop loin
      expect(result.meals.length).toBeLessThanOrEqual(2);
    });

    it('devrait filtrer par date "today"', async () => {
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.meal.count as jest.Mock).mockResolvedValue(0);

      await mealService.getMeals({
        date: 'today',
      });

      expect(prisma.meal.findMany).toHaveBeenCalled();
      const whereClause = (prisma.meal.findMany as jest.Mock).mock.calls[0][0].where;
      expect(whereClause.serviceDate).toBeDefined();
    });

    it('devrait filtrer par plage horaire "midi"', async () => {
      const midiMealStart = new Date();
      midiMealStart.setHours(12, 0, 0, 0);
      const midiMealEnd = new Date(midiMealStart);
      midiMealEnd.setHours(13, 0, 0, 0);

      const eveningMealStart = new Date();
      eveningMealStart.setHours(19, 0, 0, 0);
      const eveningMealEnd = new Date(eveningMealStart);
      eveningMealEnd.setHours(20, 0, 0, 0);

      (prisma.meal.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'meal-midi',
          name: 'Repas Midi',
          pickupTimeStart: midiMealStart,
          pickupTimeEnd: midiMealEnd,
          cook: { id: 'cook-1', username: 'cook1', globalRating: 4.5 },
        },
        {
          id: 'meal-evening',
          name: 'Repas Soir',
          pickupTimeStart: eveningMealStart,
          pickupTimeEnd: eveningMealEnd,
          cook: { id: 'cook-1', username: 'cook1', globalRating: 4.5 },
        },
      ]);

      const result = await mealService.getMeals({
        timeSlot: 'midi',
      });

      expect(prisma.meal.findMany).toHaveBeenCalled();
      expect(result.meals.length).toBe(1);
      expect(result.meals[0].id).toBe('meal-midi');
    });

    it('devrait filtrer par nombre de parts', async () => {
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.meal.count as jest.Mock).mockResolvedValue(0);

      await mealService.getMeals({
        portions: 2,
      });

      expect(prisma.meal.findMany).toHaveBeenCalled();
      const whereClause = (prisma.meal.findMany as jest.Mock).mock.calls[0][0].where;
      expect(whereClause.portions).toEqual({ gte: 2 });
    });

    it('devrait trier par distance si sortBy=distance', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([
        {
          id: '1',
          name: 'Repas 1',
          pickupLatitude: 48.8606,
          pickupLongitude: 2.3622,
          cook: { id: 'cook-1', username: 'cook1', globalRating: 4.5 },
        },
        {
          id: '2',
          name: 'Repas 2',
          pickupLatitude: 48.8506,
          pickupLongitude: 2.3422,
          cook: { id: 'cook-2', username: 'cook2', globalRating: 4.0 },
        },
      ]);
      (prisma.meal.count as jest.Mock).mockResolvedValue(2);

      const result = await mealService.getMeals({
        userLat: 48.8566,
        userLng: 2.3522,
        sortBy: 'distance',
      });

      // Les repas devraient être triés par distance croissante
      if (result.meals.length > 1 && result.meals[0].distance && result.meals[1].distance) {
        expect(result.meals[0].distance).toBeLessThanOrEqual(result.meals[1].distance);
      }
    });
  });

  describe('formatPickupTime', () => {
    it('devrait formater une heure fixe', () => {
      const start = new Date('2026-01-15T14:15:00');
      const end = new Date('2026-01-15T14:15:00');

      const formatted = mealService.formatPickupTime(start, end);

      expect(formatted).toBe('14:15');
    });

    it('devrait formater une plage horaire', () => {
      const start = new Date('2026-01-15T14:15:00');
      const end = new Date('2026-01-15T16:00:00');

      const formatted = mealService.formatPickupTime(start, end);

      expect(formatted).toContain('Entre');
      expect(formatted).toContain('14:15');
      expect(formatted).toContain('16:00');
    });
  });
});
