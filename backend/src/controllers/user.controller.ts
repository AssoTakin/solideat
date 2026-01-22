import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { dashboardService } from '../services/dashboard.service';
import { quotaService } from '../services/quota.service';

export class UserController {
  /**
   * GET /users/me
   * Profil de l'utilisateur connecté
   */
  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: {
          id: true,
          email: true,
          phone: true,
          phoneVerified: true,
          emailVerified: true,
          firstName: true,
          lastName: true,
          username: true,
          profilePhoto: true,
          description: true,
          culinaryStyle: true,
          addressStreet: true,
          addressZipCode: true,
          addressCity: true,
          latitude: true,
          longitude: true,
          subscriptionType: true,
          subscriptionStart: true,
          subscriptionEnd: true,
          globalRating: true,
          mealsServed: true,
          mealsReceived: true,
          mealsExpired: true,
          mealsSaved: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération du profil',
      });
    }
  }

  /**
   * GET /users/:id
   * Profil public d'un utilisateur
   */
  async getPublicProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          username: true,
          profilePhoto: true,
          description: true,
          culinaryStyle: true,
          addressCity: true, // Seulement la ville, pas l'adresse complète
          globalRating: true,
          mealsServed: true,
          mealsReceived: true,
          subscriptionType: true,
          phone: true,
          hidePhoneNumber: true,
          createdAt: true,
        },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé',
        });
        return;
      }

      // Masquer le téléphone si l'utilisateur a activé la confidentialité (premium uniquement)
      const publicProfile = {
        ...user,
        phone: user.hidePhoneNumber && user.subscriptionType !== 'FREE' ? null : user.phone,
        hidePhoneNumber: undefined, // Ne pas exposer ce champ
      };

      res.json({
        success: true,
        data: publicProfile,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération du profil',
      });
    }
  }

  /**
   * GET /users/me/dashboard
   * Statistiques du tableau de bord
   */
  async getDashboardStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await dashboardService.getDashboardStats(req.user!.id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des statistiques',
      });
    }
  }

  /**
   * GET /users/me/quotas
   * Statut détaillé des quotas (US-047)
   */
  async getQuotas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const quotaStatus = await quotaService.getQuotaStatus(req.user!.id);

      res.json({
        success: true,
        data: quotaStatus,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des quotas',
      });
    }
  }
}

export const userController = new UserController();
