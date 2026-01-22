import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { reviewService } from '../services/review.service';

export class ReviewController {
  /**
   * POST /reviews
   * Création d'un avis
   */
  async createReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const review = await reviewService.createReview(req.user!.id, req.body);

      res.status(201).json({
        success: true,
        message: 'Avis créé avec succès',
        data: review,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la création de l\'avis',
      });
    }
  }

  /**
   * GET /reviews/cook/:cookId
   * Liste des avis d'un cuisinier
   */
  async getCookReviews(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cookId } = req.params;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;

      const result = await reviewService.getCookReviews(cookId, page, limit);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des avis',
      });
    }
  }
}

export const reviewController = new ReviewController();
