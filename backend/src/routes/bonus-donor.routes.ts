import { Router } from 'express';
import { bonusDonorController } from '../controllers/bonus-donor.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Liste des bonus donateurs (nécessite authentification)
router.get('/', authenticate, bonusDonorController.getMyBonuses.bind(bonusDonorController));

// Transfert d'un bonus donateur (nécessite authentification, Premium uniquement)
router.post('/:id/transfer', authenticate, bonusDonorController.transferBonus.bind(bonusDonorController));

export default router;
