import prisma from '../config/database';
import { SanctionType, NotificationType } from '@prisma/client';
import { notificationService } from './notification.service';
import { emailService } from './email.service';

export interface SanctionResult {
  applied: boolean;
  sanctionId?: string;
  message?: string;
}

export class SanctionService {
  /**
   * Détecte et applique les sanctions pour annulations (plafond mensuel atteint)
   */
  async checkAndApplyCancellationSanctions(userId: string): Promise<SanctionResult> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Compter annulations + repas non récupérés ce mois
    const [cancellations, notPickedUp] = await Promise.all([
      prisma.reservation.count({
        where: {
          userId,
          cancelledAt: {
            gte: startOfMonth,
          },
        },
      }),
      prisma.meal.count({
        where: {
          reservation: {
            userId,
          },
          status: 'NOT_PICKED_UP',
          updatedAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    const total = cancellations + notPickedUp;

    // Plafond : 4 (annulations + repas non récupérés combinés)
    if (total >= 4) {
      // Vérifier si une sanction active existe déjà pour ce mois
      const existingSanction = await prisma.sanction.findFirst({
        where: {
          userId,
          active: true,
          type: {
            in: [SanctionType.CANCELLATION_BLOCK, SanctionType.QUOTA_REDUCTION],
          },
          startDate: {
            gte: startOfMonth,
          },
        },
      });

      if (existingSanction) {
        return {
          applied: false,
          message: 'Sanction déjà appliquée pour ce mois',
        };
      }

      // Appliquer les sanctions
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 14); // 2 semaines

      // 1. Blocage des annulations pendant 2 semaines
      const cancellationBlock = await prisma.sanction.create({
        data: {
          userId,
          type: SanctionType.CANCELLATION_BLOCK,
          reason: `Plafond mensuel atteint : ${total} (${cancellations} annulations + ${notPickedUp} repas non récupérés)`,
          startDate: now,
          endDate,
          active: true,
        },
      });

      // 2. Quota mensuel réduit pour le mois suivant
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

      await prisma.sanction.create({
        data: {
          userId,
          type: SanctionType.QUOTA_REDUCTION,
          reason: 'Quota mensuel réduit suite au plafond atteint',
          startDate: nextMonth,
          endDate: nextMonthEnd,
          quotaReduction: 2, // Réduit à 2 annulations maximum
          active: true,
        },
      });

      // Créer message obligatoire
      const messageTitle = 'Sanction appliquée : Plafond mensuel atteint';
      const messageContent = `Vous avez atteint le plafond mensuel de 4 annulations et/ou repas non récupérés (${cancellations} annulations + ${notPickedUp} repas non récupérés).

Sanctions appliquées :
- Blocage des annulations pendant 2 semaines (jusqu'au ${endDate.toLocaleDateString('fr-FR')})
- Quota mensuel réduit à 2 annulations maximum pour le mois prochain

Cette sanction vise à limiter le gaspillage alimentaire. Merci de respecter vos engagements.`;

      await notificationService.createNotification(
        userId,
        NotificationType.SYSTEM_MESSAGE,
        messageTitle,
        messageContent,
        '/dashboard'
      );

      // Envoyer email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true },
      });

      if (user) {
        await emailService.sendVerificationEmail(
          user.email,
          `SOLID'EAT - Sanction appliquée : Plafond mensuel atteint`
        ).catch(() => {
          // Erreur silencieuse
        });
      }

      // Notification via l'application
      await notificationService.sendNotification(
        userId,
        NotificationType.SANCTION_APPLIED,
        'Sanction appliquée',
        'Un message important vous attend dans votre espace abonné',
        '/dashboard',
        false
      );

      return {
        applied: true,
        sanctionId: cancellationBlock.id,
        message: 'Sanctions appliquées : blocage annulations + quota réduit',
      };
    }

    return {
      applied: false,
      message: 'Plafond non atteint',
    };
  }

  /**
   * Applique les sanctions pour repas non récupérés
   */
  async checkAndApplyNotPickedUpSanctions(userId: string): Promise<SanctionResult> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Compter repas non récupérés ce mois
    const notPickedUpCount = await prisma.meal.count({
      where: {
        reservation: {
          userId,
        },
        status: 'NOT_PICKED_UP',
        updatedAt: {
          gte: startOfMonth,
        },
      },
    });

    if (notPickedUpCount === 0) {
      return {
        applied: false,
        message: 'Aucun repas non récupéré ce mois',
      };
    }

    // 1 repas non récupéré : Avertissement
    if (notPickedUpCount === 1) {
      // Vérifier si l'avertissement a déjà été envoyé ce mois
      const existingWarning = await prisma.notification.findFirst({
        where: {
          userId,
          type: NotificationType.SYSTEM_MESSAGE,
          createdAt: {
            gte: startOfMonth,
          },
          message: {
            contains: 'repas non récupéré',
          },
        },
      });

      if (existingWarning) {
        return {
          applied: false,
          message: 'Avertissement déjà envoyé',
        };
      }

      // Appliquer impact sur la note (coefficient négatif)
      await this.applyRatingPenalty(userId, 0.1); // -10% sur la note

      // Créer message obligatoire
      const messageTitle = 'Avertissement : Repas non récupéré';
      const messageContent = `Vous avez signalé un repas non récupéré ce mois. Ce comportement nuit à la communauté et contribue au gaspillage alimentaire.

Impact : Votre note globale a été légèrement réduite.

Merci de respecter vos engagements et de récupérer les repas que vous réservez.`;

      await notificationService.createNotification(
        userId,
        NotificationType.SYSTEM_MESSAGE,
        messageTitle,
        messageContent,
        '/dashboard'
      );

      // Envoyer email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true },
      });

      if (user) {
        await emailService.sendVerificationEmail(
          user.email,
          `SOLID'EAT - Avertissement : Repas non récupéré`
        ).catch(() => {
          // Erreur silencieuse
        });
      }

      // Notification via l'application
      await notificationService.sendNotification(
        userId,
        NotificationType.SANCTION_APPLIED,
        'Avertissement',
        'Un message important vous attend dans votre espace abonné',
        '/dashboard',
        false
      );

      return {
        applied: true,
        message: 'Avertissement appliqué pour 1 repas non récupéré',
      };
    }

    // 2 repas non récupérés dans le mois : Sanctions sévères
    if (notPickedUpCount >= 2) {
      // Vérifier si une sanction active existe déjà pour ce mois
      const existingSanction = await prisma.sanction.findFirst({
        where: {
          userId,
          active: true,
          type: SanctionType.RESERVATION_BLOCK,
          startDate: {
            gte: startOfMonth,
          },
        },
      });

      if (existingSanction) {
        return {
          applied: false,
          message: 'Sanction déjà appliquée pour ce mois',
        };
      }

      // Blocage immédiat des réservations pendant 2 semaines
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 14);

      const reservationBlock = await prisma.sanction.create({
        data: {
          userId,
          type: SanctionType.RESERVATION_BLOCK,
          reason: `${notPickedUpCount} repas non récupérés ce mois`,
          startDate: now,
          endDate,
          active: true,
        },
      });

      // Quota mensuel réduit pour le mois suivant (1 repas non récupéré maximum)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonthEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);

      await prisma.sanction.create({
        data: {
          userId,
          type: SanctionType.QUOTA_REDUCTION,
          reason: 'Quota mensuel réduit suite à 2 repas non récupérés',
          startDate: nextMonth,
          endDate: nextMonthEnd,
          quotaReduction: 1, // Réduit à 1 repas non récupéré maximum
          active: true,
        },
      });

      // Appliquer impact sur la note (coefficient négatif plus important)
      await this.applyRatingPenalty(userId, 0.2); // -20% sur la note

      // Créer message obligatoire
      const messageTitle = 'Sanction sévère : 2 repas non récupérés';
      const messageContent = `Vous avez signalé ${notPickedUpCount} repas non récupérés ce mois. Ce comportement est inacceptable et nuit gravement à la communauté.

Sanctions appliquées :
- Blocage immédiat des réservations pendant 2 semaines (jusqu'au ${endDate.toLocaleDateString('fr-FR')})
- Quota mensuel réduit à 1 repas non récupéré maximum pour le mois prochain
- Impact sur votre note globale

Cette sanction vise à sanctionner le manque de respect et à limiter le gaspillage alimentaire.`;

      await notificationService.createNotification(
        userId,
        NotificationType.SYSTEM_MESSAGE,
        messageTitle,
        messageContent,
        '/dashboard'
      );

      // Envoyer email
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, firstName: true },
      });

      if (user) {
        await emailService.sendVerificationEmail(
          user.email,
          `SOLID'EAT - Sanction sévère appliquée`
        ).catch(() => {
          // Erreur silencieuse
        });
      }

      // Notification via l'application
      await notificationService.sendNotification(
        userId,
        NotificationType.SANCTION_APPLIED,
        'Sanction sévère appliquée',
        'Un message important vous attend dans votre espace abonné',
        '/dashboard',
        false
      );

      return {
        applied: true,
        sanctionId: reservationBlock.id,
        message: 'Sanctions sévères appliquées : blocage réservations + quota réduit',
      };
    }

    return {
      applied: false,
      message: 'Aucune sanction nécessaire',
    };
  }

  /**
   * Applique un coefficient négatif sur la note globale
   */
  private async applyRatingPenalty(userId: string, penalty: number): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { globalRating: true },
    });

    if (!user) {
      return;
    }

    // Appliquer le coefficient (réduire la note)
    const newRating = Math.max(0, user.globalRating * (1 - penalty));

    await prisma.user.update({
      where: { id: userId },
      data: {
        globalRating: newRating,
      },
    });
  }

  /**
   * Vérifie si un utilisateur a une sanction active qui bloque les réservations
   */
  async isReservationBlocked(userId: string): Promise<boolean> {
    const now = new Date();
    const activeBlock = await prisma.sanction.findFirst({
      where: {
        userId,
        type: SanctionType.RESERVATION_BLOCK,
        active: true,
        startDate: {
          lte: now,
        },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
    });

    return !!activeBlock;
  }

  /**
   * Vérifie si un utilisateur a une sanction active qui bloque les annulations
   */
  async isCancellationBlocked(userId: string): Promise<boolean> {
    const now = new Date();
    const activeBlock = await prisma.sanction.findFirst({
      where: {
        userId,
        type: SanctionType.CANCELLATION_BLOCK,
        active: true,
        startDate: {
          lte: now,
        },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
    });

    return !!activeBlock;
  }

  /**
   * Récupère le quota réduit actuel (si sanction active)
   */
  async getReducedQuota(userId: string): Promise<{ cancellations?: number; notPickedUp?: number } | null> {
    const now = new Date();
    const activeReduction = await prisma.sanction.findFirst({
      where: {
        userId,
        type: SanctionType.QUOTA_REDUCTION,
        active: true,
        startDate: {
          lte: now,
        },
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activeReduction) {
      return null;
    }

    // Déterminer le type de quota réduit selon la raison
    if (activeReduction.reason.includes('annulations')) {
      return {
        cancellations: activeReduction.quotaReduction || 2,
      };
    }

    if (activeReduction.reason.includes('non récupérés')) {
      return {
        notPickedUp: activeReduction.quotaReduction || 1,
      };
    }

    return {
      cancellations: activeReduction.quotaReduction || 2,
    };
  }

  /**
   * Désactive les sanctions expirées
   */
  async deactivateExpiredSanctions(): Promise<void> {
    const now = new Date();
    await prisma.sanction.updateMany({
      where: {
        active: true,
        endDate: {
          lt: now,
        },
      },
      data: {
        active: false,
      },
    });
  }
}

export const sanctionService = new SanctionService();
