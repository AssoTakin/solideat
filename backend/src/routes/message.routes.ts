import { Router } from 'express';
import { messageController } from '../controllers/message.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { sendMessageSchema } from '../validators/message.validator';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);

// Envoi d'un message
router.post('/', validate(sendMessageSchema), messageController.sendMessage.bind(messageController));

// Liste des conversations
router.get('/', messageController.getConversations.bind(messageController));

// Messages d'une conversation
router.get('/conversation/:mealId', messageController.getConversationMessages.bind(messageController));

// Marquer comme lu
router.put('/:id/read', messageController.markAsRead.bind(messageController));

// Nombre de messages non lus
router.get('/unread-count', messageController.getUnreadCount.bind(messageController));

export default router;
