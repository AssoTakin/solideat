import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('../../src/config/database', () => {
  const mockPrisma = {
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
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $disconnect: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

// Mock quotaService
jest.mock('../../src/services/quota.service', () => ({
  quotaService: {
    getQuotaStatus: jest.fn(),
  },
}));

describe('Dashboard API Integration Tests (US-043)', () => {
  let authToken: string;
  let mockUser: any;
  let premiumUser: any;

  beforeAll(async () => {
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      subscriptionType: 'FREE',
      emailVerified: true,
      phoneVerified: true,
      globalRating: 4.5,
      mealsServed: 10,
      mealsReceived: 5,
      mealsExpired: 2,
      mealsSaved: 0,
      createdAt: new Date('2024-01-01'),
    };

    premiumUser = {
      ...mockUser,
      id: 'user-premium',
      subscriptionType: 'PREMIUM_MONTHLY',
      mealsSaved: 5,
    };

    authToken = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/users/me/dashboard', () => {
    it('devrait retourner les statistiques du dashboard pour un utilisateur gratuit', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        badges: [],
        bonusDonors: [],
      });

      (prisma.meal.findMany as jest.Mock).mockResolvedValue([
        { status: 'AVAILABLE' },
        { status: 'RESERVED' },
      ]);

      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([
        {
          meal: {
            serviceDate: new Date(),
            status: 'RESERVED',
          },
        },
      ]);

      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(1) // Repas en attente de commentaire
        .mockResolvedValueOnce(2); // Repas annulés

      const { quotaService } = require('../../src/services/quota.service');
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

      const response = await request(app)
        .get('/api/users/me/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.activity).toBeDefined();
      expect(response.body.data.history).toBeDefined();
      expect(response.body.data.personal).toBeDefined();
      expect(response.body.data.quotas).toBeDefined();
      expect(response.body.data.premium).toBeUndefined(); // Pas premium
    });

    it('devrait retourner les statistiques premium si l\'utilisateur est premium', async () => {
      const premiumToken = jwt.sign(
        { userId: premiumUser.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...premiumUser,
        badges: [],
        bonusDonors: [],
      });

      (prisma.meal.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.reservation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const { quotaService } = require('../../src/services/quota.service');
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

      const response = await request(app)
        .get('/api/users/me/dashboard')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.premium).toBeDefined();
      expect(response.body.data.premium.mealsSaved).toBe(5);
      expect(response.body.data.premium.co2Avoided).toBe(12.5); // 5 * 2.5
    });

    it('devrait échouer sans authentification', async () => {
      const response = await request(app).get('/api/users/me/dashboard').expect(401);

      // Le middleware d'authentification peut retourner une erreur différente
      expect(response.status).toBe(401);
    });
  });
});
