import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';
import { dashboardService } from '../services/dashboard.service';
import { quotaService } from '../services/quota.service';
import { userService } from '../services/user.service';
import { environmentalService } from '../services/environmental.service';

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

  /**
   * PUT /users/me
   * Mise à jour du profil (US-008)
   */
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { description, culinaryStyle, profilePhoto } = req.body;

      const updatedUser = await userService.updateProfile(req.user!.id, {
        description,
        culinaryStyle,
        profilePhoto,
      });

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès',
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la mise à jour du profil',
      });
    }
  }

  /**
   * PUT /users/me/password
   * Changement de mot de passe (US-008)
   */
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Ancien et nouveau mot de passe requis',
        });
        return;
      }

      await userService.changePassword(req.user!.id, oldPassword, newPassword);

      res.json({
        success: true,
        message: 'Mot de passe modifié avec succès',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors du changement de mot de passe',
      });
    }
  }

  /**
   * PUT /users/me/address
   * Changement d'adresse (US-008)
   */
  async changeAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { addressStreet, addressZipCode, addressCity } = req.body;

      if (!addressStreet || !addressZipCode || !addressCity) {
        res.status(400).json({
          success: false,
          error: 'Tous les champs d\'adresse sont requis',
        });
        return;
      }

      const updatedUser = await userService.changeAddress(req.user!.id, {
        addressStreet,
        addressZipCode,
        addressCity,
      });

      res.json({
        success: true,
        message: 'Adresse mise à jour avec succès',
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors du changement d\'adresse',
      });
    }
  }

  /**
   * PUT /users/me/privacy
   * Mise à jour des paramètres de confidentialité (US-009)
   */
  async updatePrivacy(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { hidePhoneNumber } = req.body;

      if (typeof hidePhoneNumber !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'hidePhoneNumber doit être un booléen',
        });
        return;
      }

      const updatedUser = await userService.updatePrivacy(req.user!.id, hidePhoneNumber);

      res.json({
        success: true,
        message: 'Paramètres de confidentialité mis à jour',
        data: updatedUser,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la mise à jour des paramètres',
      });
    }
  }

  /**
   * GET /users/me/environmental-impact
   * Statistiques d'impact environnemental (US-026) - Premium uniquement
   */
  async getEnvironmentalImpact(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await environmentalService.getEnvironmentalImpact(req.user!.id);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des statistiques environnementales',
      });
    }
  }
}

export const userController = new UserController();
