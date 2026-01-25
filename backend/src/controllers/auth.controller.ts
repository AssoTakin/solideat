import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { emailService } from '../services/email.service';
import { smsService } from '../services/sms.service';
import prisma from '../config/database';

export class AuthController {
  /**
   * POST /auth/register
   * Inscription d'un nouvel utilisateur
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        message: 'Inscription réussie. Veuillez vérifier votre email et téléphone.',
        data: {
          user: result.user,
          // En développement, on retourne le code téléphone pour faciliter les tests
          // En production, ne pas retourner le code
          ...(process.env.NODE_ENV === 'development' && {
            phoneCode: result.phoneCode,
          }),
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de l\'inscription',
      });
    }
  }

  /**
   * POST /auth/verify-email
   * Vérification de l'email
   */
  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Token manquant',
        });
        return;
      }

      const verified = await authService.verifyEmail(token);

      if (verified) {
        res.json({
          success: true,
          message: 'Email vérifié avec succès',
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Échec de la vérification',
        });
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la vérification',
      });
    }
  }

  /**
   * POST /auth/verify-phone
   * Vérification du téléphone
   */
  async verifyPhone(req: Request, res: Response): Promise<void> {
    try {
      const { code, userId } = req.body;

      if (!code || !userId) {
        res.status(400).json({
          success: false,
          error: 'Code et userId requis',
        });
        return;
      }

      const verified = await authService.verifyPhone(userId, code);

      if (verified) {
        res.json({
          success: true,
          message: 'Téléphone vérifié avec succès',
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Code invalide ou expiré',
        });
      }
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la vérification',
      });
    }
  }

  /**
   * POST /auth/login
   * Connexion
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json({
        success: true,
        message: 'Connexion réussie',
        data: result,
      });
    } catch (error: any) {
      res.status(401).json({
        success: false,
        error: error.message || 'Erreur lors de la connexion',
      });
    }
  }

  /**
   * POST /auth/logout
   * Déconnexion
   */
  async logout(_req: Request, res: Response): Promise<void> {
    // Pour l'instant, la déconnexion est gérée côté client (suppression du token)
    // On pourrait implémenter une blacklist de tokens en production
    res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  }

  /**
   * POST /auth/resend-verification-email
   * Renvoyer l'email de vérification
   */
  async resendVerificationEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({
          success: false,
          error: 'Email requis',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'Utilisateur non trouvé',
        });
        return;
      }

      if (user.emailVerified) {
        res.json({
          success: true,
          message: 'Email déjà vérifié',
        });
        return;
      }

      // Générer un nouveau token de vérification email
      const jwt = require('jsonwebtoken');
      const emailToken = jwt.sign(
        { email: user.email, type: 'email-verification' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '24h' }
      );

      console.log(`[AuthController] Renvoi d'email de vérification pour ${user.email}`);
      await emailService.resendVerificationEmail(user.email, emailToken);

      res.json({
        success: true,
        message: 'Email de vérification renvoyé',
      });
    } catch (error: any) {
      console.error('[AuthController] Erreur lors du renvoi d\'email de vérification:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de l\'envoi',
      });
    }
  }

  /**
   * POST /auth/resend-verification-sms
   * Renvoyer le SMS de vérification
   */
  async resendVerificationSMS(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      if (!userId) {
        res.status(400).json({
          success: false,
          error: 'userId requis',
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.phone) {
        res.status(404).json({
          success: false,
          error: 'Utilisateur ou téléphone non trouvé',
        });
        return;
      }

      if (user.phoneVerified) {
        res.json({
          success: true,
          message: 'Téléphone déjà vérifié',
        });
        return;
      }

      const code = smsService.generateVerificationCode();
      await smsService.resendVerificationSMS(user.phone, code);

      res.json({
        success: true,
        message: 'SMS de vérification renvoyé',
        // En développement, on retourne le code pour faciliter les tests
        ...(process.env.NODE_ENV === 'development' && {
          code,
        }),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de l\'envoi',
      });
    }
  }

  /**
   * POST /auth/forgot-password
   * Mot de passe oublié
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      await authService.forgotPassword(email);

      // Toujours retourner un succès pour ne pas révéler si l'email existe
      res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      });
    } catch (error: any) {
      // Même en cas d'erreur, on retourne un succès pour la sécurité
      res.json({
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      });
    }
  }

  /**
   * POST /auth/reset-password
   * Réinitialisation du mot de passe
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      await authService.resetPassword(token, password);

      res.json({
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la réinitialisation',
      });
    }
  }
}

export const authController = new AuthController();
