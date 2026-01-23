import { subscriptionService } from '../subscription.service';
import prisma from '../../config/database';
import { SubscriptionType } from '@prisma/client';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock services
jest.mock('../notification.service', () => ({
  notificationService: {
    createNotification: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../email.service', () => ({
  emailService: {
    sendSubscriptionCancelledEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('SubscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('cancelSubscription', () => {
    it('should throw error if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(subscriptionService.cancelSubscription('user-id')).rejects.toThrow(
        'Utilisateur non trouvé'
      );
    });

    it('should throw error if user has no active subscription', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });

      await expect(subscriptionService.cancelSubscription('user-id')).rejects.toThrow(
        'Aucun abonnement actif'
      );
    });

    it('should cancel subscription for premium user', async () => {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        subscriptionType: 'PREMIUM_MONTHLY',
        subscriptionEnd: endDate,
        email: 'test@example.com',
        stripeCustomerId: 'cus_123',
      });

      await subscriptionService.cancelSubscription('user-id');

      // Vérifier que la notification a été créée
      const { notificationService } = await import('../notification.service');
      expect(notificationService.createNotification).toHaveBeenCalled();
    });
  });

  describe('getCurrentSubscription', () => {
    it('should return FREE subscription for free user', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });

      const result = await subscriptionService.getCurrentSubscription('user-id');

      expect(result.type).toBe('FREE');
      expect(result.active).toBe(false);
    });

    it('should return active subscription for premium user', async () => {
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'PREMIUM_MONTHLY',
        subscriptionStart: new Date(),
        subscriptionEnd: endDate,
        stripeCustomerId: 'cus_123',
      });

      const result = await subscriptionService.getCurrentSubscription('user-id');

      expect(result.type).toBe('PREMIUM_MONTHLY');
      expect(result.active).toBe(true);
    });
  });

  describe('createSubscription', () => {
    it('should create weekly subscription', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-id',
        subscriptionType: 'PREMIUM_WEEKLY',
      });

      const result = await subscriptionService.createSubscription(
        'user-id',
        SubscriptionType.PREMIUM_WEEKLY
      );

      expect(result.subscriptionType).toBe('PREMIUM_WEEKLY');
    });

    it('should create monthly subscription', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-id',
        subscriptionType: 'PREMIUM_MONTHLY',
      });

      const result = await subscriptionService.createSubscription(
        'user-id',
        SubscriptionType.PREMIUM_MONTHLY
      );

      expect(result.subscriptionType).toBe('PREMIUM_MONTHLY');
    });
  });
});
