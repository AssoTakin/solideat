import { Router } from 'express';
import { reviewController } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createReviewSchema } from '../validators/review.validator';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Création d'un avis
router.post('/', validate(createReviewSchema), reviewController.createReview.bind(reviewController));

// Liste des avis d'un cuisinier (accessible sans auth aussi)
router.get('/cook/:cookId', reviewController.getCookReviews.bind(reviewController));

export default router;
