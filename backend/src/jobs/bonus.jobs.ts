import cron from 'node-cron';
import { bonusDonorService } from '../services/bonus-donor.service';

/**
 * Job : Expiration des bonus donateurs (US-051)
 * Exécuté quotidiennement
 */
export function setupBonusExpirationJob(): void {
  cron.schedule('0 0 * * *', async () => {
    try {
      await bonusDonorService.checkExpiringBonuses();
    } catch (error) {
      // Erreur silencieuse - le job sera réexécuté le lendemain
    }
  });
}
