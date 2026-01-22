import { SubscriptionService } from '../subscription.service';
import { SubscriptionType } from '@prisma/client';
import prisma from '../../config/database';

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

describe('SubscriptionService', () => {
  let subscriptionService: SubscriptionService;

  beforeEach(() => {
    subscriptionService = new SubscriptionService();
    jest.clearAllMocks();
  });

  describe('getPlans', () => {
    it('devrait retourner les 3 plans d\'abonnement', () => {
      const plans = subscriptionService.getPlans();

      expect(plans).toHaveLength(3);
      expect(plans[0].id).toBe('weekly');
      expect(plans[1].id).toBe('monthly');
      expect(plans[2].id).toBe('yearly');
    });

    it('devrait avoir les prix corrects', () => {
      const plans = subscriptionService.getPlans();

      expect(plans[0].price).toBe(2.5); // Hebdomadaire
      expect(plans[1].price).toBe(9); // Mensuel
      expect(plans[2].price).toBe(90); // Annuel
    });

    it('devrait calculer le prix par mois correctement', () => {
      const plans = subscriptionService.getPlans();

      expect(plans[0].pricePerMonth).toBeCloseTo(10.83, 1); // 2.5 * 52 / 12
      expect(plans[1].pricePerMonth).toBe(9);
      expect(plans[2].pricePerMonth).toBe(7.5); // 90 / 12
    });

    it('devrait avoir des économies pour l\'abonnement annuel', () => {
      const plans = subscriptionService.getPlans();
      const yearlyPlan = plans.find((p) => p.id === 'yearly');

      expect(yearlyPlan?.savings).toBe(18); // (9 * 12) - 90
    });
  });

  describe('getCurrentSubscription', () => {
    it('devrait retourner FREE si utilisateur gratuit', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        subscriptionType: 'FREE',
        subscriptionStart: null,
        subscriptionEnd: null,
        stripeCustomerId: null,
      });

      const subscription = await subscriptionService.getCurrentSubscription('user-123');

      expect(subscription.type).toBe('FREE');
      expect(subscription.active).toBe(false);
    });

    it('devrait retourner l\'abonnement actif si premium', async () => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() + 1);

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        subscriptionType: SubscriptionType.PREMIUM_MONTHLY,
        subscriptionStart: now,
        subscriptionEnd: endDate,
        stripeCustomerId: 'cus_123',
      });

      const subscription = await subscriptionService.getCurrentSubscription('user-123');

      expect(subscription.type).toBe(SubscriptionType.PREMIUM_MONTHLY);
      expect(subscription.active).toBe(true);
      expect(subscription.endDate).toEqual(endDate);
    });

    it('devrait retourner actif=false si abonnement expiré', async () => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(endDate.getMonth() - 1); // Expiré il y a 1 mois

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        subscriptionType: SubscriptionType.PREMIUM_MONTHLY,
        subscriptionStart: now,
        subscriptionEnd: endDate,
        stripeCustomerId: 'cus_123',
      });

      const subscription = await subscriptionService.getCurrentSubscription('user-123');

      expect(subscription.active).toBe(false);
    });
  });

  describe('createSubscription', () => {
    it('devrait créer un abonnement hebdomadaire', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        subscriptionType: 'FREE',
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({
        id: 'user-123',
        subscriptionType: SubscriptionType.PREMIUM_WEEKLY,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(),
      });

      const subscription = await subscriptionService.createSubscription(
        'user-123',
        SubscriptionType.PREMIUM_WEEKLY
      );

      expect(subscription.subscriptionType).toBe(SubscriptionType.PREMIUM_WEEKLY);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('devrait calculer la date de fin correctement pour hebdomadaire', async () => {
      const now = new Date();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        subscriptionType: 'FREE',
      });
      (prisma.user.update as jest.Mock).mockImplementation((args: any) => {
        const endDate = args.data.subscriptionEnd;
        const expectedEnd = new Date(now);
        expectedEnd.setDate(expectedEnd.getDate() + 7);

        // Vérifier que la date de fin est environ 7 jours plus tard
        const diff = Math.abs(endDate.getTime() - expectedEnd.getTime());
        expect(diff).toBeLessThan(1000); // Moins de 1 seconde de différence

        return Promise.resolve({
          id: 'user-123',
          subscriptionType: SubscriptionType.PREMIUM_WEEKLY,
          subscriptionStart: now,
          subscriptionEnd: endDate,
        });
      });

      await subscriptionService.createSubscription('user-123', SubscriptionType.PREMIUM_WEEKLY);
    });

    it('devrait calculer la date de fin correctement pour mensuel', async () => {
      const now = new Date();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        subscriptionType: 'FREE',
      });
      (prisma.user.update as jest.Mock).mockImplementation((args: any) => {
        const endDate = args.data.subscriptionEnd;
        const expectedEnd = new Date(now);
        expectedEnd.setMonth(expectedEnd.getMonth() + 1);

        const diff = Math.abs(endDate.getTime() - expectedEnd.getTime());
        expect(diff).toBeLessThan(1000);

        return Promise.resolve({
          id: 'user-123',
          subscriptionType: SubscriptionType.PREMIUM_MONTHLY,
          subscriptionStart: now,
          subscriptionEnd: endDate,
        });
      });

      await subscriptionService.createSubscription('user-123', SubscriptionType.PREMIUM_MONTHLY);
    });

    it('devrait calculer la date de fin correctement pour annuel', async () => {
      const now = new Date();
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        subscriptionType: 'FREE',
      });
      (prisma.user.update as jest.Mock).mockImplementation((args: any) => {
        const endDate = args.data.subscriptionEnd;
        const expectedEnd = new Date(now);
        expectedEnd.setFullYear(expectedEnd.getFullYear() + 1);

        const diff = Math.abs(endDate.getTime() - expectedEnd.getTime());
        expect(diff).toBeLessThan(1000);

        return Promise.resolve({
          id: 'user-123',
          subscriptionType: SubscriptionType.PREMIUM_YEARLY,
          subscriptionStart: now,
          subscriptionEnd: endDate,
        });
      });

      await subscriptionService.createSubscription('user-123', SubscriptionType.PREMIUM_YEARLY);
    });

    it('devrait échouer si type d\'abonnement invalide', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        subscriptionType: 'FREE',
      });

      await expect(
        subscriptionService.createSubscription('user-123', 'INVALID' as SubscriptionType)
      ).rejects.toThrow('Type d\'abonnement invalide');
    });
  });
});
