import api from './api';
import { RegisterDto, LoginDto } from '../types/auth';

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      username: string;
      emailVerified: boolean;
      phoneVerified: boolean;
    };
    token: string;
  };
  error?: string;
  message?: string;
}

export interface RegisterResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      username: string;
      emailVerified: boolean;
      phoneVerified: boolean;
    };
    phoneCode?: string; // Seulement en développement
  };
  error?: string;
  message?: string;
}

export const authService = {
  /**
   * Inscription
   */
  async register(data: RegisterDto): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Vérification email
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },

  /**
   * Vérification téléphone
   */
  async verifyPhone(userId: string, code: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.post('/auth/verify-phone', { userId, code });
    return response.data;
  },

  /**
   * Connexion
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    if (response.data.success && response.data.data?.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    return response.data;
  },

  /**
   * Déconnexion
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },

  /**
   * Renvoyer email de vérification
   */
  async resendVerificationEmail(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await api.post('/auth/resend-verification-email', { email });
    return response.data;
  },

  /**
   * Renvoyer SMS de vérification
   */
  async resendVerificationSMS(userId: string): Promise<{ success: boolean; message?: string; code?: string; error?: string }> {
    const response = await api.post('/auth/resend-verification-sms', { userId });
    return response.data;
  },
};
