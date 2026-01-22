import api from './api';

export interface Reservation {
  id: string;
  mealId: string;
  userId: string;
  usedBonusDonor: boolean;
  bonusDonorId?: string;
  reservedAt: string;
  pickedUpAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  meal: {
    id: string;
    name: string;
    photo: string;
    serviceDate: string;
    pickupTimeStart: string;
    pickupTimeEnd: string;
    pickupAddress: string;
    status: string;
    cook: {
      id: string;
      username: string;
      profilePhoto?: string;
      globalRating: number;
    };
  };
}

export interface CreateReservationDto {
  mealId: string;
  useBonusDonor?: boolean;
}

export interface CancelReservationDto {
  reason: string;
}

export const reservationService = {
  /**
   * Créer une réservation
   */
  async createReservation(data: CreateReservationDto): Promise<{ success: boolean; data?: Reservation; error?: string }> {
    const response = await api.post('/reservations', data);
    return response.data;
  },

  /**
   * Récupérer mes réservations
   */
  async getMyReservations(filters?: { status?: string }): Promise<{ success: boolean; data?: Reservation[]; error?: string }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/reservations?${params.toString()}`);
    return response.data;
  },

  /**
   * Annuler une réservation
   */
  async cancelReservation(id: string, reason: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.delete(`/reservations/${id}`, { data: { reason } });
    return response.data;
  },

  /**
   * Marquer comme récupéré
   */
  async markAsPickedUp(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.put(`/reservations/${id}/pickup`);
    return response.data;
  },

  /**
   * Signaler non récupéré
   */
  async reportNotPickedUp(id: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.post(`/reservations/${id}/report-not-picked-up`);
    return response.data;
  },
};
