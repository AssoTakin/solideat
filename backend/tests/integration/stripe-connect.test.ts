import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/config/database';
import jwt from 'jsonwebtoken';

// Mock Prisma pour les tests d'intégration Stripe Connect
jest.mock('../../src/config/database', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $disconnect: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

jest.mock('../../src/services/stripe.service', () => ({
  stripeService: {
    createConnectedAccount: jest.fn().mockResolvedValue({ id: 'acct_test_123' }),
    createAccountLink: jest.fn().mockResolvedValue({
      url: 'https://connect.stripe.com/setup/s/test-url',
    }),
    isConnectedAccountReady: jest.fn().mockResolvedValue(true),
  },
}));

describe('Stripe Connect API Integration Tests (US-060)', () => {
  let authToken: string;
  let mockUser: any;

  beforeAll(() => {
    mockUser = {
      id: 'user-connect-123',
      email: 'cook@example.com',
      firstName: 'Cook',
      lastName: 'Test',
      stripeConnectedAccountId: null,
      stripeConnectOnboardingComplete: false,
      emailVerified: true,
      phoneVerified: true,
    };

    authToken = jwt.sign(
      { userId: mockUser.id },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/users/me/connect-status', () => {
    it('devrait retourner le statut Connect initial (non configuré)', async () => {
      const response = await request(app)
        .get('/api/users/me/connect-status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accountId).toBeNull();
      expect(response.body.data.onboardingComplete).toBe(false);
    });

    it('devrait retourner le statut Connect completé', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        stripeConnectedAccountId: 'acct_test_123',
        stripeConnectOnboardingComplete: true,
      });

      const response = await request(app)
        .get('/api/users/me/connect-status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.accountId).toBe('acct_test_123');
      expect(response.body.data.onboardingComplete).toBe(true);
    });
  });

  describe('POST /api/users/me/connect-account', () => {
    it('devrait créer un compte Connect et renvoyer un lien d\'onboarding', async () => {
      const response = await request(app)
        .post('/api/users/me/connect-account')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.url).toContain('https://connect.stripe.com');
      expect(response.body.data.accountId).toBe('acct_test_123');
      expect(response.body.data.onboardingComplete).toBe(false);
      expect(prisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({
            stripeConnectedAccountId: 'acct_test_123',
            stripeConnectOnboardingComplete: false,
          }),
        })
      );
    });
  });
});
