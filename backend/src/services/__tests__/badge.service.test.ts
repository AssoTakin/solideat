import { badgeService } from '../badge.service';
import prisma from '../../config/database';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    badge: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    userBadge: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
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
    sendBadgeEarnedEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('BadgeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAndAwardBadges', () => {
    it('should not award badge if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await badgeService.checkAndAwardBadges('user-id');

      expect(prisma.badge.findUnique).not.toHaveBeenCalled();
    });

    it('should award Badge X if conditions met', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        mealsServed: 10,
        globalRating: 4.0,
        subscriptionType: 'FREE',
        mealsSaved: 0,
        meals: [
          {
            reviews: [{ rating: 4 }, { rating: 4 }],
          },
        ],
      });

      (prisma.badge.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.badge.create as jest.Mock).mockResolvedValue({
        id: 'badge-id',
        name: 'badge-x',
      });
      (prisma.userBadge.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.userBadge.create as jest.Mock).mockResolvedValue({});

      await badgeService.checkAndAwardBadges('user-id');

      expect(prisma.badge.create).toHaveBeenCalled();
      expect(prisma.userBadge.create).toHaveBeenCalled();
    });

    it('should award Badge Y if conditions met', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        mealsServed: 25,
        globalRating: 4.2,
        subscriptionType: 'FREE',
        mealsSaved: 0,
        meals: [
          {
            reviews: [{ rating: 4 }, { rating: 5 }],
          },
        ],
      });

      (prisma.badge.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.badge.create as jest.Mock).mockResolvedValue({
        id: 'badge-id',
        name: 'badge-y',
      });
      (prisma.userBadge.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.userBadge.create as jest.Mock).mockResolvedValue({});

      await badgeService.checkAndAwardBadges('user-id');

      expect(prisma.badge.create).toHaveBeenCalled();
    });

    it('should award Hero badge for premium users with 10 saved meals', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        mealsServed: 5,
        globalRating: 3.5,
        subscriptionType: 'PREMIUM_MONTHLY',
        mealsSaved: 10,
        meals: [],
      });

      (prisma.badge.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.badge.create as jest.Mock).mockResolvedValue({
        id: 'badge-id',
        name: 'badge-hero-anti-gaspillage',
      });
      (prisma.userBadge.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.userBadge.create as jest.Mock).mockResolvedValue({});

      await badgeService.checkAndAwardBadges('user-id');

      expect(prisma.badge.create).toHaveBeenCalled();
    });
  });

  describe('getUserBadges', () => {
    it('should return user badges', async () => {
      const mockBadges = [
        {
          id: 'badge-1',
          badge: { name: 'badge-x', description: 'Badge X' },
          earnedAt: new Date(),
        },
      ];

      (prisma.userBadge.findMany as jest.Mock).mockResolvedValue(mockBadges);

      const result = await badgeService.getUserBadges('user-id');

      expect(result).toEqual(mockBadges);
      expect(prisma.userBadge.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-id' },
        include: { badge: true },
        orderBy: { earnedAt: 'desc' },
      });
    });
  });
});
