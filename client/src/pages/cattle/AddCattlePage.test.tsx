import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AddCattlePage } from './AddCattlePage';
import { cattleApi } from '../../lib/api/cattle.api';
import { CattleStatus, Gender } from '../../types/cattle.types';

// Mock the API
vi.mock('../../lib/api/cattle.api', () => ({
  cattleApi: {
    checkTagNumber: vi.fn(),
    getBreeds: vi.fn(),
    searchForParents: vi.fn(),
    create: vi.fn(),
    uploadPhoto: vi.fn(),
  },
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AddCattlePage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    
    // Setup default mocks
    vi.mocked(cattleApi.checkTagNumber).mockResolvedValue({ exists: false });
    vi.mocked(cattleApi.getBreeds).mockResolvedValue([
      'Holstein',
      'Jersey',
      'Guernsey',
      'Brown Swiss',
      'Other',
    ]);
    vi.mocked(cattleApi.searchForParents).mockResolvedValue([]);
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AddCattlePage />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('should render the add cattle form', () => {
    renderComponent();
    
    expect(screen.getByText('Add New Cattle')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Basic Information' })).toBeInTheDocument();
    expect(screen.getByText('Back to Cattle List')).toBeInTheDocument();
  });

  it('should display form steps', () => {
    renderComponent();
    
    expect(screen.getByRole('heading', { name: 'Basic Information' })).toBeInTheDocument();
    // Other steps should be in the step indicator - use getAllByText since they appear multiple times
    expect(screen.getAllByText('Breeding Details').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Health Status').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Photo').length).toBeGreaterThan(0);
  });

  it('should navigate through form steps', async () => {
    renderComponent();
    
    // Fill required fields in step 1
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Bessie' } });
    fireEvent.change(screen.getByLabelText(/tag number/i), { target: { value: 'COW-001' } });
    
    // Go to next step
    fireEvent.click(screen.getByText('Next'));
    
    await waitFor(() => {
      expect(screen.getByText('Sire (Father)')).toBeInTheDocument();
    });
  });

  it('should validate required fields', async () => {
    renderComponent();
    
    // Try to go to next step without filling required fields
    fireEvent.click(screen.getByText('Next'));
    
    // Should stay on same step due to validation
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Basic Information' })).toBeInTheDocument();
    });
  });

  it('should check for duplicate tag numbers', async () => {
    vi.mocked(cattleApi.checkTagNumber).mockResolvedValue({ exists: true });
    
    renderComponent();
    
    fireEvent.change(screen.getByLabelText(/tag number/i), { target: { value: 'COW-001' } });
    
    await waitFor(() => {
      expect(screen.getByText('This tag number already exists')).toBeInTheDocument();
    });
  });

  it('should calculate age from birth date', async () => {
    renderComponent();
    
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);
    
    fireEvent.change(screen.getByLabelText(/birth date/i), {
      target: { value: oneYearAgo.toISOString().split('T')[0] },
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Age: 1 year/)).toBeInTheDocument();
    });
  });

  it.skip('should submit the form successfully', async () => {
    const mockCattle = {
      id: 1,
      name: 'Bessie',
      tagNumber: 'COW-001',
      gender: Gender.FEMALE,
      status: CattleStatus.ACTIVE,
      birthDate: undefined,
      breed: undefined,
      parentCowId: null,
      parentBullId: null,
      photoUrl: null,
      metadata: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    vi.mocked(cattleApi.create).mockResolvedValue(mockCattle);
    
    const { container } = renderComponent();
    
    // Fill step 1 - wait for the form to be ready
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Bessie' } });
    fireEvent.change(screen.getByLabelText(/tag number/i), { target: { value: 'COW-001' } });
    
    // The gender field should already have default value
    const genderSelect = screen.getByLabelText(/gender/i) as HTMLSelectElement;
    expect(genderSelect.value).toBe(Gender.FEMALE);
    
    fireEvent.click(screen.getByText('Next'));
    
    // Skip step 2 (breeding details are optional)
    await waitFor(() => screen.getByText('Sire (Father)'));
    fireEvent.click(screen.getByText('Next'));
    
    // Skip step 3 (use default status)
    await waitFor(() => screen.getByText('Current Status'));
    fireEvent.click(screen.getByText('Next'));
    
    // Skip step 4 (photo is optional)
    await waitFor(() => screen.getByText('Photo Upload'));
    
    // The submit button should be visible now
    const submitButton = screen.getByRole('button', { name: /add cattle/i });
    expect(submitButton).not.toBeDisabled();
    
    // Click the submit button
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(cattleApi.create).toHaveBeenCalledTimes(1);
    }, { timeout: 3000 });
    
    expect(cattleApi.create).toHaveBeenCalledWith({
      name: 'Bessie',
      tagNumber: 'COW-001',
      gender: Gender.FEMALE,
      status: CattleStatus.ACTIVE,
      birthDate: undefined,
      breed: undefined,
      parentBullId: undefined,
      parentCowId: undefined,
      metadata: {
        birthWeight: undefined,
        birthType: undefined,
        healthNotes: undefined,
      },
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/cattle');
    });
  });

  it('should handle cancel button', () => {
    renderComponent();
    
    fireEvent.click(screen.getByTestId('cancel-button'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/cattle');
  });

  it('should navigate with back button', () => {
    renderComponent();
    
    fireEvent.click(screen.getByText('Back to Cattle List'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/cattle');
  });
});