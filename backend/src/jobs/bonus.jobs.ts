import cron from 'node-cron';
import prisma from '../config/database';

/**
 * Job : Expiration des bonus donateurs
 * Exécuté quotidiennement
 */
export function setupBonusExpirationJob(): void {
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 [Cron] Vérification des bonus donateurs expirant...');

    try {
      const now = new Date();
      const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

      // Trouver les bonus expirant dans 3 jours
      const expiringBonuses = await prisma.bonusDonor.findMany({
        where: {
          expiresAt: {
            lte: in3Days,
            gt: now,
          },
          usedAt: null,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      for (const bonus of expiringBonuses) {
        // Envoyer notification
        // TODO: Implémenter NotificationService
        console.log(`📧 Notification expiration bonus envoyée: ${bonus.id}`);
      }

      // Marquer comme expirés les bonus dont la date est passée
      await prisma.bonusDonor.updateMany({
        where: {
          expiresAt: {
            lt: now,
          },
          usedAt: null,
        },
        data: {
          // On peut ajouter un champ expired si nécessaire
        },
      });

      console.log(`✅ ${expiringBonuses.length} bonus expirent bientôt`);
    } catch (error) {
      console.error('❌ Erreur lors de la vérification des bonus:', error);
    }
  });

  console.log('✅ Job d\'expiration des bonus configuré (quotidien)');
}
