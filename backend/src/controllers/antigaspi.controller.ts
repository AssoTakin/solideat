import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { antiGaspiService } from '../services/antigaspi.service';
import prisma from '../config/database';

export class AntiGaspiController {
  /**
   * GET /meals/anti-gaspi
   * Liste des repas "Anti-Gaspi"
   */
  async getAntiGaspiMeals(req: AuthRequest | any, res: Response): Promise<void> {
    try {
      const filters: any = {
        distance: req.query.distance ? parseFloat(req.query.distance as string) : undefined,
        portions: req.query.portions ? parseInt(req.query.portions as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      // Si l'utilisateur est connecté, récupérer ses coordonnées et type d'abonnement
      if (req.user && 'id' in req.user) {
        const user = await prisma.user.findUnique({
          where: { id: req.user.id },
          select: { latitude: true, longitude: true, subscriptionType: true },
        });
        if (user) {
          filters.userLat = user.latitude;
          filters.userLng = user.longitude;
          filters.subscriptionType = user.subscriptionType;
        }
      }

      const result = await antiGaspiService.getAntiGaspiMeals(filters);

      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des repas "Anti-Gaspi"',
      });
    }
  }
}

export const antiGaspiController = new AntiGaspiController();
