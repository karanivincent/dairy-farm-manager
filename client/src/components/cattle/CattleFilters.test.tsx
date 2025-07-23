import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CattleFilters } from './CattleFilters';
import { CattleStatus, Gender } from '../../types/cattle.types';

describe('CattleFilters', () => {
  const mockOnFiltersChange = vi.fn();
  const mockOnReset = vi.fn();
  const defaultFilters = {
    search: '',
    page: 1,
    limit: 10,
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render search input', () => {
    render(
      <CattleFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByTestId('cattle-search')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by name or tag number...')).toBeInTheDocument();
  });

  it('should debounce search input', async () => {
    const user = userEvent.setup();
    render(
      <CattleFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    const searchInput = screen.getByTestId('cattle-search');
    await user.type(searchInput, 'Bessie');
    
    // Should not call immediately
    expect(mockOnFiltersChange).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ search: 'Bessie' });
    }, { timeout: 500 });
  });

  it('should toggle advanced filters', () => {
    render(
      <CattleFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Filters'));
    
    expect(screen.getByLabelText('Status')).toBeInTheDocument();
    expect(screen.getByLabelText('Gender')).toBeInTheDocument();
    expect(screen.getByLabelText('Sort By')).toBeInTheDocument();
  });

  it('should show active indicator when filters are applied', () => {
    const filtersWithStatus = { ...defaultFilters, status: CattleStatus.ACTIVE };
    render(
      <CattleFilters
        filters={filtersWithStatus}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    expect(screen.getByText('Active')).toHaveClass('bg-green-600');
  });

  it('should handle status filter change', () => {
    render(
      <CattleFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    fireEvent.click(screen.getByText('Filters'));
    fireEvent.change(screen.getByTestId('status-filter'), {
      target: { value: CattleStatus.PREGNANT },
    });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ status: CattleStatus.PREGNANT });
  });

  it('should handle gender filter change', () => {
    render(
      <CattleFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    fireEvent.click(screen.getByText('Filters'));
    fireEvent.change(screen.getByTestId('gender-filter'), {
      target: { value: Gender.FEMALE },
    });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ gender: Gender.FEMALE });
  });

  it('should handle sort change', () => {
    render(
      <CattleFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    fireEvent.click(screen.getByText('Filters'));
    fireEvent.change(screen.getByTestId('sort-select'), {
      target: { value: 'birthDate-desc' },
    });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      sortBy: 'birthDate',
      sortOrder: 'desc',
    });
  });

  it('should show clear all button when filters are active', () => {
    const activeFilters = { ...defaultFilters, status: CattleStatus.ACTIVE };
    render(
      <CattleFilters
        filters={activeFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    fireEvent.click(screen.getByText('Filters'));
    
    const clearButton = screen.getByText('Clear all');
    expect(clearButton).toBeInTheDocument();
    
    fireEvent.click(clearButton);
    expect(mockOnReset).toHaveBeenCalled();
  });

  it('should not show clear all button when no filters are active', () => {
    render(
      <CattleFilters
        filters={defaultFilters}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    fireEvent.click(screen.getByText('Filters'));
    
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });

  it('should clear filter value when empty option is selected', () => {
    const filtersWithGender = { ...defaultFilters, gender: Gender.FEMALE };
    render(
      <CattleFilters
        filters={filtersWithGender}
        onFiltersChange={mockOnFiltersChange}
        onReset={mockOnReset}
      />
    );
    
    fireEvent.click(screen.getByText('Filters'));
    fireEvent.change(screen.getByTestId('gender-filter'), {
      target: { value: '' },
    });
    
    expect(mockOnFiltersChange).toHaveBeenCalledWith({ gender: undefined });
  });
});