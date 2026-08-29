import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/config/database';

// Mock Prisma
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

jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    createNotification: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../../src/services/stripe.service', () => {
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return {
    stripe: {
      webhooks: {
        constructEvent: jest.fn().mockImplementation((_body: any, _sig: any, _secret: any) => {
          // Récupérer l'événement envoyé dans le body de la requête
          return JSON.parse(_body);
        }),
      },
    },
    stripeService: {
      getSubscription: jest.fn().mockResolvedValue({
        id: 'sub_renew_123',
        current_period_end: Math.floor(endDate.getTime() / 1000),
      }),
      getSubscriptionEndDate: jest.fn().mockReturnValue(endDate),
    },
  };
});

describe('Stripe webhook renouvellement abonnement (US-035)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('prolonge subscriptionEnd quand invoice.payment_succeeded est reçu', async () => {
    const customerId = 'cus_renew_123';
    const userId = 'user-renew-123';
    const subscriptionId = 'sub_renew_123';

    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: userId,
      email: 'renew@example.com',
      stripeCustomerId: customerId,
    });

    const payload: any = {
      id: 'evt_invoice_succeeded',
      object: 'event',
      type: 'invoice.payment_succeeded',
      data: {
        object: {
          id: 'in_renew_123',
          object: 'invoice',
          customer: customerId,
          subscription: subscriptionId,
          status: 'paid',
        },
      },
    };

    const response = await request(app)
      .post('/webhooks/stripe')
      .set('stripe-signature', 'fake-signature-for-test')
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body.received).toBe(true);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: userId },
        data: expect.objectContaining({
          subscriptionEnd: expect.any(Date),
        }),
      })
    );
  });
});
