import api from './api';
import { USE_MOCK_DATA, mockUsers } from '../data/mockData';


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
    if (USE_MOCK_DATA) {
      return {
        success: true,
        data: mockUsers[0],
      };
    }
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Met à jour le profil
   */
  async updateProfile(data: UpdateProfileDto): Promise<{ success: boolean; data?: any; error?: string }> {
    if (USE_MOCK_DATA) {
      const user = mockUsers[0];
      if (data.description !== undefined) user.description = data.description;
      if (data.culinaryStyle !== undefined) user.culinaryStyle = data.culinaryStyle;
      if (data.profilePhoto !== undefined) user.profilePhoto = data.profilePhoto;
      return {
        success: true,
        data: user,
      };
    }
    const response = await api.put('/users/me', data);
    return response.data;
  },

  /**
   * Change le mot de passe
   */
  async changePassword(data: ChangePasswordDto): Promise<{ success: boolean; message?: string; error?: string }> {
    if (USE_MOCK_DATA) {
      return {
        success: true,
        message: 'Mot de passe modifié avec succès',
      };
    }
    const response = await api.put('/users/me/password', data);
    return response.data;
  },

  /**
   * Change l'adresse
   */
  async changeAddress(data: ChangeAddressDto): Promise<{ success: boolean; data?: any; error?: string }> {
    if (USE_MOCK_DATA) {
      const user = mockUsers[0] as any;
      user.addressStreet = data.addressStreet;
      user.addressZipCode = data.addressZipCode;
      user.addressCity = data.addressCity;
      return {
        success: true,
        data: user,
      };
    }
    const response = await api.put('/users/me/address', data);
    return response.data;
  },

  /**
   * Met à jour les paramètres de confidentialité (Premium)
   */
  async updatePrivacy(
    privacySettings: {
      hidePhoneNumber?: boolean;
      incognitoMode?: boolean;
      blurAddress?: boolean;
      hideActivityHistory?: boolean;
    }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    if (USE_MOCK_DATA) {
      const user = mockUsers[0] as any;
      if (privacySettings.hidePhoneNumber !== undefined) user.hidePhoneNumber = privacySettings.hidePhoneNumber;
      if (privacySettings.incognitoMode !== undefined) user.incognitoMode = privacySettings.incognitoMode;
      if (privacySettings.blurAddress !== undefined) user.blurAddress = privacySettings.blurAddress;
      if (privacySettings.hideActivityHistory !== undefined) user.hideActivityHistory = privacySettings.hideActivityHistory;
      return {
        success: true,
        data: user,
      };
    }
    const response = await api.put('/users/me/privacy', privacySettings);
    return response.data;
  },
};
