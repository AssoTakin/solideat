import { Router } from 'express';
import { badgeController } from '../controllers/badge.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Liste des badges (nécessite authentification)
router.get('/', authenticate, badgeController.getMyBadges.bind(badgeController));

export default router;
