import { UserService } from '../user.service';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock des services externes
jest.mock('../geolocation.service', () => ({
  geolocationService: {
    validateAndGeocodeAddress: jest.fn().mockResolvedValue({
      address: '123 Rue Test, 75001 Paris',
      latitude: 48.8566,
      longitude: 2.3522,
    }),
  },
}));

describe('UserService - Sprint 10 (US-008, US-009)', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
    jest.clearAllMocks();
  });

  describe('updateProfile', () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      description: 'Old description',
      culinaryStyle: 'Old style',
    };

    it('devrait mettre à jour la description', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        description: 'New description',
      });

      const result = await userService.updateProfile('user-123', {
        description: 'New description',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { description: 'New description' },
        select: expect.any(Object),
      });
      expect(result.description).toBe('New description');
    });

    it('devrait mettre à jour l\'orientation culinaire', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        culinaryStyle: 'New style',
      });

      const result = await userService.updateProfile('user-123', {
        culinaryStyle: 'New style',
      });

      expect(result.culinaryStyle).toBe('New style');
    });

    it('devrait mettre à jour la photo de profil', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        profilePhoto: 'https://example.com/photo.jpg',
      });

      const result = await userService.updateProfile('user-123', {
        profilePhoto: 'https://example.com/photo.jpg',
      });

      expect(result.profilePhoto).toBe('https://example.com/photo.jpg');
    });

    it('devrait lever une erreur si la description dépasse 500 caractères', async () => {
      const longDescription = 'a'.repeat(501);

      await expect(
        userService.updateProfile('user-123', {
          description: longDescription,
        })
      ).rejects.toThrow('La description ne peut pas dépasser 500 caractères');
    });

    it('devrait lever une erreur si l\'orientation culinaire dépasse 200 caractères', async () => {
      const longStyle = 'a'.repeat(201);

      await expect(
        userService.updateProfile('user-123', {
          culinaryStyle: longStyle,
        })
      ).rejects.toThrow('L\'orientation culinaire ne peut pas dépasser 200 caractères');
    });
  });

  describe('changePassword', () => {
    let mockUser: any;

    beforeAll(async () => {
      mockUser = {
        id: 'user-123',
        passwordHash: await bcrypt.hash('oldPassword123', 12),
      };
    });

    it('devrait changer le mot de passe avec un ancien mot de passe valide', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      await userService.changePassword('user-123', 'oldPassword123', 'newPassword123');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: { passwordHash: true },
      });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          passwordHash: expect.any(String),
        }),
      });
    });

    it('devrait lever une erreur si l\'ancien mot de passe est incorrect', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        userService.changePassword('user-123', 'wrongPassword', 'newPassword123')
      ).rejects.toThrow('Ancien mot de passe incorrect');
    });

    it('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.changePassword('nonexistent', 'oldPassword123', 'newPassword123')
      ).rejects.toThrow('Utilisateur non trouvé');
    });
  });

  describe('changeAddress', () => {
    const mockUser = {
      id: 'user-123',
      subscriptionType: 'FREE',
      updatedAt: new Date(),
    };

    it('devrait changer l\'adresse et géocoder', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        addressStreet: '123 Rue Test',
        addressZipCode: '75001',
        addressCity: 'Paris',
        latitude: 48.8566,
        longitude: 2.3522,
      });

      const result = await userService.changeAddress('user-123', {
        addressStreet: '123 Rue Test',
        addressZipCode: '75001',
        addressCity: 'Paris',
      });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          addressStreet: '123 Rue Test',
          addressZipCode: '75001',
          addressCity: 'Paris',
          latitude: 48.8566,
          longitude: 2.3522,
        }),
        select: expect.any(Object),
      });
      expect(result.addressStreet).toBe('123 Rue Test');
    });

    it('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(
        userService.changeAddress('nonexistent', {
          addressStreet: '123 Rue Test',
          addressZipCode: '75001',
          addressCity: 'Paris',
        })
      ).rejects.toThrow('Utilisateur non trouvé');
    });
  });

  describe('updatePrivacy', () => {
    it('devrait mettre à jour les paramètres de confidentialité pour un membre premium', async () => {
      const mockPremiumUser = {
        id: 'user-123',
        subscriptionType: 'PREMIUM_MONTHLY',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockPremiumUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockPremiumUser,
        hidePhoneNumber: true,
      });

      const result = await userService.updatePrivacy('user-123', true);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { hidePhoneNumber: true },
        select: expect.any(Object),
      });
      expect(result.hidePhoneNumber).toBe(true);
    });

    it('devrait lever une erreur si l\'utilisateur est gratuit', async () => {
      const mockFreeUser = {
        id: 'user-123',
        subscriptionType: 'FREE',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockFreeUser);

      await expect(userService.updatePrivacy('user-123', true)).rejects.toThrow(
        'Cette fonctionnalité est réservée aux membres premium'
      );
    });

    it('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(userService.updatePrivacy('nonexistent', true)).rejects.toThrow(
        'Utilisateur non trouvé'
      );
    });
  });
});
