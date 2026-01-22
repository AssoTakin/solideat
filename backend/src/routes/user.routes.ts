import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Profil de l'utilisateur connecté (nécessite authentification)
router.get('/me', authenticate, userController.getMe.bind(userController));

// Tableau de bord (nécessite authentification)
router.get('/me/dashboard', authenticate, userController.getDashboardStats.bind(userController));

// Quotas (nécessite authentification)
router.get('/me/quotas', authenticate, userController.getQuotas.bind(userController));

// Profil public (accessible sans authentification)
router.get('/:id', userController.getPublicProfile.bind(userController));

export default router;
