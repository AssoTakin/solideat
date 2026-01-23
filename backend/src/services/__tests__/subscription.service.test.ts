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
    sendSubscriptionCreatedEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../stripe.service', () => ({
  stripeService: {
    getOrCreateCustomer: jest.fn().mockResolvedValue('cus_123'),
    getPriceId: jest.fn().mockReturnValue('price_123'),
    createSubscription: jest.fn().mockResolvedValue({
      id: 'sub_123',
      current_period_end: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 jours
    }),
    getSubscriptionEndDate: jest.fn().mockReturnValue(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
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
        stripeSubscriptionId: 'sub_123',
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
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-id',
        subscriptionType: 'PREMIUM_WEEKLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(),
      });

      const result = await subscriptionService.createSubscription(
        'user-id',
        SubscriptionType.PREMIUM_WEEKLY,
        'pm_test_123'
      );

      expect(result.subscriptionType).toBe('PREMIUM_WEEKLY');
    });

    it('should create monthly subscription', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });

      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-id',
        subscriptionType: 'PREMIUM_MONTHLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(),
      });

      const result = await subscriptionService.createSubscription(
        'user-id',
        SubscriptionType.PREMIUM_MONTHLY,
        'pm_test_123'
      );

      expect(result.subscriptionType).toBe('PREMIUM_MONTHLY');
    });

    it('should throw error if payment method ID is missing', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
      });

      await expect(
        subscriptionService.createSubscription(
          'user-id',
          SubscriptionType.PREMIUM_WEEKLY,
          '' // Payment method ID manquant
        )
      ).rejects.toThrow('Payment method ID requis');
    });
  });
});
