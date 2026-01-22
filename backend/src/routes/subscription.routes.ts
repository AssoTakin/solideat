import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { createSubscriptionSchema } from '../validators/subscription.validator';

const router = Router();

// Plans d'abonnement (accessible sans authentification)
router.get('/plans', subscriptionController.getPlans.bind(subscriptionController));

// Abonnement actuel (nécessite authentification)
router.get(
  '/current',
  authenticate,
  subscriptionController.getCurrentSubscription.bind(subscriptionController)
);

// Création d'abonnement (nécessite authentification)
router.post(
  '/',
  authenticate,
  validate(createSubscriptionSchema),
  subscriptionController.createSubscription.bind(subscriptionController)
);

// Annulation d'abonnement (nécessite authentification)
router.delete(
  '/',
  authenticate,
  subscriptionController.cancelSubscription.bind(subscriptionController)
);

export default router;
