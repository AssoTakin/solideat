import { environmentalService } from '../environmental.service';
import prisma from '../../config/database';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    reservation: {
      count: jest.fn(),
    },
  },
}));

describe('EnvironmentalService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEnvironmentalImpact', () => {
    it('should throw error if user is not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(environmentalService.getEnvironmentalImpact('user-id')).rejects.toThrow(
        'Utilisateur non trouvé'
      );
    });

    it('should throw error if user is not premium', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
        mealsSaved: 5,
      });

      await expect(environmentalService.getEnvironmentalImpact('user-id')).rejects.toThrow(
        'Cette fonctionnalité est réservée aux membres premium'
      );
    });

    it('should calculate environmental impact for premium user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'PREMIUM_MONTHLY',
        mealsSaved: 10,
      });

      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(3) // monthly
        .mockResolvedValueOnce(8) // yearly
        .mockResolvedValue(2); // monthly history (12 times)

      const result = await environmentalService.getEnvironmentalImpact('user-id');

      expect(result.total.mealsSaved).toBe(10);
      expect(result.total.co2Avoided).toBe(25); // 10 * 2.5
      expect(result.monthly.mealsSaved).toBe(3);
      expect(result.monthly.co2Avoided).toBe(7.5); // 3 * 2.5
      expect(result.yearly.mealsSaved).toBe(8);
      expect(result.yearly.co2Avoided).toBe(20); // 8 * 2.5
      expect(result.monthlyHistory).toHaveLength(12);
    });
  });
});
