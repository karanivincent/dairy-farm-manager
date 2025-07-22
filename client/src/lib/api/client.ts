import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { useAuthStore } from '../../store/auth.store';
import { useUIStore } from '../../store/ui.store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for handling auth errors and offline scenarios
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        // Update online status if request succeeded
        const uiStore = useUIStore.getState();
        if (!uiStore.isOnline) {
          uiStore.setOnlineStatus(true);
        }
        return response;
      },
      async (error) => {
        const { response, code } = error;

        // Handle network errors (offline scenario)
        if (code === 'ECONNABORTED' || code === 'ERR_NETWORK') {
          useUIStore.getState().setOnlineStatus(false);
          throw new Error('Network error - please check your connection');
        }

        // Handle 401 errors (unauthorized)
        if (response?.status === 401) {
          const authStore = useAuthStore.getState();
          const refreshToken = authStore.refreshToken;

          if (refreshToken && !error.config._retry) {
            error.config._retry = true;

            try {
              // Attempt to refresh token
              const refreshResponse = await this.client.post('/auth/refresh', {
                refreshToken,
              });

              const { token: newToken, refreshToken: newRefreshToken } = refreshResponse.data;
              
              // Update stored tokens
              authStore.setTokens(newToken, newRefreshToken);

              // Retry original request with new token
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return this.client.request(error.config);
            } catch (refreshError) {
              // Refresh failed, logout user
              authStore.logout();
              throw new Error('Session expired - please login again');
            }
          } else {
            // No refresh token or refresh already failed
            useAuthStore.getState().logout();
            throw new Error('Unauthorized - please login again');
          }
        }

        // Handle other HTTP errors
        if (response?.status >= 500) {
          throw new Error('Server error - please try again later');
        }

        if (response?.status >= 400) {
          const message = response.data?.message || 'Client error occurred';
          throw new Error(message);
        }

        throw error;
      }
    );
  }

  // Generic request methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // File upload method
  async uploadFile<T>(url: string, file: File, onUploadProgress?: (progress: number) => void): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(progress);
        }
      },
    };

    const response = await this.client.post<T>(url, formData, config);
    return response.data;
  }
}

export const apiClient = new ApiClient();