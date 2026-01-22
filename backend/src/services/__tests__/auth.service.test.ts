import { AuthService } from '../auth.service';
import prisma from '../../config/database';
import bcrypt from 'bcrypt';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
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

jest.mock('../email.service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../sms.service', () => ({
  smsService: {
    generateVerificationCode: jest.fn().mockReturnValue('123456'),
    sendVerificationSMS: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockRegisterData = {
      email: 'test@example.com',
      password: 'password123',
      phone: '+33123456789',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      addressStreet: '123 Rue Test',
      addressZipCode: '75001',
      addressCity: 'Paris',
      cguAccepted: true,
      sanitaryCharterAccepted: true,
    };

    it('devrait créer un nouvel utilisateur avec succès', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: mockRegisterData.email,
        username: mockRegisterData.username,
        firstName: mockRegisterData.firstName,
        lastName: mockRegisterData.lastName,
        emailVerified: false,
        phoneVerified: false,
        createdAt: new Date(),
      });

      const result = await authService.register(mockRegisterData);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(mockRegisterData.email);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('devrait échouer si l\'email existe déjà', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'existing-user',
        email: mockRegisterData.email,
      });

      await expect(authService.register(mockRegisterData)).rejects.toThrow(
        'Cet email est déjà utilisé'
      );
    });

    it('devrait échouer si le pseudo existe déjà', async () => {
      (prisma.user.findUnique as jest.Mock)
        .mockResolvedValueOnce(null) // Email n'existe pas
        .mockResolvedValueOnce({ id: 'existing-user', username: mockRegisterData.username }); // Pseudo existe

      await expect(authService.register(mockRegisterData)).rejects.toThrow(
        'Ce pseudo est déjà utilisé'
      );
    });
  });

  describe('login', () => {
    let mockUser: any;

    beforeAll(async () => {
      mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        subscriptionType: 'FREE',
        emailVerified: true,
        phoneVerified: true,
      };
    });

    it('devrait connecter un utilisateur avec des identifiants valides', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login('test@example.com', 'password123');

      expect(result.user).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('devrait échouer avec un email incorrect', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login('wrong@example.com', 'password123')).rejects.toThrow(
        'Email ou mot de passe incorrect'
      );
    });

    it('devrait échouer avec un mot de passe incorrect', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await expect(authService.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Email ou mot de passe incorrect'
      );
    });

    it('devrait échouer si le compte n\'est pas vérifié', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        ...mockUser,
        emailVerified: false,
        phoneVerified: false,
      });

      await expect(authService.login('test@example.com', 'password123')).rejects.toThrow(
        'Votre compte n\'est pas encore vérifié'
      );
    });
  });

  describe('verifyEmail', () => {
    it('devrait vérifier un email avec un token valide', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: false,
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue({
        ...mockUser,
        emailVerified: true,
      });

      // Générer un token valide
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { email: 'test@example.com', type: 'email-verification' },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '24h' }
      );

      const result = await authService.verifyEmail(token);

      expect(result).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        data: { emailVerified: true },
      });
    });
  });

  describe('generateJWT', () => {
    it('devrait générer un token JWT valide', () => {
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        subscriptionType: 'FREE',
      };

      const token = authService.generateJWT(user);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      // Vérifier que le token peut être décodé
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
      expect(decoded.userId).toBe(user.id);
      expect(decoded.email).toBe(user.email);
    });
  });
});
