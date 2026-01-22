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
    reservation: {
      count: jest.fn(),
    },
    meal: {
      count: jest.fn(),
    },
    sanction: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $disconnect: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

// Mock sanctionService
jest.mock('../../src/services/sanction.service', () => ({
  sanctionService: {
    getReducedQuota: jest.fn(),
    isReservationBlocked: jest.fn(),
    isCancellationBlocked: jest.fn(),
  },
}));

describe('Quotas API Integration Tests (US-047)', () => {
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
    };

    premiumUser = {
      id: 'user-premium',
      email: 'premium@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      subscriptionType: 'PREMIUM_MONTHLY',
      emailVerified: true,
      phoneVerified: true,
    };

    authToken = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    const { sanctionService } = require('../../src/services/sanction.service');
    (sanctionService.getReducedQuota as jest.Mock).mockResolvedValue(null);
    (sanctionService.isReservationBlocked as jest.Mock).mockResolvedValue(false);
    (sanctionService.isCancellationBlocked as jest.Mock).mockResolvedValue(false);
  });

  describe('GET /api/users/me/quotas', () => {
    it('devrait récupérer les quotas pour un utilisateur gratuit', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const startOfWeek = new Date(now);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0, 0, 0, 0);
      // Utiliser now pour éviter l'erreur
      void now;

      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(0) // Réservations cette semaine
        .mockResolvedValueOnce(0); // Annulations ce mois
      (prisma.meal.count as jest.Mock)
        .mockResolvedValueOnce(0) // Propositions cette semaine
        .mockResolvedValueOnce(0); // Repas non récupérés ce mois
      (prisma.sanction.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users/me/quotas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.weekly.reservations.limit).toBe(1); // Gratuit
      expect(response.body.data.weekly.proposals.limit).toBe(1); // Gratuit
      expect(response.body.data.monthly.cancellations.limit).toBe(4);
      expect(response.body.data.monthly.notPickedUp.limit).toBe(2);
    });

    it('devrait récupérer les quotas pour un utilisateur premium', async () => {
      const premiumToken = jwt.sign(
        { userId: premiumUser.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(premiumUser);

      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (prisma.meal.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (prisma.sanction.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users/me/quotas')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.weekly.reservations.limit).toBe(3); // Premium
      expect(response.body.data.weekly.proposals.limit).toBe(3); // Premium
    });

    it('devrait afficher les quotas réduits si une sanction est active', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      (prisma.reservation.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (prisma.meal.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const { sanctionService } = require('../../src/services/sanction.service');
      (sanctionService.getReducedQuota as jest.Mock).mockResolvedValue({
        cancellations: 2,
      });
      (sanctionService.isReservationBlocked as jest.Mock).mockResolvedValue(false);
      (sanctionService.isCancellationBlocked as jest.Mock).mockResolvedValue(false);
      (prisma.sanction.findMany as jest.Mock).mockResolvedValue([]);

      const response = await request(app)
        .get('/api/users/me/quotas')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.monthly.cancellations.isReduced).toBe(true);
      expect(response.body.data.monthly.cancellations.limit).toBe(2);
      expect(response.body.data.monthly.cancellations.explanation).toBeDefined();
    });

    it('devrait échouer sans authentification', async () => {
      const response = await request(app).get('/api/users/me/quotas').expect(401);

      // Le middleware d'authentification retourne { error: ... } sans success
      expect(response.status).toBe(401);
      expect(response.body.error).toBeDefined();
    });
  });
});
