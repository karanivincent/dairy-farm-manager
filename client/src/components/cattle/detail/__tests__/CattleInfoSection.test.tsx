import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CattleInfoSection } from '../CattleInfoSection';
import type { Cattle } from '../../../../types/cattle.types';
import { Gender, CattleStatus } from '../../../../types/cattle.types';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
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
    location: 'Barn A',
  },
  createdAt: new Date('2022-03-01'),
  updatedAt: new Date('2024-01-15'),
};

describe('CattleInfoSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render basic cattle information', () => {
    render(<CattleInfoSection cattle={mockCattle} offspringCount={3} />);

    expect(screen.getByText('COW-001')).toBeInTheDocument();
    expect(screen.getByText('Holstein')).toBeInTheDocument();
    expect(screen.getByText('Female')).toBeInTheDocument();
    expect(screen.getByText('550 kg')).toBeInTheDocument();
  });

  it('should display "Not recorded" when weight is not provided', () => {
    const cattleWithoutWeight = { ...mockCattle, metadata: { ...mockCattle.metadata, weight: undefined } };
    render(<CattleInfoSection cattle={cattleWithoutWeight} offspringCount={0} />);

    expect(screen.getByText('Not recorded')).toBeInTheDocument();
  });

  it('should display purchase information when available', () => {
    render(<CattleInfoSection cattle={mockCattle} offspringCount={0} />);

    expect(screen.getByText('Purchased')).toBeInTheDocument();
    expect(screen.getByText('$1,500')).toBeInTheDocument();
  });

  it('should display "Born on farm" when no purchase date', () => {
    const farmBornCattle = { 
      ...mockCattle, 
      metadata: { 
        ...mockCattle.metadata, 
        purchaseDate: undefined, 
        purchasePrice: undefined 
      } 
    };
    render(<CattleInfoSection cattle={farmBornCattle} offspringCount={0} />);

    expect(screen.getByText('Born on farm')).toBeInTheDocument();
  });

  it('should display breeding information with navigation links', () => {
    render(<CattleInfoSection cattle={mockCattle} offspringCount={2} />);

    const motherLink = screen.getAllByText('View Details')[0];
    const fatherLink = screen.getAllByText('View Details')[1];

    fireEvent.click(motherLink);
    expect(mockNavigate).toHaveBeenCalledWith('/cattle/456');

    fireEvent.click(fatherLink);
    expect(mockNavigate).toHaveBeenCalledWith('/cattle/789');
  });

  it('should display "Unknown" for missing parents', () => {
    const orphanCattle = { ...mockCattle, parentCowId: null, parentBullId: null };
    render(<CattleInfoSection cattle={orphanCattle} offspringCount={0} />);

    const unknownTexts = screen.getAllByText('Unknown');
    expect(unknownTexts).toHaveLength(2); // Mother and Father
  });

  it('should display offspring count', () => {
    render(<CattleInfoSection cattle={mockCattle} offspringCount={5} />);

    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should display current location when available', () => {
    render(<CattleInfoSection cattle={mockCattle} offspringCount={0} />);

    expect(screen.getByText('Barn A')).toBeInTheDocument();
  });

  it('should display all section headers', () => {
    render(<CattleInfoSection cattle={mockCattle} offspringCount={0} />);

    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('Additional Information')).toBeInTheDocument();
    expect(screen.getByText('Breeding Information')).toBeInTheDocument();
  });

  it('should format dates correctly', () => {
    render(<CattleInfoSection cattle={mockCattle} offspringCount={0} />);

    // Check that date formatting function is called (birth date and purchase date)
    const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(dateElements.length).toBeGreaterThan(0);
  });
});