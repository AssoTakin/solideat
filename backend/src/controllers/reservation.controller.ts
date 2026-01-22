import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { reservationService } from '../services/reservation.service';

export class ReservationController {
  /**
   * POST /reservations
   * Création d'une réservation
   */
  async createReservation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { mealId, useBonusDonor } = req.body;
      const reservation = await reservationService.createReservation(
        req.user!.id,
        mealId,
        useBonusDonor
      );

      res.status(201).json({
        success: true,
        message: 'Réservation créée avec succès',
        data: reservation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la création de la réservation',
      });
    }
  }

  /**
   * GET /reservations
   * Liste des réservations de l'utilisateur
   */
  async getMyReservations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters: any = {};
      if (req.query.status) {
        filters.status = req.query.status as string;
      }

      const reservations = await reservationService.getUserReservations(req.user!.id, filters);

      res.json({
        success: true,
        data: reservations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des réservations',
      });
    }
  }

  /**
   * DELETE /reservations/:id
   * Annulation d'une réservation
   */
  async cancelReservation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      if (!reason) {
        res.status(400).json({
          success: false,
          error: 'Le motif d\'annulation est requis',
        });
        return;
      }

      await reservationService.cancelReservation(id, req.user!.id, reason);

      res.json({
        success: true,
        message: 'Réservation annulée avec succès',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de l\'annulation',
      });
    }
  }

  /**
   * PUT /reservations/:id/pickup
   * Marquer un repas comme récupéré
   */
  async markAsPickedUp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await reservationService.markAsPickedUp(id, req.user!.id);

      res.json({
        success: true,
        message: 'Repas marqué comme récupéré',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors du marquage',
      });
    }
  }

  /**
   * POST /reservations/:id/report-not-picked-up
   * Signaler un repas non récupéré
   */
  async reportNotPickedUp(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await reservationService.reportNotPickedUp(id, req.user!.id);

      res.json({
        success: true,
        message: 'Repas signalé comme non récupéré',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors du signalement',
      });
    }
  }
}

export const reservationController = new ReservationController();
