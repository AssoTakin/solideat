import cron from 'node-cron';
import prisma from '../config/database';
import { SubscriptionType } from '@prisma/client';
import { notificationService } from '../services/notification.service';
import { emailService } from '../services/email.service';

/**
 * Job : Renouvellement d'abonnements (US-054)
 * Exécuté quotidiennement
 */
export function setupSubscriptionRenewalJob(): void {
  cron.schedule('0 0 * * *', async () => {
    try {
      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Trouver les abonnements expirant dans 3 jours
      const expiringSubscriptions = await prisma.user.findMany({
        where: {
          subscriptionType: {
            not: 'FREE',
          },
          subscriptionEnd: {
            lte: in3Days,
            gt: now,
          },
        },
        select: {
          id: true,
          email: true,
          subscriptionType: true,
          subscriptionEnd: true,
          stripeCustomerId: true,
        },
      });

      for (const user of expiringSubscriptions) {
        const daysUntilExpiration = Math.ceil(
          (user.subscriptionEnd!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Envoyer une notification
        await notificationService.createNotification(
          user.id,
          'SUBSCRIPTION_RENEWAL',
          'Abonnement expirant bientôt',
          `Votre abonnement premium expire dans ${daysUntilExpiration} jour${daysUntilExpiration > 1 ? 's' : ''}. Il sera renouvelé automatiquement si votre carte est valide.`,
          '/dashboard'
        );

        // Envoyer un email
        emailService.sendSubscriptionExpiringEmail(user.email, daysUntilExpiration).catch(() => {
          // Erreur silencieuse
        });

        // TODO: Tenter renouvellement automatique via Stripe si stripeCustomerId existe
        // Si échec, rétrograder en membre gratuit
        // if (user.stripeCustomerId) {
        //   try {
        //     // Appeler Stripe API pour renouveler
        //     // Si succès, mettre à jour subscriptionEnd
        //     // Si échec, rétrograder
        //   } catch (error) {
        //     // Rétrograder en membre gratuit
        //   }
        // }
      }

      // Vérifier les abonnements expirés et les rétrograder
      const expiredSubscriptions = await prisma.user.findMany({
        where: {
          subscriptionType: {
            not: 'FREE',
          },
          subscriptionEnd: {
            lt: now,
          },
        },
        select: {
          id: true,
          email: true,
        },
      });

      // Rétrograder en membre gratuit
      for (const user of expiredSubscriptions) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionType: SubscriptionType.FREE,
            subscriptionStart: null,
            subscriptionEnd: null,
          },
        });

        // Notifier l'utilisateur
        await notificationService.createNotification(
          user.id,
          'SYSTEM_MESSAGE',
          'Abonnement expiré',
          'Votre abonnement premium a expiré. Vous êtes maintenant membre gratuit. Vous pouvez souscrire à un nouvel abonnement à tout moment.',
          '/subscriptions'
        );

        // Envoyer un email
        emailService.sendSubscriptionExpiredEmail(user.email).catch(() => {
          // Erreur silencieuse
        });
      }
    } catch (error) {
      // Erreur silencieuse - le job sera réexécuté le lendemain
      console.error('Erreur dans le job de renouvellement d\'abonnements:', error);
    }
  });
}
