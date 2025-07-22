import { useEffect, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'owner' | 'manager' | 'worker';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, token } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Check if token exists in localStorage on mount
    const storedToken = localStorage.getItem('auth-storage');
    if (storedToken && !isAuthenticated) {
      // Token exists but auth state is not hydrated yet
      // Let zustand persist middleware handle this
      return;
    }
  }, [isAuthenticated]);

  // If not authenticated, redirect to login
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but no user data, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirements
  if (requiredRole) {
    const roleHierarchy = {
      owner: 3,
      manager: 2,
      worker: 1,
    };

    const userLevel = roleHierarchy[user.role];
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      // User doesn't have sufficient permissions
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}