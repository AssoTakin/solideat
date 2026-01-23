import { MessageService } from '../message.service';
import { MealStatus } from '@prisma/client';
import prisma from '../../config/database';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    meal: {
      findUnique: jest.fn(),
    },
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    messageService = new MessageService();
    jest.clearAllMocks();
  });

  describe('detectPhoneNumber', () => {
    it('devrait détecter un numéro au format standard', () => {
      // Format compact (le plus courant)
      expect(messageService.detectPhoneNumber('Contact: 0612345678')).toBe(true);
      expect(messageService.detectPhoneNumber('Mon numéro est 0712345678')).toBe(true);
      // Format avec tirets (vérifier que le format exact correspond à la regex)
      // La regex attend: 0[67]-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}
      // Format: 07-12-34-56-78 (10 chiffres avec tirets)
      expect(messageService.detectPhoneNumber('Appelez-moi au 07-12-34-56-78')).toBe(true);
      // Format avec points
      expect(messageService.detectPhoneNumber('Téléphone: 06.12.34.56.78')).toBe(true);
    });

    it('ne devrait pas détecter de numéro dans un texte normal', () => {
      expect(messageService.detectPhoneNumber('Bonjour, comment allez-vous ?')).toBe(false);
      expect(messageService.detectPhoneNumber('Le repas est prêt à 14h')).toBe(false);
    });
  });

  describe('filterContent', () => {
    it('devrait accepter un message valide', () => {
      const result = messageService.filterContent('Bonjour, le repas est-il encore disponible ?');
      expect(result.valid).toBe(true);
    });

    it('devrait rejeter un message avec numéro de téléphone', () => {
      const result = messageService.filterContent('Appelez-moi au 0612345678');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('numéros de téléphone');
    });

    it('devrait rejeter un message trop long', () => {
      const longMessage = 'a'.repeat(1001);
      const result = messageService.filterContent(longMessage);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('1000 caractères');
    });
  });

  describe('sendMessage', () => {
    const mockMeal = {
      id: 'meal-123',
      status: MealStatus.RESERVED,
      cookId: 'cook-123',
      cook: {
        id: 'cook-123',
        email: 'cook@example.com',
      },
      reservation: {
        userId: 'user-123',
        user: {
          id: 'user-123',
        },
      },
    };

    it('devrait envoyer un message avec succès', async () => {
      (prisma.meal.findUnique as jest.Mock).mockResolvedValue(mockMeal);
      (prisma.message.create as jest.Mock).mockResolvedValue({
        id: 'message-123',
        content: 'Bonjour',
        mealId: 'meal-123',
        senderId: 'user-123',
        receiverId: 'cook-123',
      });

      const result = await messageService.sendMessage('user-123', 'meal-123', 'Bonjour');

      expect(result).toBeDefined();
      expect(prisma.message.create).toHaveBeenCalled();
    });

    it('devrait échouer si le repas est SERVED', async () => {
      (prisma.meal.findUnique as jest.Mock).mockResolvedValue({
        ...mockMeal,
        status: MealStatus.SERVED,
      });

      await expect(messageService.sendMessage('user-123', 'meal-123', 'Bonjour')).rejects.toThrow(
        'déjà servi'
      );
    });

    it('devrait échouer si le message contient un numéro de téléphone', async () => {
      (prisma.meal.findUnique as jest.Mock).mockResolvedValue(mockMeal);

      await expect(
        messageService.sendMessage('user-123', 'meal-123', 'Appelez-moi au 0612345678')
      ).rejects.toThrow('numéros de téléphone');
    });
  });
});
