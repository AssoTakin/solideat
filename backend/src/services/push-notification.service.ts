import webpush from 'web-push';
import prisma from '../config/database';

// Configuration Web Push (à configurer avec les clés VAPID)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@solideat.fr';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn("⚠️ Clés VAPID non configurées. Les notifications push réelles seront inactives.");
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  /**
   * Retourne la clé publique VAPID configurée
   */
  getPublicKey(): string {
    return process.env.VAPID_PUBLIC_KEY || '';
  }

  /**
   * Enregistre une subscription push pour un utilisateur (US-038)
   */
  async registerSubscription(userId: string, subscription: PushSubscription): Promise<void> {
    // Vérifier si l'abonnement existe déjà
    const existing = await prisma.pushSubscription.findUnique({
      where: { endpoint: subscription.endpoint },
    });

    if (existing) {
      if (existing.userId !== userId) {
        // Mettre à jour l'utilisateur si l'abonnement appartenait à quelqu'un d'autre
        await prisma.pushSubscription.update({
          where: { id: existing.id },
          data: { userId },
        });
      }
      return;
    }

    // Créer l'abonnement
    await prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });
  }

  /**
   * Désenregistre une subscription push
   */
  async unregisterSubscription(endpoint: string): Promise<void> {
    try {
      await prisma.pushSubscription.delete({
        where: { endpoint },
      });
    } catch (error) {
      // Ignorer si déjà supprimé
    }
  }

  /**
   * Envoie une notification push à un utilisateur
   */
  async sendPushNotification(userId: string, payload: {
    title: string;
    message: string;
    icon?: string;
    badge?: string;
    data?: any;
    link?: string;
  }): Promise<void> {
    // Si les clés ne sont pas configurées, on ne fait rien
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return;
    }

    // Récupérer les souscriptions de l'utilisateur
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      return;
    }

    // Préparer le payload
    const notificationPayload = JSON.stringify({
      title: payload.title,
      body: payload.message,
      icon: payload.icon || '/icon-192x192.png',
      badge: payload.badge || '/badge-72x72.png',
      data: {
        ...payload.data,
        link: payload.link,
      },
    });

    // Envoyer à toutes les souscriptions actives
    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          notificationPayload
        );
      } catch (error: any) {
        // Si la souscription est obsolète (410 Gone ou 404 Not Found), on la supprime de la base
        if (error.statusCode === 410 || error.statusCode === 404) {
          await this.unregisterSubscription(sub.endpoint);
        }
      }
    });

    await Promise.all(sendPromises);
  }

  /**
   * Envoie une notification push pour un nouveau repas "Sauvez-les" (priorité premium)
   */
  async sendSaveThemNotification(userId: string, meal: any): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true },
    });

    // Seuls les membres premium reçoivent les notifications "Sauvez-les"
    if (!user || user.subscriptionType === 'FREE') {
      return;
    }

    await this.sendPushNotification(userId, {
      title: 'Nouveau repas à sauver !',
      message: `${meal.name} est disponible dans "Sauvez-les"`,
      icon: meal.photo,
      data: {
        type: 'SAVE_THEM',
        mealId: meal.id,
      },
      link: `/meals/${meal.id}`,
    });
  }

  /**
   * Envoie une notification push pour une nouvelle réservation
   */
  async sendReservationNotification(userId: string, reservation: any): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Nouvelle réservation',
      message: `${reservation.user.username} a réservé votre repas "${reservation.meal.name}"`,
      data: {
        type: 'RESERVATION',
        reservationId: reservation.id,
        mealId: reservation.meal.id,
      },
      link: `/reservations/${reservation.id}`,
    });
  }

  /**
   * Envoie une notification push pour un rappel de récupération
   */
  async sendPickupReminderNotification(userId: string, meal: any): Promise<void> {
    await this.sendPushNotification(userId, {
      title: 'Rappel : Récupération de repas',
      message: `N'oubliez pas de récupérer "${meal.name}" à ${meal.pickupAddress}`,
      data: {
        type: 'PICKUP_REMINDER',
        mealId: meal.id,
      },
      link: `/meals/${meal.id}`,
    });
  }
}

export const pushNotificationService = new PushNotificationService();
