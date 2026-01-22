import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Liste des notifications
router.get('/', notificationController.getNotifications.bind(notificationController));

// Marquer comme lu
router.put('/:id/read', notificationController.markAsRead.bind(notificationController));

// Marquer tout comme lu
router.put('/read-all', notificationController.markAllAsRead.bind(notificationController));

// Nombre de notifications non lues
router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));

// Messages système (US-044)
router.get('/system', notificationController.getSystemMessages.bind(notificationController));
router.put('/system/:id/read', notificationController.markSystemMessageAsRead.bind(notificationController));

export default router;
