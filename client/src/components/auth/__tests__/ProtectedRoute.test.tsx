import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/utils';
import { ProtectedRoute } from '../ProtectedRoute';
import { useAuthStore } from '../../../store/auth.store';

// Mock the auth store
vi.mock('../../../store/auth.store', () => ({
  useAuthStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => {
      mockNavigate(to);
      return <div data-testid="navigate">Redirecting to {to}</div>;
    },
    useLocation: () => ({ pathname: '/test' }),
  };
});

describe('ProtectedRoute', () => {
  const mockAuthStore = vi.mocked(useAuthStore);

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('should render children when user is authenticated', () => {
    mockAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'owner',
        isActive: true,
      },
      token: 'mock-token',
    } as any);

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', () => {
    mockAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
    } as any);

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
  });

  it('should redirect to login when token is missing', () => {
    mockAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'owner',
        isActive: true,
      },
      token: null,
    } as any);

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
  });

  it('should redirect to login when user is missing', () => {
    mockAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: null,
      token: 'mock-token',
    } as any);

    renderWithProviders(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
  });

  it('should allow access when user has required role', () => {
    mockAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'manager',
        isActive: true,
      },
      token: 'mock-token',
    } as any);

    renderWithProviders(
      <ProtectedRoute requiredRole="worker">
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('should redirect to home when user lacks required role', () => {
    mockAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: {
        id: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        role: 'worker',
        isActive: true,
      },
      token: 'mock-token',
    } as any);

    renderWithProviders(
      <ProtectedRoute requiredRole="manager">
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /')).toBeInTheDocument();
  });
});