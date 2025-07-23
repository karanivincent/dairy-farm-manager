import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CattleDetailPage } from './CattleDetailPage';
import { cattleApi } from '../../lib/api/cattle.api';
import type { Cattle } from '../../types/cattle.types';
import { Gender, CattleStatus } from '../../types/cattle.types';
import type { Production } from '../../types/production.types';

// Mock the API
vi.mock('../../lib/api/cattle.api');

// Mock useParams and useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ id: '123' }),
    useNavigate: () => mockNavigate,
  };
});

const mockCattle: Cattle = {
  id: 123,
  name: 'Bessie',
  tagNumber: 'COW-001',
  breed: 'Holstein',
  birthDate: '2022-01-15',
  gender: Gender.FEMALE,
  status: CattleStatus.ACTIVE,
  parentCowId: 456,
  parentBullId: 789,
  photoUrl: null,
  metadata: {
    weight: 550,
    purchaseDate: '2022-03-01',
    purchasePrice: 1500,
    notes: 'Healthy cow',
  },
  createdAt: new Date('2022-03-01'),
  updatedAt: new Date('2024-01-15'),
};

const mockOffspring: Cattle[] = [
  {
    ...mockCattle,
    id: 999,
    name: 'Calf 1',
    tagNumber: 'CALF-001',
    birthDate: '2023-06-01',
    parentCowId: 123,
    parentBullId: null,
  },
];

const mockProduction: Production[] = [
  {
    id: '1',
    cattleId: '123',
    date: '2024-01-15',
    shift: 'morning',
    quantity: 25,
    recordedBy: 'user1',
    notes: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
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
    vi.mocked(cattleApi.getOffspring).mockImplementation(() => new Promise(() => {}));
    vi.mocked(cattleApi.getProductionHistory).mockImplementation(() => new Promise(() => {}));
    
    const { container } = renderComponent();
    // Check for loading spinner by class
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should display error state when cattle not found', async () => {
    vi.mocked(cattleApi.getById).mockRejectedValue(new Error('Cattle not found'));
    vi.mocked(cattleApi.getOffspring).mockResolvedValue([]);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue([]);
    
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Failed to load cattle details')).toBeInTheDocument();
    });
  });

  it('should display cattle details when loaded successfully', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue(mockCattle);
    vi.mocked(cattleApi.getOffspring).mockResolvedValue(mockOffspring);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue(mockProduction);

    renderComponent();

    await waitFor(() => {
      // Use getAllByText since name appears multiple times
      const nameElements = screen.getAllByText('Bessie');
      expect(nameElements.length).toBeGreaterThan(0);
      
      // Tag number also appears multiple times
      const tagElements = screen.getAllByText(/Tag: COW-001/);
      expect(tagElements.length).toBeGreaterThan(0);
      
      // Holstein and Female might also appear multiple times
      const breedElements = screen.getAllByText('Holstein');
      expect(breedElements.length).toBeGreaterThan(0);
      
      const genderElements = screen.getAllByText('Female');
      expect(genderElements.length).toBeGreaterThan(0);
      
      expect(screen.getByText('active')).toBeInTheDocument(); // Status is lowercase in the enum
    });
  });

  it('should navigate back to cattle list when back button is clicked', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue(mockCattle);
    vi.mocked(cattleApi.getOffspring).mockResolvedValue([]);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      const backButton = screen.getByText('Back to Cattle List');
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/cattle');
    });
  });

  it.skip('should display tabs and switch between them', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue(mockCattle);
    vi.mocked(cattleApi.getOffspring).mockResolvedValue(mockOffspring);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue(mockProduction);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Production')).toBeInTheDocument();
      // Use getAllByText for Offspring since it appears in multiple places
      const offspringElements = screen.getAllByText('Offspring');
      expect(offspringElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Health')).toBeInTheDocument();
    });

    // Click on Production tab - find the tab button specifically
    const tabs = screen.getAllByRole('button');
    const productionTab = tabs.find(tab => tab.textContent?.includes('Production') && !tab.textContent?.includes('Summary'));
    expect(productionTab).toBeDefined();
    fireEvent.click(productionTab!);
    
    // Wait for content to appear
    await waitFor(() => {
      expect(screen.getByText('Production Summary')).toBeInTheDocument();
    });

    // Click on Offspring tab - find the tab button specifically
    const offspringTab = tabs.find(tab => tab.textContent?.includes('Offspring') && tab.textContent?.includes('1'));
    expect(offspringTab).toBeDefined();
    fireEvent.click(offspringTab!);
    
    await waitFor(() => {
      expect(screen.getByText('Offspring (1)')).toBeInTheDocument();
    });
  });

  it('should handle edit button click', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue(mockCattle);
    vi.mocked(cattleApi.getOffspring).mockResolvedValue([]);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue([]);

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

    vi.mocked(cattleApi.getById).mockResolvedValue(mockCattle);
    vi.mocked(cattleApi.getOffspring).mockResolvedValue([]);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue([]);

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
    vi.mocked(cattleApi.getById).mockResolvedValue(mockCattle);
    vi.mocked(cattleApi.getOffspring).mockResolvedValue(mockOffspring);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      // Check for offspring badge - find the tab button that contains both "Offspring" and "1"
      const tabs = screen.getAllByRole('button');
      const offspringTab = tabs.find(tab => 
        tab.textContent?.includes('Offspring') && tab.textContent?.includes('1')
      );
      expect(offspringTab).toBeDefined();
      expect(offspringTab).toHaveTextContent('Offspring');
      expect(offspringTab).toHaveTextContent('1');
    });
  });

  it('should display production count in badge', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue(mockCattle);
    vi.mocked(cattleApi.getOffspring).mockResolvedValue([]);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue(mockProduction);

    renderComponent();

    await waitFor(() => {
      // Check for production badge
      const productionTab = screen.getByText('Production').closest('button');
      expect(productionTab).toHaveTextContent('1');
    });
  });

  it('should calculate and display age correctly', async () => {
    vi.mocked(cattleApi.getById).mockResolvedValue(mockCattle);
    vi.mocked(cattleApi.getOffspring).mockResolvedValue([]);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue([]);

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

    vi.mocked(cattleApi.getById).mockResolvedValue(mockCattle);
    vi.mocked(cattleApi.getOffspring).mockResolvedValue([]);
    vi.mocked(cattleApi.getProductionHistory).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);
      expect(mockShare).toHaveBeenCalled();
    });
  });
});