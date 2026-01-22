import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { messageService } from '../services/message.service';

export class MessageController {
  /**
   * POST /messages
   * Envoie un message
   */
  async sendMessage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { mealId, content } = req.body;
      const message = await messageService.sendMessage(req.user!.id, mealId, content);

      res.status(201).json({
        success: true,
        message: 'Message envoyé avec succès',
        data: message,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de l\'envoi du message',
      });
    }
  }

  /**
   * GET /messages
   * Liste des conversations
   */
  async getConversations(req: AuthRequest, res: Response): Promise<void> {
    try {
      const conversations = await messageService.getConversations(req.user!.id);

      res.json({
        success: true,
        data: conversations,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des conversations',
      });
    }
  }

  /**
   * GET /messages/conversation/:mealId
   * Messages d'une conversation
   */
  async getConversationMessages(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { mealId } = req.params;
      const messages = await messageService.getConversationMessages(mealId, req.user!.id);

      res.json({
        success: true,
        data: messages,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des messages',
      });
    }
  }

  /**
   * PUT /messages/:id/read
   * Marquer un message comme lu
   */
  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await messageService.markAsRead(id, req.user!.id);

      res.json({
        success: true,
        message: 'Message marqué comme lu',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors du marquage',
      });
    }
  }

  /**
   * GET /messages/unread-count
   * Nombre de messages non lus
   */
  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const count = await messageService.getUnreadCount(req.user!.id);

      res.json({
        success: true,
        data: { count },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération',
      });
    }
  }
}

export const messageController = new MessageController();
