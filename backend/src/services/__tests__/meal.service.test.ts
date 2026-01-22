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

  describe('calculateDistance', () => {
    it('devrait calculer la distance entre deux points', () => {
      // Paris (48.8566, 2.3522) à Lyon (45.7640, 4.8357) ≈ 392 km
      const distance = mealService.calculateDistance(48.8566, 2.3522, 45.7640, 4.8357);

      expect(distance).toBeGreaterThan(390);
      expect(distance).toBeLessThan(400);
    });

    it('devrait retourner 0 pour les mêmes coordonnées', () => {
      const distance = mealService.calculateDistance(48.8566, 2.3522, 48.8566, 2.3522);

      expect(distance).toBeCloseTo(0, 1);
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
