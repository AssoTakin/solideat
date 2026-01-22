import { ReservationService } from '../reservation.service';
import { MealStatus } from '@prisma/client';
import prisma from '../../config/database';

// Mock Prisma
jest.mock('../../config/database', () => ({
  __esModule: true,
  default: {
    meal: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    reservation: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

// Mock des services
jest.mock('../quota.service', () => ({
  quotaService: {
    checkWeeklyReservationQuota: jest.fn().mockResolvedValue({ allowed: true, current: 0, limit: 1 }),
    checkWeeklyCancellationQuota: jest.fn().mockResolvedValue({ allowed: true, current: 0, limit: 1 }),
    checkMonthlyCancellationQuota: jest.fn().mockResolvedValue({ allowed: true, current: 0, limit: 4 }),
  },
}));

jest.mock('../email.service', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('ReservationService', () => {
  let reservationService: ReservationService;

  beforeEach(() => {
    reservationService = new ReservationService();
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    const mockMeal = {
      id: 'meal-123',
      name: 'Pasta Carbonara',
      status: MealStatus.AVAILABLE,
      cookId: 'cook-123',
      expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24h
      pickupTimeStart: new Date(Date.now() + 2 * 60 * 60 * 1000), // +2h
      pickupTimeEnd: new Date(Date.now() + 4 * 60 * 60 * 1000), // +4h
      cook: {
        id: 'cook-123',
        email: 'cook@example.com',
        username: 'cook',
      },
      reservation: null,
    };

    it('devrait créer une réservation avec succès', async () => {
      (prisma.meal.findUnique as jest.Mock).mockResolvedValue(mockMeal);
      (prisma.reservation.create as jest.Mock).mockResolvedValue({
        id: 'reservation-123',
        mealId: 'meal-123',
        userId: 'user-123',
        meal: mockMeal,
      });
      (prisma.meal.update as jest.Mock).mockResolvedValue({});
      (prisma.user.update as jest.Mock).mockResolvedValue({});

      const result = await reservationService.createReservation('user-123', 'meal-123');

      expect(result).toBeDefined();
      expect(prisma.reservation.create).toHaveBeenCalled();
      expect(prisma.meal.update).toHaveBeenCalledWith({
        where: { id: 'meal-123' },
        data: { status: MealStatus.RESERVED },
      });
    });

    it('devrait échouer si le repas n\'existe pas', async () => {
      (prisma.meal.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(reservationService.createReservation('user-123', 'meal-123')).rejects.toThrow(
        'Repas non trouvé'
      );
    });

    it('devrait échouer si le repas n\'est pas disponible', async () => {
      (prisma.meal.findUnique as jest.Mock).mockResolvedValue({
        ...mockMeal,
        status: MealStatus.RESERVED,
      });

      await expect(reservationService.createReservation('user-123', 'meal-123')).rejects.toThrow(
        'n\'est plus disponible'
      );
    });

    it('devrait échouer si l\'utilisateur réserve son propre repas', async () => {
      (prisma.meal.findUnique as jest.Mock).mockResolvedValue({
        ...mockMeal,
        cookId: 'user-123',
      });

      await expect(reservationService.createReservation('user-123', 'meal-123')).rejects.toThrow(
        'votre propre repas'
      );
    });
  });

  describe('cancelReservation', () => {
    const mockReservation = {
      id: 'reservation-123',
      userId: 'user-123',
      cancelledAt: null,
      meal: {
        id: 'meal-123',
        name: 'Pasta',
        cookId: 'cook-123',
        pickupTimeStart: new Date(Date.now() + 8 * 60 * 60 * 1000), // +8h (OK pour annulation)
        pickupTimeEnd: new Date(Date.now() + 10 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        cook: {
          id: 'cook-123',
          email: 'cook@example.com',
          username: 'cook',
        },
      },
    };

    it('devrait annuler une réservation avec succès', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue(mockReservation);
      (prisma.reservation.update as jest.Mock).mockResolvedValue({});
      (prisma.meal.update as jest.Mock).mockResolvedValue({});

      await reservationService.cancelReservation('reservation-123', 'user-123', 'Motif test');

      expect(prisma.reservation.update).toHaveBeenCalled();
      expect(prisma.meal.update).toHaveBeenCalled();
    });

    it('devrait échouer si moins de 7h avant récupération', async () => {
      (prisma.reservation.findUnique as jest.Mock).mockResolvedValue({
        ...mockReservation,
        meal: {
          ...mockReservation.meal,
          pickupTimeStart: new Date(Date.now() + 6 * 60 * 60 * 1000), // +6h (trop tard)
        },
      });

      await expect(
        reservationService.cancelReservation('reservation-123', 'user-123', 'Motif')
      ).rejects.toThrow('moins de 7h');
    });
  });
});
