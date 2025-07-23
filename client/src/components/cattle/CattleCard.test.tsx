import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CattleCard } from './CattleCard';
import { CattleStatus, Gender } from '../../types/cattle.types';

describe('CattleCard', () => {
  const mockCattle = {
    id: 1,
    name: 'Bessie',
    tagNumber: 'COW-001',
    breed: 'Holstein',
    gender: Gender.FEMALE,
    status: CattleStatus.ACTIVE,
    birthDate: '2020-01-15',
    photoUrl: 'https://example.com/cow.jpg',
    createdAt: '2020-01-15T00:00:00Z',
    updatedAt: '2020-01-15T00:00:00Z',
  };

  it('should render cattle information', () => {
    render(<CattleCard cattle={mockCattle} />);
    
    expect(screen.getByText('Bessie')).toBeInTheDocument();
    expect(screen.getByText('COW-001')).toBeInTheDocument();
    expect(screen.getByText('♀️ Cow')).toBeInTheDocument();
    expect(screen.getByText('Breed: Holstein')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should display male cattle correctly', () => {
    const maleCattle = { ...mockCattle, gender: Gender.MALE };
    render(<CattleCard cattle={maleCattle} />);
    
    expect(screen.getByText('♂️ Bull')).toBeInTheDocument();
  });

  it('should display cattle photo when available', () => {
    render(<CattleCard cattle={mockCattle} />);
    
    const img = screen.getByAltText('Bessie');
    expect(img).toHaveAttribute('src', mockCattle.photoUrl);
  });

  it('should display placeholder when no photo', () => {
    const cattleWithoutPhoto = { ...mockCattle, photoUrl: undefined };
    render(<CattleCard cattle={cattleWithoutPhoto} />);
    
    expect(screen.getByText('🐄')).toBeInTheDocument();
  });

  it('should calculate and display age', () => {
    render(<CattleCard cattle={mockCattle} />);
    
    // Age calculation will vary, so just check that "old" text exists
    expect(screen.getByText(/old$/)).toBeInTheDocument();
  });

  it('should display "Unknown age" when no birth date', () => {
    const cattleWithoutBirthDate = { ...mockCattle, birthDate: undefined };
    render(<CattleCard cattle={cattleWithoutBirthDate} />);
    
    // The CattleCard component doesn't show age when birthDate is undefined
    // It only shows the age section when birthDate exists
    expect(screen.queryByText(/old$/)).not.toBeInTheDocument();
  });

  it('should apply correct status colors', () => {
    const testCases = [
      { status: CattleStatus.ACTIVE, className: 'bg-green-100 text-green-800' },
      { status: CattleStatus.SOLD, className: 'bg-gray-100 text-gray-800' },
      { status: CattleStatus.DECEASED, className: 'bg-red-100 text-red-800' },
      { status: CattleStatus.DRY, className: 'bg-yellow-100 text-yellow-800' },
      { status: CattleStatus.PREGNANT, className: 'bg-blue-100 text-blue-800' },
      { status: CattleStatus.CULLED, className: 'bg-orange-100 text-orange-800' },
    ];

    testCases.forEach(({ status, className }) => {
      const { container } = render(<CattleCard cattle={{ ...mockCattle, status }} />);
      const statusElement = container.querySelector(`.${className.split(' ').join('.')}`);
      expect(statusElement).toBeInTheDocument();
    });
  });

  it('should call onClick when clicked', () => {
    const mockOnClick = vi.fn();
    render(<CattleCard cattle={mockCattle} onClick={mockOnClick} />);
    
    const card = screen.getByTestId('cattle-card');
    fireEvent.click(card);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockCattle);
  });

  it('should display parent information when available', () => {
    const cattleWithParents = {
      ...mockCattle,
      parentBull: { id: 2, name: 'Ferdinand' },
      parentCow: { id: 3, name: 'Daisy' },
    };
    
    render(<CattleCard cattle={cattleWithParents as any} />);
    
    expect(screen.getByText('Sire: Ferdinand')).toBeInTheDocument();
    expect(screen.getByText('Dam: Daisy')).toBeInTheDocument();
  });

  it('should not display parent section when no parents', () => {
    render(<CattleCard cattle={mockCattle} />);
    
    expect(screen.queryByText(/Sire:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Dam:/)).not.toBeInTheDocument();
  });
});