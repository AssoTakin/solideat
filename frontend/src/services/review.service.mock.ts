// Service mock pour les avis
import { mockReviews, USE_MOCK_DATA } from '../data/mockData';
import { Review } from './review.service';

export const reviewServiceMock = {
  async getCookReviews(cookId: string, page: number = 1, limit: number = 20): Promise<{ success: boolean; data?: { reviews: Review[]; total: number }; error?: string }> {
    if (!USE_MOCK_DATA) {
      throw new Error('Mock service should only be used in development');
    }

    const reviews = mockReviews.filter((r) => r.cookId === cookId);
    const skip = (page - 1) * limit;

    return {
      success: true,
      data: {
        reviews: reviews.slice(skip, skip + limit) as any[],
        total: reviews.length,
      },
    };
  },
};
