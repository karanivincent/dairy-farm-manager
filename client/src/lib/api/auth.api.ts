import { apiClient } from './client';
import type { LoginCredentials, RegisterData, User } from '../../store/auth.store';

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface ResetPasswordData {
  email: string;
}

export interface ResetPasswordConfirmData {
  token: string;
  password: string;
}

export const authApi = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Attempting login with:', { emailOrUsername: credentials.emailOrUsername });
      console.log('API base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1');
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      return response;
    } catch (error) {
      console.error('Login error details:', error);
      throw error;
    }
  },

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Attempting registration with:', { ...data, password: '[REDACTED]' });
      console.log('API base URL:', import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1');
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      return response;
    } catch (error) {
      console.error('Registration error details:', error);
      throw error;
    }
  },

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    });
  },

  // Get current user profile
  async getProfile(): Promise<User> {
    return apiClient.get<User>('/auth/me');
  },

  // Request password reset
  async forgotPassword(data: ResetPasswordData): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/forgot-password', data);
  },

  // Reset password with token
  async resetPassword(data: ResetPasswordConfirmData): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  },

  // Logout (invalidate tokens)
  async logout(): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>('/auth/logout');
  },
};