import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CattleDetailPage } from './CattleDetailPage';
import { cattleApi } from '../../lib/api/cattle.api';
import { Cattle } from '../../types/cattle.types';
import { Production } from '../../types/production.types';

// Mock the API
vi.mock('../../lib/api/cattle.api');

// Mock useParams
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    useNavigate: () => vi.fn(),
  };
});

const mockCattle: Cattle = {
  id: '123',
  name: 'Bessie',
  tagNumber: 'COW-001',
  breed: 'Holstein',
  birthDate: '2022-01-15',
  gender: 'female',
  status: 'active',
  weight: 550,
  purchaseDate: '2022-03-01',
  purchasePrice: 1500,
  motherId: '456',
  fatherId: '789',
  notes: 'Healthy cow',
  farmId: 'farm-1',
  createdAt: '2022-03-01',
  updatedAt: '2024-01-15',
};

const mockOffspring: Cattle[] = [
  {
    ...mockCattle,
    id: '999',
    name: 'Calf 1',
    tagNumber: 'CALF-001',
    birthDate: '2023-06-01',
    motherId: '123',
  },
];

const mockProduction: Production[] = [
  {
    id: '1',
    cattleId: '123',
    date: '2024-01-15',
    shift: 'morning',
    quantity: 25,
    quality: 'good',
    farmId: 'farm-1',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15',
  },
];

const renderComponent = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CattleDetailPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('CattleDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state initially', () => {
    vi.mocked(cattleApi.getById).mockImplementation(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('should display error state when cattle not found', async () => {
    vi.mocked(cattleApi.getById).mockRejectedValue(new Error('Cattle not found'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to load cattle details')).toBeInTheDocument();
    });
  });

  it('should display cattle details when loaded successfully', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue({ data: mockCattle });
    vi.mocked(cattleApi.getOffspring).mockResolvedValue({ data: mockOffspring });
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue({ data: mockProduction });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Bessie')).toBeInTheDocument();
      expect(screen.getByText('Tag: COW-001')).toBeInTheDocument();
      expect(screen.getByText('Holstein')).toBeInTheDocument();
      expect(screen.getByText('Female')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  it('should navigate back to cattle list when back button is clicked', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(cattleApi.getById).mockResolvedValue({ data: mockCattle });
    vi.mocked(cattleApi.getOffspring).mockResolvedValue({ data: [] });
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue({ data: [] });

    renderComponent();

    await waitFor(() => {
      const backButton = screen.getByText('Back to Cattle List');
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/cattle');
    });
  });

  it('should display tabs and switch between them', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue({ data: mockCattle });
    vi.mocked(cattleApi.getOffspring).mockResolvedValue({ data: mockOffspring });
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue({ data: mockProduction });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Production')).toBeInTheDocument();
      expect(screen.getByText('Offspring')).toBeInTheDocument();
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    // Click on Production tab
    fireEvent.click(screen.getByText('Production'));
    expect(screen.getByText('Production History')).toBeInTheDocument();

    // Click on Offspring tab
    fireEvent.click(screen.getByText('Offspring'));
    expect(screen.getByText('Offspring (1)')).toBeInTheDocument();
  });

  it('should handle edit button click', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(require('react-router-dom').useNavigate).mockReturnValue(mockNavigate);

    vi.mocked(cattleApi.getById).mockResolvedValue({ data: mockCattle });
    vi.mocked(cattleApi.getOffspring).mockResolvedValue({ data: [] });
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue({ data: [] });

    renderComponent();

    await waitFor(() => {
      const editButton = screen.getByRole('button', { name: /edit/i });
      fireEvent.click(editButton);
      expect(mockNavigate).toHaveBeenCalledWith('/cattle/123/edit');
    });
  });

  it('should handle delete button click with confirmation', async () => {
    window.confirm = vi.fn(() => true);
    const consoleSpy = vi.spyOn(console, 'log');

    vi.mocked(cattleApi.getById).mockResolvedValue({ data: mockCattle });
    vi.mocked(cattleApi.getOffspring).mockResolvedValue({ data: [] });
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue({ data: [] });

    renderComponent();

    await waitFor(() => {
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      fireEvent.click(deleteButton);
      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete this cattle record? This action cannot be undone.'
      );
      expect(consoleSpy).toHaveBeenCalledWith('Delete cattle:', '123');
    });
  });

  it('should display offspring count in badge', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue({ data: mockCattle });
    vi.mocked(cattleApi.getOffspring).mockResolvedValue({ data: mockOffspring });
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue({ data: [] });

    renderComponent();

    await waitFor(() => {
      // Check for offspring badge
      const offspringTab = screen.getByText('Offspring').closest('button');
      expect(offspringTab).toHaveTextContent('1');
    });
  });

  it('should display production count in badge', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue({ data: mockCattle });
    vi.mocked(cattleApi.getOffspring).mockResolvedValue({ data: [] });
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue({ data: mockProduction });

    renderComponent();

    await waitFor(() => {
      // Check for production badge
      const productionTab = screen.getByText('Production').closest('button');
      expect(productionTab).toHaveTextContent('1');
    });
  });

  it('should calculate and display age correctly', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue({ data: mockCattle });
    vi.mocked(cattleApi.getOffspring).mockResolvedValue({ data: [] });
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue({ data: [] });

    renderComponent();

    await waitFor(() => {
      // Age should be calculated from birthDate
      expect(screen.getByText(/year/)).toBeInTheDocument();
    });
  });

  it('should handle share functionality', async () => {
    const mockShare = vi.fn();
    const mockClipboard = { writeText: vi.fn() };
    
    Object.defineProperty(navigator, 'share', {
      value: mockShare,
      writable: true,
    });
    
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    vi.mocked(cattleApi.getById).mockResolvedValue({ data: mockCattle });
    vi.mocked(cattleApi.getOffspring).mockResolvedValue({ data: [] });
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue({ data: [] });

    renderComponent();

    await waitFor(() => {
      const shareButton = screen.getAllByRole('button').find(btn => 
        btn.querySelector('[data-lucid-icon="share-2"]')
      );
      if (shareButton) {
        fireEvent.click(shareButton);
        expect(mockShare).toHaveBeenCalled();
      }
    });
  });
});