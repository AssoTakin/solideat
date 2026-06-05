import { antiGaspiService } from '../antigaspi.service';
import prisma from '../../config/database';
import { MealStatus } from '@prisma/client';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    meal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('AntiGaspiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAntiGaspiMeals', () => {
    it('should retrieve expiring meals with calculated remaining hours', async () => {
      const now = new Date();
      const mockMeals = [
        {
          id: 'meal-1',
          name: 'Repas 1',
          inSaveThem: true,
          status: MealStatus.AVAILABLE,
          expirationDate: new Date(now.getTime() + 5 * 60 * 60 * 1000 + 60000), // Expire dans 5h (avec marge)
          pickupLatitude: 48.8566,
          pickupLongitude: 2.3522,
          cook: {
            id: 'cook-1',
            username: 'Chef',
          },
        },
      ];

      (prisma.meal.findMany as jest.Mock).mockResolvedValue(mockMeals);
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);

      const result = await antiGaspiService.getAntiGaspiMeals({});

      expect(result.meals).toHaveLength(1);
      expect(result.meals[0].id).toBe('meal-1');
      expect(result.meals[0].hoursRemaining).toBe(5);
      expect(result.total).toBe(1);
    });

    it('should calculate distances if coordinates are provided', async () => {
      const now = new Date();
      const mockMeals = [
        {
          id: 'meal-1',
          name: 'Repas 1',
          inSaveThem: true,
          status: MealStatus.AVAILABLE,
          expirationDate: new Date(now.getTime() + 10 * 60 * 60 * 1000 + 60000), // Expire dans 10h (avec marge)
          pickupLatitude: 48.8566,
          pickupLongitude: 2.3522,
          cook: {
            id: 'cook-1',
            username: 'Chef',
          },
        },
      ];

      (prisma.meal.findMany as jest.Mock).mockResolvedValue(mockMeals);
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);

      const result = await antiGaspiService.getAntiGaspiMeals({
        userLat: 48.8566,
        userLng: 2.3522,
      });

      expect(result.meals[0].distance).toBeDefined();
      expect(result.meals[0].distance).toBe(0); // Coordonnées identiques
    });
  });

  describe('addToAntiGaspi', () => {
    it('should throw error if meal is not found', async () => {
      (prisma.meal.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(antiGaspiService.addToAntiGaspi('invalid-id')).rejects.toThrow(
        'Repas non trouvé'
      );
    });

    it('should update meal inSaveThem and status if expiration is <= 24 hours', async () => {
      const now = new Date();
      const mockMeal = {
        id: 'meal-1',
        expirationDate: new Date(now.getTime() + 12 * 60 * 60 * 1000 + 60000), // 12h (avec marge)
      };

      (prisma.meal.findUnique as jest.Mock).mockResolvedValue(mockMeal);
      (prisma.meal.update as jest.Mock).mockResolvedValue({ ...mockMeal, inSaveThem: true });

      await antiGaspiService.addToAntiGaspi('meal-1');

      expect(prisma.meal.update).toHaveBeenCalledWith({
        where: { id: 'meal-1' },
        data: {
          inSaveThem: true,
          status: MealStatus.AVAILABLE,
        },
      });
    });

    it('should not update meal if expiration is > 24 hours', async () => {
      const now = new Date();
      const mockMeal = {
        id: 'meal-1',
        expirationDate: new Date(now.getTime() + 30 * 60 * 60 * 1000), // 30h
      };

      (prisma.meal.findUnique as jest.Mock).mockResolvedValue(mockMeal);

      await antiGaspiService.addToAntiGaspi('meal-1');

      expect(prisma.meal.update).not.toHaveBeenCalled();
    });
  });

  describe('processExpiringMeals', () => {
    it('should update all available expiring meals to inSaveThem', async () => {
      const expiringMeals = [{ id: 'meal-1' }, { id: 'meal-2' }];
      (prisma.meal.findMany as jest.Mock).mockResolvedValue(expiringMeals);
      (prisma.meal.updateMany as jest.Mock).mockResolvedValue({ count: 2 });

      await antiGaspiService.processExpiringMeals();

      expect(prisma.meal.updateMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['meal-1', 'meal-2'],
          },
        },
        data: {
          inSaveThem: true,
        },
      });
    });
  });
});
