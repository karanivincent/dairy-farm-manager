import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../../../test/utils';
import { OfflineIndicator } from '../OfflineIndicator';
import { useUIStore } from '../../../store/ui.store';

// Mock the UI store
vi.mock('../../../store/ui.store', () => ({
  useUIStore: vi.fn(),
}));

describe('OfflineIndicator', () => {
  const mockUIStore = vi.mocked(useUIStore);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when online and not syncing', () => {
    mockUIStore.mockReturnValue({
      isOnline: true,
      syncInProgress: false,
    } as any);

    const { container } = renderWithProviders(<OfflineIndicator />);
    
    expect(container.firstChild).toBeNull();
  });

  it('should render offline indicator when offline', () => {
    mockUIStore.mockReturnValue({
      isOnline: false,
      syncInProgress: false,
    } as any);

    renderWithProviders(<OfflineIndicator />);
    
    expect(screen.getByText('Offline')).toBeInTheDocument();
    expect(screen.getByText('Offline').closest('div')).toHaveClass('bg-red-50', 'text-red-700', 'border-red-200');
  });

  it('should render syncing indicator when sync is in progress', () => {
    mockUIStore.mockReturnValue({
      isOnline: true,
      syncInProgress: true,
    } as any);

    renderWithProviders(<OfflineIndicator />);
    
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
    expect(screen.getByText('Syncing...').closest('div')).toHaveClass('bg-blue-50', 'text-blue-700', 'border-blue-200');
  });

  it('should render syncing indicator even when offline', () => {
    mockUIStore.mockReturnValue({
      isOnline: false,
      syncInProgress: true,
    } as any);

    renderWithProviders(<OfflineIndicator />);
    
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
    const indicator = screen.getByText('Syncing...').closest('div');
    expect(indicator).toHaveClass('bg-blue-50');
    expect(indicator).toHaveClass('text-blue-700');
    expect(indicator).toHaveClass('border-blue-200');
  });

  it('should have correct positioning classes', () => {
    mockUIStore.mockReturnValue({
      isOnline: false,
      syncInProgress: false,
    } as any);

    renderWithProviders(<OfflineIndicator />);
    
    const indicator = screen.getByText('Offline').closest('div')?.parentElement;
    expect(indicator).toHaveClass('fixed', 'top-4', 'left-1/2', 'transform', '-translate-x-1/2', 'z-50');
  });
});