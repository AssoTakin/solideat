import prisma from '../config/database';
import { notificationService } from './notification.service';
import { emailService } from './email.service';

export class BonusDonorService {
  /**
   * Calcule le nombre de bonus donateurs à attribuer
   * Formule : ((Écart - 5) / 5) arrondi à l'entier inférieur + 1
   * où Écart = Repas servis - Repas reçus
   */
  calculateBonusCount(mealsServed: number, mealsReceived: number): number {
    const gap = mealsServed - mealsReceived;
    if (gap < 5) {
      return 0;
    }
    return Math.floor((gap - 5) / 5) + 1;
  }

  /**
   * Vérifie et acquiert automatiquement des bonus donateurs (US-027)
   * Appelé après chaque repas servi ou reçu
   */
  async checkAndAcquireBonus(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        mealsServed: true,
        mealsReceived: true,
      },
    });

    if (!user) {
      return;
    }

    const gap = user.mealsServed - user.mealsReceived;
    if (gap < 5) {
      return; // Pas d'éligibilité
    }

    // Calculer le nombre de bonus à attribuer
    const bonusCount = this.calculateBonusCount(user.mealsServed, user.mealsReceived);

    // Compter les bonus déjà acquis et non utilisés
    const existingBonuses = await prisma.bonusDonor.count({
      where: {
        userId,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // Calculer combien de nouveaux bonus sont nécessaires
    const neededBonuses = bonusCount - existingBonuses;

    if (neededBonuses <= 0) {
      return; // L'utilisateur a déjà tous les bonus auxquels il a droit
    }

    // Créer les nouveaux bonus (validité : 2 semaines)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    for (let i = 0; i < neededBonuses; i++) {
      await prisma.bonusDonor.create({
        data: {
          userId,
          expiresAt,
        },
      });
    }

    // Envoyer une notification
    await notificationService.createNotification(
      userId,
      'BONUS_DONOR_RECEIVED',
      'Nouveau bonus donateur !',
      `Vous avez reçu ${neededBonuses} bonus donateur${neededBonuses > 1 ? 's' : ''} pour votre contribution. Valable 2 semaines.`,
      '/dashboard'
    );

    // Envoyer un email (en arrière-plan)
    const userEmail = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    if (userEmail) {
      emailService
        .sendBonusDonorEmail(userEmail.email, neededBonuses)
        .catch(() => {
          // Erreur silencieuse
        });
    }
  }

  /**
   * Récupère les bonus donateurs disponibles pour un utilisateur
   */
  async getAvailableBonuses(userId: string): Promise<any[]> {
    return await prisma.bonusDonor.findMany({
      where: {
        userId,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        expiresAt: 'asc',
      },
    });
  }

  /**
   * Utilise un bonus donateur lors d'une réservation (US-028)
   * Vérifie le quota hebdomadaire (2 max)
   */
  async useBonusDonor(userId: string, bonusDonorId: string): Promise<void> {
    // Vérifier que le bonus existe et appartient à l'utilisateur
    const bonus = await prisma.bonusDonor.findFirst({
      where: {
        id: bonusDonorId,
        userId,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!bonus) {
      throw new Error('Bonus donateur non disponible ou expiré');
    }

    // Vérifier le quota hebdomadaire (2 bonus max par semaine)
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Dimanche
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyBonusUsage = await prisma.reservation.count({
      where: {
        userId,
        usedBonusDonor: true,
        reservedAt: {
          gte: startOfWeek,
        },
      },
    });

    if (weeklyBonusUsage >= 2) {
      throw new Error('Quota hebdomadaire de bonus donateurs atteint (2 maximum)');
    }

    // Marquer le bonus comme utilisé
    await prisma.bonusDonor.update({
      where: { id: bonusDonorId },
      data: { usedAt: new Date() },
    });
  }

  /**
   * Transfère un bonus donateur à un autre membre (US-029) - Premium uniquement
   */
  async transferBonus(userId: string, bonusDonorId: string, recipientUsername: string): Promise<void> {
    // Vérifier que l'utilisateur est premium
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionType: true, username: true },
    });

    if (!user || user.subscriptionType === 'FREE') {
      throw new Error('Cette fonctionnalité est réservée aux membres premium');
    }

    // Vérifier que le bonus existe et appartient à l'utilisateur
    const bonus = await prisma.bonusDonor.findFirst({
      where: {
        id: bonusDonorId,
        userId,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!bonus) {
      throw new Error('Bonus donateur non disponible ou expiré');
    }

    // Trouver le bénéficiaire
    const recipient = await prisma.user.findUnique({
      where: { username: recipientUsername },
      select: { id: true, email: true, username: true },
    });

    if (!recipient) {
      throw new Error('Utilisateur bénéficiaire non trouvé');
    }

    if (recipient.id === userId) {
      throw new Error('Vous ne pouvez pas vous transférer un bonus à vous-même');
    }

    // Créer un nouveau bonus pour le bénéficiaire (validité : 2 semaines à partir du transfert)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await prisma.bonusDonor.create({
      data: {
        userId: recipient.id,
        expiresAt,
        transferredToId: recipient.id,
      },
    });

    // Marquer le bonus original comme transféré
    await prisma.bonusDonor.update({
      where: { id: bonusDonorId },
      data: { transferredToId: recipient.id },
    });

    // Notifier le bénéficiaire
    await notificationService.createNotification(
      recipient.id,
      'BONUS_DONOR_RECEIVED',
      'Bonus donateur reçu !',
      `Vous avez reçu un bonus donateur de ${user.username || 'Un membre'}. Valable 2 semaines.`,
      '/dashboard'
    );

    // Envoyer un email au bénéficiaire
    emailService
      .sendBonusDonorReceivedEmail(recipient.email, user.username || 'Un membre')
      .catch(() => {
        // Erreur silencieuse
      });
  }

  /**
   * Vérifie les bonus expirant bientôt et envoie des notifications (US-051)
   * Appelé par le job quotidien
   */
  async checkExpiringBonuses(): Promise<void> {
    const now = new Date();
    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);
    const in1Day = new Date(now);
    in1Day.setDate(in1Day.getDate() + 1);

    // Bonus expirant dans 3 jours (mais pas encore notifié)
    const bonusesExpiringIn3Days = await prisma.bonusDonor.findMany({
      where: {
        usedAt: null,
        expiresAt: {
          gte: in1Day,
          lte: in3Days,
        },
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

    for (const bonus of bonusesExpiringIn3Days) {
      const daysUntilExpiration = Math.ceil(
        (bonus.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Envoyer une notification
      await notificationService.createNotification(
        bonus.userId,
        'BONUS_DONOR_EXPIRING',
        'Bonus donateur expirant bientôt',
        `Votre bonus donateur expire dans ${daysUntilExpiration} jour${daysUntilExpiration > 1 ? 's' : ''}. Utilisez-le rapidement !`,
        '/dashboard'
      );
    }

    // Bonus expirant demain
    const bonusesExpiringTomorrow = await prisma.bonusDonor.findMany({
      where: {
        usedAt: null,
        expiresAt: {
          gte: now,
          lte: in1Day,
        },
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

    for (const bonus of bonusesExpiringTomorrow) {
      // Envoyer une notification urgente
      await notificationService.createNotification(
        bonus.userId,
        'BONUS_DONOR_EXPIRING',
        'Bonus donateur expirant demain !',
        'Votre bonus donateur expire demain. Utilisez-le rapidement !',
        '/dashboard'
      );

      // Envoyer un email
      emailService
        .sendBonusDonorExpiringEmail(bonus.user.email, 1)
        .catch(() => {
          // Erreur silencieuse
        });
    }

    // Supprimer les bonus expirés
    await prisma.bonusDonor.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
        usedAt: null,
      },
    });
  }
}

export const bonusDonorService = new BonusDonorService();
