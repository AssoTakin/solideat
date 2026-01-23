import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Profil de l'utilisateur connecté (nécessite authentification)
router.get('/me', authenticate, userController.getMe.bind(userController));

// Mise à jour du profil (nécessite authentification)
router.put('/me', authenticate, userController.updateProfile.bind(userController));

// Changement de mot de passe (nécessite authentification)
router.put('/me/password', authenticate, userController.changePassword.bind(userController));

// Changement d'adresse (nécessite authentification)
router.put('/me/address', authenticate, userController.changeAddress.bind(userController));

// Paramètres de confidentialité (nécessite authentification)
router.put('/me/privacy', authenticate, userController.updatePrivacy.bind(userController));

// Tableau de bord (nécessite authentification)
router.get('/me/dashboard', authenticate, userController.getDashboardStats.bind(userController));

// Quotas (nécessite authentification)
router.get('/me/quotas', authenticate, userController.getQuotas.bind(userController));

// Statistiques d'impact environnemental (nécessite authentification, Premium uniquement)
router.get('/me/environmental-impact', authenticate, userController.getEnvironmentalImpact.bind(userController));

// Profil public (accessible sans authentification)
router.get('/:id', userController.getPublicProfile.bind(userController));

export default router;
