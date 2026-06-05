import { NotificationType } from '@prisma/client';
import prisma from '../config/database';
import { emailService } from './email.service';
import { pushNotificationService } from './push-notification.service';

export class NotificationService {
  /**
   * Crée une notification en base de données
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ): Promise<any> {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        link,
      },
    });
  }

  /**
   * Envoie une notification (email + notification en base + push)
   */
  async sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    link?: string,
    sendEmail: boolean = true
  ): Promise<void> {
    // Créer la notification en base
    await this.createNotification(userId, type, title, message, link);

    // Envoyer l'email si demandé
    if (sendEmail) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });

      if (user) {
        emailService.sendNotificationEmail(user.email, title, message, link).catch(() => {
          // Erreur silencieuse
        });
      }
    }

    // Envoyer la notification push
    pushNotificationService.sendPushNotification(userId, {
      title,
      message,
      link,
      data: { type },
    }).catch(() => {
      // Erreur silencieuse
    });
  }
}

export const notificationService = new NotificationService();
