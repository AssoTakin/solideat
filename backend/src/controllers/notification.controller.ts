import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../config/database';

export class NotificationController {
  /**
   * GET /notifications
   * Liste des notifications de l'utilisateur
   */
  async getNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { read } = req.query;

      const where: any = {
        userId: req.user!.id,
      };

      if (read !== undefined) {
        where.read = read === 'true';
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: 50, // Limiter à 50 dernières
      });

      res.json({
        success: true,
        data: notifications,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors de la récupération des notifications',
      });
    }
  }

  /**
   * PUT /notifications/:id/read
   * Marquer une notification comme lue
   */
  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.notification.update({
        where: {
          id,
          userId: req.user!.id, // Vérifier que la notification appartient à l'utilisateur
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Notification marquée comme lue',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Erreur lors du marquage',
      });
    }
  }

  /**
   * PUT /notifications/read-all
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      await prisma.notification.updateMany({
        where: {
          userId: req.user!.id,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      res.json({
        success: true,
        message: 'Toutes les notifications ont été marquées comme lues',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Erreur lors du marquage',
      });
    }
  }

  /**
   * GET /notifications/unread-count
   * Nombre de notifications non lues
   */
  async getUnreadCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const count = await prisma.notification.count({
        where: {
          userId: req.user!.id,
          read: false,
        },
      });

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

export const notificationController = new NotificationController();
