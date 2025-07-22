import { QueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/auth.store';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 401 errors
        if (error?.status === 404 || error?.status === 401) {
          return false;
        }
        // Don't retry more than 3 times
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry on client errors (4xx)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry server errors up to 2 times
        return failureCount < 2;
      },
      onError: (error: any) => {
        // Handle global mutation errors
        if (error?.status === 401) {
          useAuthStore.getState().logout();
        }
        
        // Set global error state or show toast
        console.error('Mutation error:', error);
      },
    },
  },
});

// Global error handler for queries
queryClient.setMutationDefaults(['auth'], {
  onError: (error: any) => {
    if (error?.status === 401) {
      useAuthStore.getState().logout();
    }
  },
});

// Set up query client persistence for offline support
queryClient.setQueryDefaults(['cattle'], {
  staleTime: 1000 * 60 * 30, // 30 minutes for cattle data
});

queryClient.setQueryDefaults(['production'], {
  staleTime: 1000 * 60 * 15, // 15 minutes for production data
});

queryClient.setQueryDefaults(['user'], {
  staleTime: 1000 * 60 * 60, // 1 hour for user data
});