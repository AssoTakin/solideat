import api from './api';
import { reviewServiceMock } from './review.service.mock';
import { USE_MOCK_DATA } from '../data/mockData';

export interface Review {
  id: string;
  mealId: string;
  reviewerId: string;
  cookId: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: string;
  reviewer: {
    id: string;
    username: string;
    profilePhoto?: string;
  };
  meal: {
    id: string;
    name: string;
    photo: string;
  };
}

export interface CreateReviewDto {
  mealId: string;
  rating: number;
  comment: string;
  photos?: string[];
}

export const reviewService = {
  /**
   * Créer un avis
   */
  async createReview(data: CreateReviewDto): Promise<{ success: boolean; data?: Review; error?: string }> {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  /**
   * Récupérer les avis d'un cuisinier
   */
  async getCookReviews(cookId: string, page: number = 1, limit: number = 20): Promise<{ success: boolean; data?: { reviews: Review[]; total: number }; error?: string }> {
    if (USE_MOCK_DATA) {
      return reviewServiceMock.getCookReviews(cookId, page, limit);
    }
    const response = await api.get(`/reviews/cook/${cookId}?page=${page}&limit=${limit}`);
    return response.data;
  },
};
