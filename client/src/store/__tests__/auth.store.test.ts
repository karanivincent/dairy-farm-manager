import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../auth.store';

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout();
  });

  it('should initialize with default state', () => {
    const store = useAuthStore.getState();
    
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.refreshToken).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.isLoading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('should set user and authentication state', () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: 'owner' as const,
      isActive: true,
    };

    useAuthStore.getState().setUser(mockUser);
    
    const store = useAuthStore.getState();
    expect(store.user).toEqual(mockUser);
    expect(store.isAuthenticated).toBe(true);
    expect(store.error).toBeNull();
  });

  it('should set tokens', () => {
    const mockToken = 'mock-jwt-token';
    const mockRefreshToken = 'mock-refresh-token';

    useAuthStore.getState().setTokens(mockToken, mockRefreshToken);
    
    const store = useAuthStore.getState();
    expect(store.token).toBe(mockToken);
    expect(store.refreshToken).toBe(mockRefreshToken);
    expect(store.isAuthenticated).toBe(true);
  });

  it('should set loading state', () => {
    useAuthStore.getState().setLoading(true);
    expect(useAuthStore.getState().isLoading).toBe(true);

    useAuthStore.getState().setLoading(false);
    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  it('should set error state', () => {
    const errorMessage = 'Login failed';
    
    useAuthStore.getState().setError(errorMessage);
    
    const store = useAuthStore.getState();
    expect(store.error).toBe(errorMessage);
    expect(store.isLoading).toBe(false);
  });

  it('should clear error', () => {
    useAuthStore.getState().setError('Some error');
    useAuthStore.getState().clearError();
    
    expect(useAuthStore.getState().error).toBeNull();
  });

  it('should logout and reset state', () => {
    // Set up authenticated state
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      role: 'owner' as const,
      isActive: true,
    };
    
    useAuthStore.getState().setUser(mockUser);
    useAuthStore.getState().setTokens('token', 'refresh-token');
    useAuthStore.getState().setError('Some error');
    
    // Logout
    useAuthStore.getState().logout();
    
    // Verify state is reset
    const store = useAuthStore.getState();
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(store.refreshToken).toBeNull();
    expect(store.isAuthenticated).toBe(false);
    expect(store.error).toBeNull();
    expect(store.isLoading).toBe(false);
  });
});