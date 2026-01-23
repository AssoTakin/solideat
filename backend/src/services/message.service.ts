import { MealStatus } from '@prisma/client';
import prisma from '../config/database';

export class MessageService {
  /**
   * Détecte si un message contient un numéro de téléphone
   */
  detectPhoneNumber(content: string): boolean {
    // Patterns pour détecter les numéros français
    const phonePatterns = [
      // Format standard : 06 12 34 56 78, 07 12 34 56 78 (avec espaces - au moins un espace)
      /0[67]\s+\d{2}\s+\d{2}\s+\d{2}\s+\d{2}\s+\d{2}/,
      // Format avec tirets : 06-12-34-56-78 ou 07-12-34-56-78 (4 groupes de 2 chiffres après 0[67])
      /0[67]-\d{2}-\d{2}-\d{2}-\d{2}/,
      // Format compact : 0612345678, 0712345678 (10 chiffres commençant par 06 ou 07)
      /0[67]\d{8}/,
      // Format international : +33 6 12 34 56 78 ou +33612345678
      /\+33\s*[67]\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{2}/,
      // Format avec points : 06.12.34.56.78 (4 groupes de 2 chiffres après 0[67])
      /0[67]\.\d{2}\.\d{2}\.\d{2}\.\d{2}/,
      // Numéros en toutes lettres (basique)
      /(zéro|zero)\s*(six|sept|huit|neuf)\s*(un|deux|trois|quatre|cinq|six|sept|huit|neuf|zéro|zero)/i,
    ];

    return phonePatterns.some((pattern) => pattern.test(content));
  }

  /**
   * Filtre le contenu d'un message
   */
  filterContent(content: string): { valid: boolean; error?: string } {
    // Vérifier la longueur
    if (content.length > 1000) {
      return {
        valid: false,
        error: 'Le message ne peut pas dépasser 1000 caractères',
      };
    }

    // Détecter les numéros de téléphone
    if (this.detectPhoneNumber(content)) {
      return {
        valid: false,
        error: 'L\'échange de numéros de téléphone n\'est pas autorisé dans la messagerie. Le numéro du cuisinier est visible sur la fiche repas si vous avez réservé.',
      };
    }

    return { valid: true };
  }

  /**
   * Envoie un message
   */
  async sendMessage(senderId: string, mealId: string, content: string): Promise<any> {
    // Vérifier que le repas existe
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        cook: {
          select: {
            id: true,
            email: true,
          },
        },
        reservation: {
          include: {
            user: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!meal) {
      throw new Error('Repas non trouvé');
    }

    // Vérifier que le repas n'est pas SERVED pour nouveaux messages
    if (meal.status === MealStatus.SERVED) {
      throw new Error('La messagerie n\'est plus disponible pour ce repas (déjà servi)');
    }

    // Déterminer le destinataire
    let receiverId: string;
    if (senderId === meal.cookId) {
      // Le cuisinier envoie un message
      if (!meal.reservation) {
        throw new Error('Aucune réservation pour ce repas');
      }
      receiverId = meal.reservation.userId;
    } else {
      // Un membre envoie un message au cuisinier
      receiverId = meal.cookId;
    }

    // Filtrer le contenu
    const filterResult = this.filterContent(content);
    if (!filterResult.valid) {
      throw new Error(filterResult.error || 'Contenu invalide');
    }

    // Créer le message
    const message = await prisma.message.create({
      data: {
        mealId,
        senderId,
        receiverId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          },
        },
        meal: {
          select: {
            id: true,
            name: true,
            photo: true,
          },
        },
      },
    });

    // Envoyer notification (en arrière-plan)
    // TODO: Implémenter NotificationService

    return message;
  }

  /**
   * Récupère les conversations d'un utilisateur
   */
  async getConversations(userId: string): Promise<any[]> {
    // Récupérer tous les messages où l'utilisateur est sender ou receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          },
        },
        meal: {
          select: {
            id: true,
            name: true,
            photo: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Grouper par mealId
    const conversationsMap = new Map<string, any>();

    messages.forEach((message) => {
      const mealId = message.mealId;
      if (!conversationsMap.has(mealId)) {
        const otherUser = message.senderId === userId ? message.receiver : message.sender;
        conversationsMap.set(mealId, {
          mealId,
          meal: message.meal,
          otherUser,
          lastMessage: message,
          unreadCount: 0,
          messages: [],
        });
      }

      const conversation = conversationsMap.get(mealId)!;
      conversation.messages.push(message);
      if (!message.read && message.receiverId === userId) {
        conversation.unreadCount++;
      }
    });

    // Trier par date du dernier message
    const conversations = Array.from(conversationsMap.values());
    conversations.sort((a, b) => {
      const dateA = new Date(a.lastMessage.createdAt).getTime();
      const dateB = new Date(b.lastMessage.createdAt).getTime();
      return dateB - dateA;
    });

    return conversations;
  }

  /**
   * Récupère les messages d'une conversation
   */
  async getConversationMessages(mealId: string, userId: string): Promise<any[]> {
    // Vérifier que l'utilisateur fait partie de la conversation
    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        cook: true,
        reservation: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!meal) {
      throw new Error('Repas non trouvé');
    }

    // Vérifier que l'utilisateur est le cuisinier ou celui qui a réservé
    const isCook = meal.cookId === userId;
    const isReserver = meal.reservation?.userId === userId;

    if (!isCook && !isReserver) {
      throw new Error('Vous n\'êtes pas autorisé à voir cette conversation');
    }

    // Récupérer les messages
    const messages = await prisma.message.findMany({
      where: { mealId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          },
        },
        receiver: {
          select: {
            id: true,
            username: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Marquer les messages comme lus
    await prisma.message.updateMany({
      where: {
        mealId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return messages;
  }

  /**
   * Marque un message comme lu
   */
  async markAsRead(messageId: string, userId: string): Promise<void> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message non trouvé');
    }

    if (message.receiverId !== userId) {
      throw new Error('Vous n\'êtes pas autorisé à marquer ce message comme lu');
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Récupère le nombre de messages non lus
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.message.count({
      where: {
        receiverId: userId,
        read: false,
      },
    });
  }
}

export const messageService = new MessageService();
