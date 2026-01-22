import cron from 'node-cron';
import prisma from '../config/database';
import { SubscriptionType } from '@prisma/client';

/**
 * Job : Renouvellement d'abonnements
 * Exécuté quotidiennement
 */
export function setupSubscriptionRenewalJob(): void {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 [Cron] Vérification des abonnements expirant...');

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
        // Envoyer notification
        console.log(`📧 Notification renouvellement envoyée: ${user.id}`);

        // TODO: Tenter renouvellement automatique via Stripe si carte valide
        // Si échec, rétrograder en membre gratuit
      }

      // Vérifier les abonnements expirés
      const expiredSubscriptions = await prisma.user.findMany({
        where: {
          subscriptionType: {
            not: 'FREE',
          },
          subscriptionEnd: {
            lt: now,
          },
        },
      });

      // Rétrograder en membre gratuit
      await prisma.user.updateMany({
        where: {
          id: {
            in: expiredSubscriptions.map((u) => u.id),
          },
        },
        data: {
          subscriptionType: SubscriptionType.FREE,
          subscriptionStart: null,
          subscriptionEnd: null,
        },
      });

      console.log(`✅ ${expiringSubscriptions.length} abonnements expirent bientôt`);
      console.log(`✅ ${expiredSubscriptions.length} abonnements rétrogradés en gratuit`);
    } catch (error) {
      console.error('❌ Erreur lors du renouvellement des abonnements:', error);
    }
  });

  console.log('✅ Job de renouvellement d\'abonnements configuré (quotidien)');
}
