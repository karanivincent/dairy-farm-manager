import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'manager' | 'worker';
  isActive: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User) => void;
  setTokens: (token: string, refreshToken: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: true,
          error: null 
        }),

      setTokens: (token, refreshToken) => 
        set({ 
          token, 
          refreshToken,
          isAuthenticated: true 
        }),

      setLoading: (isLoading) => 
        set({ isLoading }),

      setError: (error) => 
        set({ error, isLoading: false }),

      logout: () => 
        set({ 
          user: null, 
          token: null, 
          refreshToken: null, 
          isAuthenticated: false,
          error: null,
          isLoading: false 
        }),

      clearError: () => 
        set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);