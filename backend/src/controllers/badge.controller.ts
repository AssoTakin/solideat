import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { badgeService } from '../services/badge.service';

export class BadgeController {
  /**
   * GET /badges
   * Liste des badges de l'utilisateur connecté
   */
  async getMyBadges(req: AuthRequest, res: Response): Promise<void> {
    try {
      const badges = await badgeService.getUserBadges(req.user!.id);

      res.json({
        success: true,
        data: badges,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des badges',
      });
    }
  }
}

export const badgeController = new BadgeController();
