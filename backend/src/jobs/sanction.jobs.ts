import cron from 'node-cron';
import prisma from '../config/database';
import { sanctionService } from '../services/sanction.service';

/**
 * Job : Vérification quotidienne des sanctions (US-045, US-046)
 * Exécuté quotidiennement à minuit
 */
export function setupSanctionCheckJob(): void {
  cron.schedule('0 0 * * *', async () => {
    try {
      // Désactiver les sanctions expirées
      await sanctionService.deactivateExpiredSanctions();

      // Récupérer tous les utilisateurs actifs
      const users = await prisma.user.findMany({
        select: {
          id: true,
        },
      });

      // Vérifier chaque utilisateur
      for (const user of users) {
        // Vérifier les sanctions pour annulations
        await sanctionService.checkAndApplyCancellationSanctions(user.id);

        // Vérifier les sanctions pour repas non récupérés
        await sanctionService.checkAndApplyNotPickedUpSanctions(user.id);
      }
    } catch (error) {
      // Erreur silencieuse - le job sera réexécuté le lendemain
    }
  });
}
