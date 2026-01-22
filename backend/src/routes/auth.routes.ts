import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
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

export default router;
