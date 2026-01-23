import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

const router = Router();

// Inscription
router.post('/register', validate(registerSchema), authController.register.bind(authController));

// Vérification email
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail.bind(authController));

// Vérification téléphone
router.post('/verify-phone', authController.verifyPhone.bind(authController));

// Connexion
router.post('/login', validate(loginSchema), authController.login.bind(authController));

// Déconnexion
router.post('/logout', authController.logout.bind(authController));

// Renvoyer email de vérification
router.post('/resend-verification-email', authController.resendVerificationEmail.bind(authController));

// Renvoyer SMS de vérification
router.post('/resend-verification-sms', authController.resendVerificationSMS.bind(authController));

// Mot de passe oublié
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword.bind(authController));

// Réinitialisation du mot de passe
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword.bind(authController));

export default router;
