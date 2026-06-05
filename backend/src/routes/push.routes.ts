import { Router, Response } from 'express';
import { pushNotificationService } from '../services/push-notification.service';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Route publique pour récupérer la clé VAPID publique
router.get('/key', (_req, res: Response) => {
  try {
    const publicKey = pushNotificationService.getPublicKey();
    res.json({
      success: true,
      data: { publicKey },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la récupération de la clé publique',
    });
  }
});

// Toutes les autres routes push nécessitent une authentification
router.use(authenticate);

// Enregistrer un abonnement push
router.post('/subscribe', async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      res.status(400).json({
        success: false,
        error: 'Abonnement push invalide. Les champs endpoint, keys.p256dh et keys.auth sont obligatoires.',
      });
      return;
    }

    await pushNotificationService.registerSubscription(req.user!.id, {
      endpoint,
      keys,
    });

    res.json({
      success: true,
      message: 'Abonnement push enregistré avec succès',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de l\'enregistrement de l\'abonnement push',
    });
  }
});

// Supprimer un abonnement push
router.post('/unsubscribe', async (req: AuthRequest, res: Response) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      res.status(400).json({
        success: false,
        error: 'Le champ endpoint est obligatoire.',
      });
      return;
    }

    await pushNotificationService.unregisterSubscription(endpoint);

    res.json({
      success: true,
      message: 'Abonnement push supprimé avec succès',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erreur lors de la suppression de l\'abonnement push',
    });
  }
});

export default router;
