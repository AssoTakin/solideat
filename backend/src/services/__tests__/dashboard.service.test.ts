import { DashboardService } from '../dashboard.service';
import prisma from '../../config/database';
import { SubscriptionType, MealStatus } from '@prisma/client';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    meal: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    reservation: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock quotaService
jest.mock('../quota.service', () => ({
  quotaService: {
    getQuotaStatus: jest.fn(),
  },
}));

import { quotaService } from '../quota.service';

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    dashboardService = new DashboardService();
    jest.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    const mockUserId = 'user-123';

    it('devrait retourner les statistiques du tableau de bord pour un utilisateur gratuit', async () => {
      const mockUser = {
        subscriptionType: SubscriptionType.FREE,
        globalRating: 4.5,
        mealsServed: 10,
        mealsReceived: 5,
        mealsExpired: 2,
        mealsSaved: 0,
        createdAt: new Date('2024-01-01'),
        badges: [],
        bonusDonors: [],
      };

      const mockMealsProposed = [
        { status: MealStatus.AVAILABLE },
        { status: MealStatus.RESERVED },
        { status: MealStatus.RESERVED },
      ];

      const mockReservations = [
        {
          meal: {
            serviceDate: new Date('2024-12-25'),
            status: MealStatus.RESERVED,
          },
        },
        {
          meal: {
            serviceDate: new Date('2024-12-20'),
            status: MealStatus.RESERVED,
          },
        },
      ];

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.meal.findMany as jest.Mock).mockResolvedValue(mockMealsProposed);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue(mockReservations);
      (prisma.reservation.count as jest.Mock).mockResolvedValueOnce(1).mockResolvedValueOnce(0);
      (quotaService.getQuotaStatus as jest.Mock).mockResolvedValue({
        weekly: {
          reservations: { current: 1, limit: 1 },
          proposals: { current: 2, limit: 1 },
        },
        monthly: {
          cancellations: { current: 0, limit: 4 },
          notPickedUp: { current: 0, limit: 2 },
        },
        sanctions: {
          reservationBlocked: false,
          cancellationBlocked: false,
          activeSanctions: [],
        },
      });

      const stats = await dashboardService.getDashboardStats(mockUserId);

      expect(stats).toHaveProperty('activity');
      expect(stats).toHaveProperty('history');
      expect(stats).toHaveProperty('personal');
      expect(stats).toHaveProperty('quotas');
      expect(stats.premium).toBeUndefined(); // Pas premium
      expect(stats.activity.mealsProposed.available).toBe(1);
      expect(stats.activity.mealsProposed.reserved).toBe(2);
      expect(stats.personal.globalRating).toBe(4.5);
    });

    it('devrait retourner les statistiques premium si l\'utilisateur est premium', async () => {
      const mockUser = {
        subscriptionType: SubscriptionType.PREMIUM_MONTHLY,
        globalRating: 4.8,
        mealsServed: 20,
        mealsReceived: 15,
        mealsExpired: 3,
        mealsSaved: 5,
        createdAt: new Date('2024-01-01'),
        badges: [],
        bonusDonors: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.reservation.count as jest.Mock).mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      (quotaService.getQuotaStatus as jest.Mock).mockResolvedValue({
        weekly: {
          reservations: { current: 0, limit: 3 },
          proposals: { current: 0, limit: 3 },
        },
        monthly: {
          cancellations: { current: 0, limit: 4 },
          notPickedUp: { current: 0, limit: 2 },
        },
        sanctions: {
          reservationBlocked: false,
          cancellationBlocked: false,
          activeSanctions: [],
        },
      });

      const stats = await dashboardService.getDashboardStats(mockUserId);

      expect(stats.premium).toBeDefined();
      expect(stats.premium?.mealsSaved).toBe(5);
      expect(stats.premium?.co2Avoided).toBe(12.5); // 5 * 2.5
    });

    it('devrait gérer les quotas avec sanctions', async () => {
      const mockUser = {
        subscriptionType: SubscriptionType.FREE,
        globalRating: 4.0,
        mealsServed: 5,
        mealsReceived: 3,
        mealsExpired: 1,
        mealsSaved: 0,
        createdAt: new Date('2024-01-01'),
        badges: [],
        bonusDonors: [],
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.reservation.count as jest.Mock).mockResolvedValueOnce(0).mockResolvedValueOnce(0);
      (quotaService.getQuotaStatus as jest.Mock).mockResolvedValue({
        weekly: {
          reservations: { current: 1, limit: 1 },
          proposals: { current: 1, limit: 1 },
        },
        monthly: {
          cancellations: { current: 2, limit: 2, isReduced: true, explanation: 'Quota réduit suite à une sanction' },
          notPickedUp: { current: 0, limit: 2 },
        },
        sanctions: {
          reservationBlocked: false,
          cancellationBlocked: true,
          activeSanctions: [
            {
              id: 'sanction-1',
              type: 'CANCELLATION_BLOCK',
              reason: 'Plafond atteint',
              startDate: new Date(),
              endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
            },
          ],
        },
      });

      const stats = await dashboardService.getDashboardStats(mockUserId);

      expect(stats.quotas.monthly.cancellations.isReduced).toBe(true);
      expect(stats.quotas.sanctions?.cancellationBlocked).toBe(true);
    });

    it('devrait lancer une erreur si l\'utilisateur n\'existe pas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(dashboardService.getDashboardStats(mockUserId)).rejects.toThrow(
        'Utilisateur non trouvé'
      );
    });
  });
});
