// import webpush from 'web-push'; // TODO: Installer web-push: npm install web-push @types/web-push
import prisma from '../config/database';

// Configuration Web Push (à configurer avec les clés VAPID)
// const vapidPublicKey = process.env.VAPID_PUBLIC_KEY || '';
// const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || '';
// const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:contact@solideat.fr';

// if (vapidPublicKey && vapidPrivateKey) {
//   webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
// }

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationService {
  /**
   * Enregistre une subscription push pour un utilisateur (US-038)
   */
  async registerSubscription(_userId: string, _subscription: PushSubscription): Promise<void> {
    // Stocker la subscription dans la base de données
    // Pour l'instant, on stocke dans un champ JSON de l'utilisateur
    // Dans une vraie implémentation, on créerait une table PushSubscription
    // await prisma.user.update({
    //   where: { id: userId },
    //   data: {
    //     // TODO: Créer un champ pushSubscriptions dans le schéma Prisma
    //     // pushSubscriptions: {
    //     //   push: [subscription],
    //     // },
    //   },
    // });
  }

  /**
   * Envoie une notification push à un utilisateur
   */
  async sendPushNotification(userId: string, _payload: {
    title: string;
    message: string;
    icon?: string;
    badge?: string;
    data?: any;
    link?: string;
  }): Promise<void> {
    // Récupérer les subscriptions de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      // TODO: Récupérer les pushSubscriptions
    });

    if (!user) {
      return;
    }

    // TODO: Récupérer les subscriptions depuis la base de données
    // Pour l'instant, on retourne sans rien faire
    // const subscriptions = user.pushSubscriptions || [];

    // Préparer le payload
    // const notificationPayload = JSON.stringify({
    //   title: payload.title,
    //   body: payload.message,
    //   icon: payload.icon || '/icon-192x192.png',
    //   badge: payload.badge || '/badge-72x72.png',
    //   data: {
    //     ...payload.data,
    //     link: payload.link,
    //   },
    // });

    // TODO: Envoyer à toutes les subscriptions
    // for (const subscription of subscriptions) {
    //   try {
    //     await webpush.sendNotification(
    //       {
    //         endpoint: subscription.endpoint,
    //         keys: {
    //           p256dh: subscription.keys.p256dh,
    //           auth: subscription.keys.auth,
    //         },
    //       },
    //       notificationPayload
    //     );
    //   } catch (error) {
    //     // Si la subscription est invalide, la supprimer
    //     if (error.statusCode === 410 || error.statusCode === 404) {
    //       // Supprimer la subscription
    //     }
    //   }
    // }
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
