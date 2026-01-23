import api from './api';

export interface UpdateProfileDto {
  description?: string;
  culinaryStyle?: string;
  profilePhoto?: string;
}

export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export interface ChangeAddressDto {
  addressStreet: string;
  addressZipCode: string;
  addressCity: string;
}

export const userService = {
  /**
   * Récupère le profil de l'utilisateur connecté
   */
  async getMe(): Promise<any> {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Met à jour le profil
   */
  async updateProfile(data: UpdateProfileDto): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  /**
   * Change le mot de passe
   */
  async changePassword(data: ChangePasswordDto): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.put('/users/me/password', data);
    return response.data;
  },

  /**
   * Change l'adresse
   */
  async changeAddress(data: ChangeAddressDto): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await api.put('/users/me/address', data);
    return response.data;
  },

  /**
   * Met à jour les paramètres de confidentialité (Premium)
   */
  async updatePrivacy(hidePhoneNumber: boolean): Promise<{ success: boolean; data?: any; error?: string }> {
    const response = await api.put('/users/me/privacy', { hidePhoneNumber });
    return response.data;
  },
};
