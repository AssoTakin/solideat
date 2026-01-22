import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { subscriptionService } from '../services/subscription.service';

export class SubscriptionController {
  /**
   * GET /subscriptions/plans
   * Récupère les plans d'abonnement disponibles
   */
  async getPlans(_req: AuthRequest | any, res: Response): Promise<void> {
    try {
      const plans = subscriptionService.getPlans();

      res.json({
        success: true,
        data: plans,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des plans',
      });
    }
  }

  /**
   * GET /subscriptions/current
   * Récupère l'abonnement actuel de l'utilisateur
   */
  async getCurrentSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const subscription = await subscriptionService.getCurrentSubscription(req.user!.id);

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        error: error.message || 'Abonnement non trouvé',
      });
    }
  }

  /**
   * POST /subscriptions
   * Crée un nouvel abonnement
   */
  async createSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planType, paymentMethodId } = req.body;

      const subscription = await subscriptionService.createSubscription(
        req.user!.id,
        planType,
        paymentMethodId
      );

      res.status(201).json({
        success: true,
        message: 'Abonnement créé avec succès',
        data: subscription,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la création de l\'abonnement',
      });
    }
  }

  /**
   * DELETE /subscriptions
   * Annule l'abonnement actuel
   */
  async cancelSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      await subscriptionService.cancelSubscription(req.user!.id);

      res.json({
        success: true,
        message: 'Abonnement annulé avec succès',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de l\'annulation de l\'abonnement',
      });
    }
  }
}

export const subscriptionController = new SubscriptionController();
