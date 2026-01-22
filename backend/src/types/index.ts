// Types TypeScript partagés pour le backend

export interface JwtPayload {
  userId: string;
  email: string;
  subscriptionType: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
