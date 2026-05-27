import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../src/services/stripe.service', () => {
  const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  return {
    stripeService: {
      getOrCreateCustomer: jest.fn().mockResolvedValue('cus_test_123'),
      getPriceId: jest.fn().mockReturnValue('price_test_123'),
      createSubscription: jest.fn().mockResolvedValue({
        id: 'sub_test_123',
        current_period_end: Math.floor(endDate.getTime() / 1000),
      }),
      getSubscriptionEndDate: jest.fn().mockReturnValue(endDate),
      cancelSubscription: jest.fn().mockResolvedValue({}),
    },
  };
});

jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    createNotification: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../../src/services/email.service', () => ({
  emailService: {
    sendSubscriptionCreatedEmail: jest.fn().mockResolvedValue(undefined),
    sendSubscriptionCancelledEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock Prisma
jest.mock('../../src/config/database', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $disconnect: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

describe('Subscriptions API Integration Tests (US-033, US-034, US-035)', () => {
  let authToken: string;
  let mockUser: any;

  beforeAll(async () => {
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      passwordHash: await bcrypt.hash('password123', 12),
      subscriptionType: 'FREE',
      emailVerified: true,
      phoneVerified: true,
    };

    authToken = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/subscriptions/plans', () => {
    it('devrait retourner les 3 plans d\'abonnement', async () => {
      const response = await request(app)
        .get('/api/subscriptions/plans')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(3);

      const plans = response.body.data;
      expect(plans[0].id).toBe('weekly');
      expect(plans[1].id).toBe('monthly');
      expect(plans[2].id).toBe('yearly');

      // Vérifier les prix
      expect(plans[0].price).toBe(2.5);
      expect(plans[1].price).toBe(9);
      expect(plans[2].price).toBe(90);

      // Vérifier les fonctionnalités
      plans.forEach((plan: any) => {
        expect(plan.features).toBeDefined();
        expect(Array.isArray(plan.features)).toBe(true);
      });
    });
  });

  describe('GET /api/subscriptions/current', () => {
    it('devrait retourner l\'abonnement actuel pour un utilisateur gratuit', async () => {
      const response = await request(app)
        .get('/api/subscriptions/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.type).toBe('FREE');
      expect(response.body.data.active).toBe(false);
    });

    it('devrait retourner l\'abonnement actif pour un utilisateur premium', async () => {
      const premiumUser = {
        ...mockUser,
        subscriptionType: 'PREMIUM_MONTHLY',
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(premiumUser);

      const response = await request(app)
        .get('/api/subscriptions/current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('PREMIUM_MONTHLY');
      expect(response.body.data.active).toBe(true);
    });

    it('devrait échouer sans authentification', async () => {
      const response = await request(app).get('/api/subscriptions/current').expect(401);

      // Le middleware d'authentification peut retourner une erreur différente
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/subscriptions', () => {
    it('devrait créer un nouvel abonnement', async () => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7); // Hebdomadaire

      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        subscriptionType: 'PREMIUM_WEEKLY',
        subscriptionStart: now,
        subscriptionEnd: endDate,
      });

      const response = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planType: 'PREMIUM_WEEKLY', paymentMethodId: 'pm_test_123' })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('devrait échouer sans paymentMethodId', async () => {
      const response = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planType: 'PREMIUM_WEEKLY' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toMatch(/payment method/i);
    });

    it('devrait échouer avec un plan invalide', async () => {
      const response = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ planType: 'INVALID_PLAN' })
        .expect(400);

      // Le validator retourne une erreur
      expect(response.status).toBe(400);
    });

    it('devrait échouer sans authentification', async () => {
      const response = await request(app)
        .post('/api/subscriptions')
        .send({ planType: 'PREMIUM_WEEKLY' })
        .expect(401);

      // Le middleware d'authentification retourne { error: ... } sans success
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});
