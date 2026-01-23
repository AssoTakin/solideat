import { AuthService } from '../auth.service';
import prisma from '../../config/database';
import jwt from 'jsonwebtoken';

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
jest.mock('../email.service', () => ({
  emailService: {
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('AuthService - Sprint 10 (US-006)', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
    jest.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
  });

  describe('forgotPassword', () => {
    it('devrait envoyer un email de réinitialisation si l\'utilisateur existe', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authService.forgotPassword('test@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('ne devrait pas révéler si l\'email existe ou non', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Ne devrait pas lever d'erreur même si l'utilisateur n'existe pas
      await expect(authService.forgotPassword('nonexistent@example.com')).resolves.not.toThrow();
    });
  });

  describe('resetPassword', () => {
    it('devrait réinitialiser le mot de passe avec un token valide', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const token = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', type: 'password-reset' },
        'test-secret',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.resetPassword(token, 'newPassword123');

      expect(result).toBe(true);
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          passwordHash: expect.any(String),
        }),
      });
    });

    it('devrait lever une erreur avec un token invalide', async () => {
      await expect(authService.resetPassword('invalid-token', 'newPassword123')).rejects.toThrow(
        'Token de réinitialisation invalide ou expiré'
      );
    });

    it('devrait lever une erreur avec un token expiré', async () => {
      const expiredToken = jwt.sign(
        { userId: 'user-123', email: 'test@example.com', type: 'password-reset' },
        'test-secret',
        { expiresIn: '-1h' }
      );

      await expect(authService.resetPassword(expiredToken, 'newPassword123')).rejects.toThrow();
    });

    it('devrait lever une erreur si l\'utilisateur n\'existe pas', async () => {
      const token = jwt.sign(
        { userId: 'nonexistent', email: 'test@example.com', type: 'password-reset' },
        'test-secret',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.resetPassword(token, 'newPassword123')).rejects.toThrow();
    });
  });
});
