import { SanctionService } from '../sanction.service';
import prisma from '../../config/database';
import { SanctionType, NotificationType } from '@prisma/client';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
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
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock notificationService
jest.mock('../notification.service', () => ({
  notificationService: {
    createNotification: jest.fn(),
    sendNotification: jest.fn(),
  },
}));

// Mock emailService
jest.mock('../email.service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn(),
  },
}));

import { notificationService } from '../notification.service';

describe('SanctionService', () => {
  let sanctionService: SanctionService;

  beforeEach(() => {
    sanctionService = new SanctionService();
    jest.clearAllMocks();
  });

  describe('checkAndApplyCancellationSanctions', () => {
    const mockUserId = 'user-123';

    it('ne devrait pas appliquer de sanction si le plafond n\'est pas atteint', async () => {
      (prisma.reservation.count as jest.Mock).mockResolvedValue(2);
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);

      const result = await sanctionService.checkAndApplyCancellationSanctions(mockUserId);

      expect(result.applied).toBe(false);
      expect(result.message).toBe('Plafond non atteint');
    });

    it('devrait appliquer des sanctions si le plafond est atteint (4)', async () => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 14);

      (prisma.reservation.count as jest.Mock).mockResolvedValue(3);
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.sanction.create as jest.Mock)
        .mockResolvedValueOnce({ id: 'sanction-1', type: SanctionType.CANCELLATION_BLOCK })
        .mockResolvedValueOnce({ id: 'sanction-2', type: SanctionType.QUOTA_REDUCTION });
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        email: 'test@example.com',
        firstName: 'Test',
      });

      const result = await sanctionService.checkAndApplyCancellationSanctions(mockUserId);

      expect(result.applied).toBe(true);
      expect(prisma.sanction.create).toHaveBeenCalledTimes(2);
      expect(notificationService.createNotification).toHaveBeenCalledWith(
        mockUserId,
        NotificationType.SYSTEM_MESSAGE,
        expect.any(String),
        expect.any(String),
        '/dashboard'
      );
    });

    it('ne devrait pas appliquer de sanction si une sanction existe déjà pour ce mois', async () => {
      (prisma.reservation.count as jest.Mock).mockResolvedValue(3);
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-sanction',
        active: true,
      });

      const result = await sanctionService.checkAndApplyCancellationSanctions(mockUserId);

      expect(result.applied).toBe(false);
      expect(result.message).toBe('Sanction déjà appliquée pour ce mois');
    });
  });

  describe('checkAndApplyNotPickedUpSanctions', () => {
    const mockUserId = 'user-123';

    it('ne devrait pas appliquer de sanction si aucun repas non récupéré', async () => {
      (prisma.meal.count as jest.Mock).mockResolvedValue(0);

      const result = await sanctionService.checkAndApplyNotPickedUpSanctions(mockUserId);

      expect(result.applied).toBe(false);
      expect(result.message).toBe('Aucun repas non récupéré ce mois');
    });

    it('devrait appliquer un avertissement pour 1 repas non récupéré', async () => {
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        globalRating: 4.5,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ globalRating: 4.5 })
        .mockResolvedValueOnce({ email: 'test@example.com', firstName: 'Test' });

      const result = await sanctionService.checkAndApplyNotPickedUpSanctions(mockUserId);

      expect(result.applied).toBe(true);
      expect(result.message).toContain('Avertissement appliqué');
      expect(prisma.user.update).toHaveBeenCalled(); // Impact sur la note
      expect(notificationService.createNotification).toHaveBeenCalled();
    });

    it('devrait appliquer des sanctions sévères pour 2 repas non récupérés', async () => {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 14);

      (prisma.meal.count as jest.Mock).mockResolvedValue(2);
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.sanction.create as jest.Mock)
        .mockResolvedValueOnce({ id: 'sanction-1', type: SanctionType.RESERVATION_BLOCK })
        .mockResolvedValueOnce({ id: 'sanction-2', type: SanctionType.QUOTA_REDUCTION });
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({ globalRating: 4.5 })
        .mockResolvedValueOnce({ email: 'test@example.com', firstName: 'Test' });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await sanctionService.checkAndApplyNotPickedUpSanctions(mockUserId);

      expect(result.applied).toBe(true);
      expect(result.message).toContain('Sanctions sévères appliquées');
      expect(prisma.sanction.create).toHaveBeenCalledTimes(2);
      expect(prisma.user.update).toHaveBeenCalled(); // Impact sur la note
    });
  });

  describe('isReservationBlocked', () => {
    const mockUserId = 'user-123';

    it('devrait retourner true si une sanction de blocage de réservation est active', async () => {
      const now = new Date();
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue({
        id: 'sanction-1',
        type: SanctionType.RESERVATION_BLOCK,
        active: true,
        startDate: new Date(now.getTime() - 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      });

      const result = await sanctionService.isReservationBlocked(mockUserId);

      expect(result).toBe(true);
    });

    it('devrait retourner false si aucune sanction active', async () => {
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await sanctionService.isReservationBlocked(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('isCancellationBlocked', () => {
    const mockUserId = 'user-123';

    it('devrait retourner true si une sanction de blocage d\'annulation est active', async () => {
      const now = new Date();
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue({
        id: 'sanction-1',
        type: SanctionType.CANCELLATION_BLOCK,
        active: true,
        startDate: new Date(now.getTime() - 1000),
        endDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
      });

      const result = await sanctionService.isCancellationBlocked(mockUserId);

      expect(result).toBe(true);
    });

    it('devrait retourner false si aucune sanction active', async () => {
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await sanctionService.isCancellationBlocked(mockUserId);

      expect(result).toBe(false);
    });
  });

  describe('getReducedQuota', () => {
    const mockUserId = 'user-123';

    it('devrait retourner null si aucune réduction de quota active', async () => {
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await sanctionService.getReducedQuota(mockUserId);

      expect(result).toBeNull();
    });

    it('devrait retourner le quota réduit pour annulations', async () => {
      const now = new Date();
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue({
        id: 'sanction-1',
        type: SanctionType.QUOTA_REDUCTION,
        active: true,
        quotaReduction: 2,
        reason: 'Quota réduit suite au plafond atteint (annulations)',
        startDate: new Date(now.getTime() - 1000),
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await sanctionService.getReducedQuota(mockUserId);

      expect(result).toEqual({ cancellations: 2 });
    });

    it('devrait retourner le quota réduit pour repas non récupérés', async () => {
      const now = new Date();
      (prisma.sanction.findFirst as jest.Mock).mockResolvedValue({
        id: 'sanction-1',
        type: SanctionType.QUOTA_REDUCTION,
        active: true,
        quotaReduction: 1,
        reason: 'Quota mensuel réduit suite à 2 repas non récupérés',
        startDate: new Date(now.getTime() - 1000),
        endDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      });

      const result = await sanctionService.getReducedQuota(mockUserId);

      expect(result).toEqual({ notPickedUp: 1 });
    });
  });

  describe('deactivateExpiredSanctions', () => {
    it('devrait désactiver les sanctions expirées', async () => {
      (prisma.sanction.updateMany as jest.Mock).mockResolvedValue({ count: 3 });

      await sanctionService.deactivateExpiredSanctions();

      expect(prisma.sanction.updateMany).toHaveBeenCalledWith({
        where: {
          active: true,
          endDate: {
            lt: expect.any(Date),
          },
        },
        data: {
          active: false,
        },
      });
    });
  });
});
