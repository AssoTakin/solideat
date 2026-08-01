import { ReviewService } from '../review.service';
import prisma from '../../config/database';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    reservation: {
      findFirst: jest.fn(),
      count: jest.fn(),
    },
    review: {
      findUnique: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
    },
    user: {
      update: jest.fn(),
    },
  },
}));

describe('ReviewService', () => {
  let reviewService: ReviewService;

  beforeEach(() => {
    reviewService = new ReviewService();
    jest.clearAllMocks();
  });

  describe('createReview', () => {
    const mockReservation = {
      id: 'res-123',
      mealId: 'meal-123',
      userId: 'user-123',
      pickedUpAt: new Date(),
      meal: {
        id: 'meal-123',
        cookId: 'cook-123',
        status: 'SERVED',
        cook: {
          id: 'cook-123',
        },
      },
    };

    const mockReviewData = {
      mealId: 'meal-123',
      rating: 5,
      comment: 'Excellent repas, très bon goût et bien présenté !',
    };

    it('devrait créer un avis avec succès', async () => {
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(mockReservation);
      (prisma.review.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.review.create as jest.Mock).mockResolvedValue({
        id: 'review-123',
        ...mockReviewData,
      });
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await reviewService.createReview('user-123', mockReviewData);

      expect(result).toBeDefined();
      expect(prisma.review.create).toHaveBeenCalled();
    });

    it('devrait échouer si l\'utilisateur n\'a pas réservé ou récupéré le repas', async () => {
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(reviewService.createReview('user-123', mockReviewData)).rejects.toThrow(
        'n\'avez pas réservé'
      );
    });

    it('devrait échouer si un avis existe déjà', async () => {
      (prisma.reservation.findFirst as jest.Mock).mockResolvedValue(mockReservation);
      (prisma.review.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-review',
      });

      await expect(reviewService.createReview('user-123', mockReviewData)).rejects.toThrow(
        'déjà noté'
      );
    });
  });

  describe('calculateGlobalRating', () => {
    it('devrait calculer la note globale correctement', async () => {
      (prisma.review.findMany as jest.Mock).mockResolvedValue([
        { rating: 5 },
        { rating: 4 },
        { rating: 5 },
      ]);
      (prisma.reservation.count as jest.Mock).mockResolvedValue(1); // 1 repas non récupéré
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const rating = await reviewService.calculateGlobalRating('cook-123');

      // Moyenne : (5+4+5)/3 = 4.67
      // Pénalité : 1 × 0.5 = 0.5
      // Résultat : 4.67 - 0.5 = 4.17 ≈ 4.2
      expect(rating).toBeCloseTo(4.2, 1);
      expect(prisma.user.update).toHaveBeenCalled();
    });

    it('devrait retourner 0 si aucun avis', async () => {
      (prisma.review.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const rating = await reviewService.calculateGlobalRating('cook-123');

      expect(rating).toBe(0);
    });
  });
});
