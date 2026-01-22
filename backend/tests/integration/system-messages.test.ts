import request from 'supertest';
import app from '../../src/index';
import prisma from '../../src/config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock Prisma
jest.mock('../../src/config/database', () => {
  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    notification: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    $disconnect: jest.fn(),
  };
  return {
    __esModule: true,
    default: mockPrisma,
  };
});

// Mock services
jest.mock('../../src/services/email.service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../src/services/notification.service', () => ({
  notificationService: {
    createNotification: jest.fn(),
    sendNotification: jest.fn(),
  },
}));

describe('System Messages API Integration Tests (US-044)', () => {
  let authToken: string;
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

    authToken = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/notifications/system', () => {
    it('devrait récupérer les messages système', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          userId: mockUser.id,
          type: 'SYSTEM_MESSAGE',
          title: 'Message important',
          message: 'Contenu du message',
          read: false,
          createdAt: new Date(),
        },
        {
          id: 'msg-2',
          userId: mockUser.id,
          type: 'SYSTEM_MESSAGE',
          title: 'Message lu',
          message: 'Contenu lu',
          read: true,
          readAt: new Date(),
          createdAt: new Date(),
        },
      ];

      (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const response = await request(app)
        .get('/api/notifications/system')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.unread).toBeDefined();
      expect(response.body.data.read).toBeDefined();
      expect(response.body.data.unreadCount).toBe(1);
    });

    it('devrait échouer sans authentification', async () => {
      const response = await request(app)
        .get('/api/notifications/system')
        .expect(401);

      // Le middleware d'authentification peut retourner une erreur différente
      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/notifications/system/:id/read', () => {
    it('devrait marquer un message système comme lu', async () => {
      const messageId = 'msg-1';
      const mockMessage = {
        id: messageId,
        userId: mockUser.id,
        type: 'SYSTEM_MESSAGE',
        title: 'Message',
        message: 'Contenu',
        read: false,
      };

      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(mockMessage);
      (prisma.notification.update as jest.Mock).mockResolvedValue({
        ...mockMessage,
        read: true,
        readAt: new Date(),
      });

      const response = await request(app)
        .put(`/api/notifications/system/${messageId}/read`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(prisma.notification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: messageId },
          data: expect.objectContaining({
            read: true,
            readAt: expect.any(Date),
          }),
        })
      );
    });

    it('devrait échouer si le message n\'existe pas', async () => {
      (prisma.notification.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/api/notifications/system/non-existent/read')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      // Le controller retourne { success: false } ou { error: ... }
      expect(response.status).toBe(404);
    });
  });
});
