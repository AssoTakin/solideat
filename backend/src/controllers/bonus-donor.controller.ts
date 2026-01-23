import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { bonusDonorService } from '../services/bonus-donor.service';

export class BonusDonorController {
  /**
   * GET /bonus-donors
   * Liste des bonus donateurs disponibles pour l'utilisateur connecté
   */
  async getMyBonuses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const bonuses = await bonusDonorService.getAvailableBonuses(req.user!.id);

      res.json({
        success: true,
        data: bonuses,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des bonus',
      });
    }
  }

  /**
   * POST /bonus-donors/:id/transfer
   * Transfère un bonus donateur à un autre membre (US-029) - Premium uniquement
   */
  async transferBonus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { recipientUsername } = req.body;

      if (!recipientUsername) {
        res.status(400).json({
          success: false,
          error: 'Le pseudo du bénéficiaire est requis',
        });
        return;
      }

      await bonusDonorService.transferBonus(req.user!.id, id, recipientUsername);

      res.json({
        success: true,
        message: 'Bonus donateur transféré avec succès',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors du transfert du bonus',
      });
    }
  }
}

export const bonusDonorController = new BonusDonorController();
