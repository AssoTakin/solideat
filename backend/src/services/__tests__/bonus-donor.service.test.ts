import { bonusDonorService } from '../bonus-donor.service';
import prisma from '../../config/database';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    bonusDonor: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      deleteMany: jest.fn(),
    },
    reservation: {
      count: jest.fn(),
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
    sendBonusDonorEmail: jest.fn().mockResolvedValue(undefined),
    sendBonusDonorReceivedEmail: jest.fn().mockResolvedValue(undefined),
    sendBonusDonorExpiringEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('BonusDonorService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateBonusCount', () => {
    it('should return 0 if gap is less than 5', () => {
      expect(bonusDonorService.calculateBonusCount(3, 0)).toBe(0);
      expect(bonusDonorService.calculateBonusCount(4, 0)).toBe(0);
    });

    it('should return 1 if gap is 5', () => {
      expect(bonusDonorService.calculateBonusCount(5, 0)).toBe(1);
    });

    it('should return correct count for larger gaps', () => {
      expect(bonusDonorService.calculateBonusCount(10, 0)).toBe(2); // (10-5)/5 + 1 = 2
      expect(bonusDonorService.calculateBonusCount(15, 0)).toBe(3); // (15-5)/5 + 1 = 3
      expect(bonusDonorService.calculateBonusCount(20, 0)).toBe(4); // (20-5)/5 + 1 = 4
    });
  });

  describe('checkAndAcquireBonus', () => {
    it('should not create bonus if gap is less than 5', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        mealsServed: 3,
        mealsReceived: 0,
      });

      (prisma.bonusDonor.count as jest.Mock).mockResolvedValue(0);

      await bonusDonorService.checkAndAcquireBonus('user-id');

      expect(prisma.bonusDonor.create).not.toHaveBeenCalled();
    });

    it('should create bonus if gap is 5 or more', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          mealsServed: 10,
          mealsReceived: 0,
        })
        .mockResolvedValueOnce({
          email: 'test@example.com',
        });

      (prisma.bonusDonor.count as jest.Mock).mockResolvedValue(0);
      (prisma.bonusDonor.create as jest.Mock).mockResolvedValue({});

      await bonusDonorService.checkAndAcquireBonus('user-id');

      expect(prisma.bonusDonor.create).toHaveBeenCalled();
    });
  });

  describe('useBonusDonor', () => {
    it('should throw error if bonus not found', async () => {
      (prisma.bonusDonor.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(bonusDonorService.useBonusDonor('user-id', 'bonus-id')).rejects.toThrow(
        'Bonus donateur non disponible ou expiré'
      );
    });

    it('should throw error if weekly quota exceeded', async () => {
      (prisma.bonusDonor.findFirst as jest.Mock).mockResolvedValue({
        id: 'bonus-id',
        userId: 'user-id',
      });

      (prisma.reservation.count as jest.Mock).mockResolvedValue(2);

      await expect(bonusDonorService.useBonusDonor('user-id', 'bonus-id')).rejects.toThrow(
        'Quota hebdomadaire de bonus donateurs atteint'
      );
    });

    it('should mark bonus as used if valid', async () => {
      (prisma.bonusDonor.findFirst as jest.Mock).mockResolvedValue({
        id: 'bonus-id',
        userId: 'user-id',
      });

      (prisma.reservation.count as jest.Mock).mockResolvedValue(0);
      (prisma.bonusDonor.update as jest.Mock).mockResolvedValue({});

      await bonusDonorService.useBonusDonor('user-id', 'bonus-id');

      expect(prisma.bonusDonor.update).toHaveBeenCalledWith({
        where: { id: 'bonus-id' },
        data: { usedAt: expect.any(Date) },
      });
    });
  });

  describe('transferBonus', () => {
    it('should throw error if user is not premium', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        subscriptionType: 'FREE',
      });

      await expect(
        bonusDonorService.transferBonus('user-id', 'bonus-id', 'recipient')
      ).rejects.toThrow('Cette fonctionnalité est réservée aux membres premium');
    });

    it('should throw error if recipient not found', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce({
          subscriptionType: 'PREMIUM_MONTHLY',
          username: 'sender',
        })
        .mockResolvedValueOnce(null);

      (prisma.bonusDonor.findFirst as jest.Mock).mockResolvedValue({
        id: 'bonus-id',
        userId: 'user-id',
      });

      await expect(
        bonusDonorService.transferBonus('user-id', 'bonus-id', 'recipient')
      ).rejects.toThrow('Utilisateur bénéficiaire non trouvé');
    });
  });
});
