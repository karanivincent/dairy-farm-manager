import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CattleOffspringList } from '../CattleOffspringList';
import { Cattle } from '../../../../types/cattle.types';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockOffspring: Cattle[] = [
  {
    id: '1',
    name: 'Calf 1',
    tagNumber: 'CALF-001',
    breed: 'Holstein',
    birthDate: '2023-06-01',
    gender: 'female',
    status: 'active',
    farmId: 'farm-1',
    createdAt: '2023-06-01',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Calf 2',
    tagNumber: 'CALF-002',
    breed: 'Holstein',
    birthDate: '2023-08-15',
    gender: 'male',
    status: 'sold',
    farmId: 'farm-1',
    createdAt: '2023-08-15',
    updatedAt: '2024-01-15',
  },
];

describe('CattleOffspringList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display empty state when no offspring', () => {
    render(<CattleOffspringList offspring={[]} />);

    expect(screen.getByText('Offspring')).toBeInTheDocument();
    expect(screen.getByText('No offspring recorded')).toBeInTheDocument();
  });

  it('should display offspring count in header', () => {
    render(<CattleOffspringList offspring={mockOffspring} />);

    expect(screen.getByText('Offspring (2)')).toBeInTheDocument();
  });

  it('should render all offspring cards', () => {
    render(<CattleOffspringList offspring={mockOffspring} />);

    expect(screen.getByText('Calf 1')).toBeInTheDocument();
    expect(screen.getByText('CALF-001')).toBeInTheDocument();
    expect(screen.getByText('Calf 2')).toBeInTheDocument();
    expect(screen.getByText('CALF-002')).toBeInTheDocument();
  });

  it('should display gender correctly', () => {
    render(<CattleOffspringList offspring={mockOffspring} />);

    expect(screen.getByText('Heifer')).toBeInTheDocument(); // Female
    expect(screen.getByText('Bull')).toBeInTheDocument(); // Male
  });

  it('should display status badges with correct styling', () => {
    render(<CattleOffspringList offspring={mockOffspring} />);

    const activeStatus = screen.getByText('active');
    const soldStatus = screen.getByText('sold');

    expect(activeStatus).toHaveClass('bg-green-100', 'text-green-800');
    expect(soldStatus).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should navigate to offspring detail on card click', () => {
    render(<CattleOffspringList offspring={mockOffspring} />);

    const firstCard = screen.getByText('Calf 1').closest('div.border');
    fireEvent.click(firstCard!);

    expect(mockNavigate).toHaveBeenCalledWith('/cattle/1');
  });

  it('should display birth dates', () => {
    render(<CattleOffspringList offspring={mockOffspring} />);

    expect(screen.getByText(/Born.*6\/1\/2023/)).toBeInTheDocument();
    expect(screen.getByText(/Born.*8\/15\/2023/)).toBeInTheDocument();
  });

  it('should display breed information', () => {
    render(<CattleOffspringList offspring={mockOffspring} />);

    const breedElements = screen.getAllByText('Holstein');
    expect(breedElements.length).toBe(2);
  });

  it('should apply hover styles on card', () => {
    render(<CattleOffspringList offspring={mockOffspring} />);

    const firstCard = screen.getByText('Calf 1').closest('div.border');
    expect(firstCard).toHaveClass('hover:shadow-md', 'cursor-pointer');
  });

  it('should handle offspring with deceased status', () => {
    const offspringWithDeceased = [
      ...mockOffspring,
      {
        ...mockOffspring[0],
        id: '3',
        name: 'Calf 3',
        status: 'deceased' as const,
      },
    ];

    render(<CattleOffspringList offspring={offspringWithDeceased} />);

    const deceasedStatus = screen.getByText('deceased');
    expect(deceasedStatus).toHaveClass('bg-red-100', 'text-red-800');
  });
});