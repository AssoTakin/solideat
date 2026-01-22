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
    },
    meal: {
      findMany: jest.fn(),
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

// Mock GeolocationService
jest.mock('../../src/services/geolocation.service', () => ({
  geolocationService: {
    calculateDistance: jest.fn((lat1, _lon1, lat2, _lon2) => {
      // Distance approximative entre Paris et Lyon
      if (lat1 === 48.8566 && lat2 === 45.764) return 392;
      return 5; // Distance par défaut
    }),
    filterByRadius: jest.fn((meals, _userLat, _userLon, _maxDistance) => meals),
  },
}));

describe('Meal Filters API Integration Tests (US-042)', () => {
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
      latitude: 48.8566,
      longitude: 2.3522,
    };

    authToken = jwt.sign({ userId: mockUser.id }, process.env.JWT_SECRET || 'test-secret', {
      expiresIn: '1h',
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
  });

  describe('GET /api/meals avec filtres', () => {
    const mockMeals = [
      {
        id: 'meal-1',
        name: 'Repas test 1',
        photo: 'photo1.jpg',
        cookId: 'cook-1',
        cook: {
          id: 'cook-1',
          username: 'cook1',
          globalRating: 4.5,
          addressCity: 'Paris',
        },
        serviceDate: new Date(),
        pickupTimeStart: new Date(),
        pickupTimeEnd: new Date(),
        portions: 2,
        status: 'AVAILABLE',
        distance: 5.2,
      },
      {
        id: 'meal-2',
        name: 'Repas test 2',
        photo: 'photo2.jpg',
        cookId: 'cook-2',
        cook: {
          id: 'cook-2',
          username: 'cook2',
          globalRating: 4.8,
          addressCity: 'Paris',
        },
        serviceDate: new Date(),
        pickupTimeStart: new Date(),
        pickupTimeEnd: new Date(),
        portions: 4,
        status: 'AVAILABLE',
        distance: 3.1,
      },
    ];

    it('devrait filtrer par distance maximale', async () => {
      (prisma.meal.findMany as jest.Mock).mockResolvedValue(mockMeals);
      (prisma.meal.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/meals?maxDistance=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.meals).toBeDefined();
    });

    it('devrait filtrer par date', async () => {
      const targetDate = new Date().toISOString().split('T')[0];
      (prisma.meal.findMany as jest.Mock).mockResolvedValue(mockMeals);
      (prisma.meal.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get(`/api/meals?date=${targetDate}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('devrait filtrer par nombre de parts', async () => {
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([mockMeals[0]]);
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/meals?portions=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('devrait trier par distance', async () => {
      (prisma.meal.findMany as jest.Mock).mockResolvedValue(mockMeals);
      (prisma.meal.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/meals?sortBy=distance&sortOrder=asc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('devrait trier par note', async () => {
      (prisma.meal.findMany as jest.Mock).mockResolvedValue(mockMeals);
      (prisma.meal.count as jest.Mock).mockResolvedValue(2);

      const response = await request(app)
        .get('/api/meals?sortBy=rating&sortOrder=desc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('devrait appliquer les filtres avancés pour un utilisateur premium', async () => {
      const premiumUser = {
        ...mockUser,
        subscriptionType: 'PREMIUM_MONTHLY',
      };
      const premiumToken = jwt.sign(
        { userId: premiumUser.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(premiumUser);
      (prisma.meal.findMany as jest.Mock).mockResolvedValue([mockMeals[1]]);
      (prisma.meal.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/meals?minRating=4.5')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('devrait permettre les filtres avancés même sans être premium (le backend les applique mais ne bloque pas)', async () => {
      (prisma.meal.findMany as jest.Mock).mockResolvedValue(mockMeals);
      (prisma.meal.count as jest.Mock).mockResolvedValue(2);

      // Note: Le backend n'empêche pas l'utilisation des filtres avancés pour les utilisateurs gratuits
      // Il les applique simplement. La restriction est plutôt côté frontend.
      const response = await request(app)
        .get('/api/meals?minRating=4.5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
