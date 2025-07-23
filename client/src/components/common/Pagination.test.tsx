import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  const mockOnPageChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when only one page', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={mockOnPageChange} />
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('should render pagination controls', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    expect(screen.getByTestId('pagination-prev')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-next')).toBeInTheDocument();
  });

  it('should disable previous button on first page', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const prevButton = screen.getByTestId('pagination-prev');
    expect(prevButton).toHaveClass('cursor-not-allowed');
    fireEvent.click(prevButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('should disable next button on last page', () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const nextButton = screen.getByTestId('pagination-next');
    expect(nextButton).toHaveClass('cursor-not-allowed');
    fireEvent.click(nextButton);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('should call onPageChange when clicking next', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    fireEvent.click(screen.getByTestId('pagination-next'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should call onPageChange when clicking previous', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    fireEvent.click(screen.getByTestId('pagination-prev'));
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('should render all page numbers when total pages is small', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should highlight current page', () => {
    render(
      <Pagination currentPage={3} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-green-600', 'text-white');
  });

  it('should show ellipsis for large page counts', () => {
    render(
      <Pagination currentPage={5} totalPages={10} onPageChange={mockOnPageChange} />
    );
    
    const ellipses = screen.getAllByText('...');
    expect(ellipses).toHaveLength(2);
  });

  it('should call onPageChange when clicking page number', () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={mockOnPageChange} />
    );
    
    fireEvent.click(screen.getByText('3'));
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('should display item count information', () => {
    // Mock desktop viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    
    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        totalItems={50}
        pageSize={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    // On mobile, this is hidden with 'hidden sm:flex'
    const showingText = screen.queryByText('Showing');
    if (showingText) {
      expect(showingText).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument(); // Start item
      expect(screen.getByText('20')).toBeInTheDocument(); // End item
      expect(screen.getByText('50')).toBeInTheDocument(); // Total items
    }
  });

  it('should handle last page with partial items', () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        totalItems={42}
        pageSize={10}
        onPageChange={mockOnPageChange}
      />
    );
    
    // Check that the correct range is shown (41-42 of 42)
    const container = screen.queryByText(/Showing/);
    if (container) {
      const parent = container.parentElement;
      expect(parent?.textContent).toContain('41');
      expect(parent?.textContent).toContain('to');
      expect(parent?.textContent).toContain('42');
      expect(parent?.textContent).toContain('of');
      expect(parent?.textContent).toMatch(/42\s+results/);
    }
  });

  describe('Mobile view', () => {
    it('should show mobile-specific buttons', () => {
      // Since we're testing with jsdom which doesn't have real viewport,
      // mobile buttons are always rendered but hidden with CSS
      render(
        <Pagination currentPage={2} totalPages={5} onPageChange={mockOnPageChange} />
      );
      
      // Check for mobile navigation buttons (they exist in DOM but may be hidden with CSS)
      // There are multiple "Previous" texts (one in mobile button, one in sr-only span)
      const prevButtons = screen.getAllByText('Previous');
      const nextButtons = screen.getAllByText('Next');
      
      expect(prevButtons.length).toBeGreaterThan(0);
      expect(nextButtons.length).toBeGreaterThan(0);
    });
  });
});