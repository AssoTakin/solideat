import cron from 'node-cron';
import { exec } from 'child_process';
import { promisify } from 'util';
import { notificationService } from '../services/notification.service';
import { NotificationType } from '@prisma/client';

const execAsync = promisify(exec);

/**
 * Job : Audit de sécurité quotidien
 * Exécuté tous les jours à 2h00 du matin.
 * Lance le script Python de security audit et alerte en cas d'anomalie.
 */
export function setupSecurityAuditJob(): void {
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('[security-audit] Running daily security audit...');
      const auditPath = process.env.SECURITY_AUDIT_SCRIPT || './scripts/solideat-security-audit.py';
      const { stderr } = await execAsync(`python3 ${auditPath}`, { timeout: 300000 });

      if (stderr) {
        console.warn('[security-audit] stderr:', stderr);
      }

      const exitOk = !stderr || !stderr.includes('potential secret');

      if (!exitOk) {
        // Notifier les admins en cas de problème
        const adminUserId = process.env.ADMIN_USER_ID;
        if (adminUserId) {
          await notificationService
            .sendNotification(
              adminUserId,
              NotificationType.SYSTEM_MESSAGE,
              'Alerte sécurité Solideat',
              "L'audit de sécurité quotidien a détecté des anomalies. Consultez le rapport /tmp/solideat-security-audit-report.json.",
              '/admin/security',
              true
            )
            .catch(() => {
              // Erreur silencieuse
            });
        }
      }

      console.log('[security-audit] Done.');
    } catch (error: any) {
      console.error('[security-audit] Job failed:', error?.message || error);
    }
  });
}
