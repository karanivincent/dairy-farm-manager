import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from '../auth.api';

// Mock the API client
vi.mock('../client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

import { apiClient } from '../client';

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call login endpoint', async () => {
    const mockResponse = {
      user: { id: 1, email: 'test@example.com' },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
    };
    
    (apiClient.post as any).mockResolvedValue(mockResponse);

    const credentials = { email: 'test@example.com', password: 'password' };
    const result = await authApi.login(credentials);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
    expect(result).toEqual(mockResponse);
  });

  it('should call register endpoint', async () => {
    const mockResponse = {
      user: { id: 1, email: 'test@example.com' },
      token: 'mock-token',
      refreshToken: 'mock-refresh-token',
    };
    
    (apiClient.post as any).mockResolvedValue(mockResponse);

    const registerData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
    };
    const result = await authApi.register(registerData);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
    expect(result).toEqual(mockResponse);
  });

  it('should call get profile endpoint', async () => {
    const mockUser = { id: 1, email: 'test@example.com' };
    
    (apiClient.get as any).mockResolvedValue(mockUser);

    const result = await authApi.getProfile();

    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockUser);
  });

  it('should call refresh token endpoint', async () => {
    const mockResponse = {
      token: 'new-token',
      refreshToken: 'new-refresh-token',
    };
    
    (apiClient.post as any).mockResolvedValue(mockResponse);

    const result = await authApi.refreshToken('old-refresh-token');

    expect(apiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'old-refresh-token',
    });
    expect(result).toEqual(mockResponse);
  });
});