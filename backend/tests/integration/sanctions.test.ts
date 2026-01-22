import prisma from '../../src/config/database';
import bcrypt from 'bcrypt';

// Mock Prisma
jest.mock('../../src/config/database', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    reservation: {
      count: jest.fn(),
    },
    meal: {
      count: jest.fn(),
    },
    sanction: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      updateMany: jest.fn(),
    },
    notification: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $disconnect: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

// Mock services
jest.mock('../../src/services/email.service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    createNotification: jest.fn().mockResolvedValue({}),
    sendNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Sanctions API Integration Tests (US-045, US-046)', () => {
  let mockUser: any;

  beforeAll(async () => {
    mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      passwordHash: await bcrypt.hash('password123', 12),
      subscriptionType: 'FREE',
      emailVerified: true,
      phoneVerified: true,
      globalRating: 4.5,
    };
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('Sanctions pour annulations (US-045)', () => {
    it('devrait détecter le plafond mensuel atteint', async () => {
      // 3 annulations + 1 repas non récupéré = 4 (plafond atteint)
      (prisma.reservation.count as jest.Mock).mockResolvedValue(3);
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.sanction.create as jest.Mock)
        .mockResolvedValueOnce({ id: 'sanction-1', type: 'CANCELLATION_BLOCK' })
        .mockResolvedValueOnce({ id: 'sanction-2', type: 'QUOTA_REDUCTION' });
      (prisma.notification.create as jest.Mock).mockResolvedValue({});

      // Simuler l'appel du service de sanctions
      const { sanctionService } = require('../../src/services/sanction.service');
      const result = await sanctionService.checkAndApplyCancellationSanctions(mockUser.id);

      expect(result.applied).toBe(true);
      expect(prisma.sanction.create).toHaveBeenCalledTimes(2);
      // notificationService.createNotification est mocké et appelé via sanctionService
      // On vérifie juste que le résultat indique qu'une sanction a été appliquée
      expect(result.message).toBeDefined();
    });

    it('ne devrait pas appliquer de sanction si le plafond n\'est pas atteint', async () => {
      (prisma.reservation.count as jest.Mock).mockResolvedValue(2);
      (prisma.meal.count as jest.Mock).mockResolvedValue(1); // Total = 3 < 4

      const { sanctionService } = require('../../src/services/sanction.service');
      const result = await sanctionService.checkAndApplyCancellationSanctions(mockUser.id);

      expect(result.applied).toBe(false);
      expect(prisma.sanction.create).not.toHaveBeenCalled();
    });
  });

  describe('Sanctions pour repas non récupérés (US-046)', () => {
    it('devrait appliquer un avertissement pour 1 repas non récupéré', async () => {
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.notification.create as jest.Mock).mockResolvedValue({});

      const { sanctionService } = require('../../src/services/sanction.service');
      const result = await sanctionService.checkAndApplyNotPickedUpSanctions(mockUser.id);

      expect(result.applied).toBe(true);
      expect(result.message).toContain('Avertissement');
      expect(prisma.user.update).toHaveBeenCalled(); // Impact sur la note
      // notificationService.createNotification est mocké
      const { notificationService } = require('../../src/services/notification.service');
      expect(notificationService.createNotification).toHaveBeenCalled();
    });

    it('devrait appliquer des sanctions sévères pour 2 repas non récupérés', async () => {
      (prisma.meal.count as jest.Mock).mockResolvedValue(2);
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.sanction.create as jest.Mock)
        .mockResolvedValueOnce({ id: 'sanction-1', type: 'RESERVATION_BLOCK' })
        .mockResolvedValueOnce({ id: 'sanction-2', type: 'QUOTA_REDUCTION' });
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.notification.create as jest.Mock).mockResolvedValue({});

      const { sanctionService } = require('../../src/services/sanction.service');
      const result = await sanctionService.checkAndApplyNotPickedUpSanctions(mockUser.id);

      expect(result.applied).toBe(true);
      expect(result.message).toContain('Sanctions sévères');
      expect(prisma.sanction.create).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalled(); // Impact sur la note
    });
  });

  describe('Vérification des blocages', () => {
    it('devrait détecter un blocage de réservation actif', async () => {
      const now = new Date();
      const mockSanction = {
        id: 'sanction-1',
        type: 'RESERVATION_BLOCK',
        active: true,
        startDate: new Date(now.getTime() - 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      };

      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue(mockSanction);

      const { sanctionService } = require('../../src/services/sanction.service');
      const isBlocked = await sanctionService.isReservationBlocked(mockUser.id);

      expect(isBlocked).toBe(true);
    });

    it('devrait détecter un blocage d\'annulation actif', async () => {
      const now = new Date();
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue({
        id: 'sanction-1',
        type: 'CANCELLATION_BLOCK',
        active: true,
        startDate: new Date(now.getTime() - 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      });

      const { sanctionService } = require('../../src/services/sanction.service');
      const isBlocked = await sanctionService.isCancellationBlocked(mockUser.id);

      expect(isBlocked).toBe(true);
    });
  });
});
