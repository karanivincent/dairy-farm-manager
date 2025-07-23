import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CattleProductionChart } from '../CattleProductionChart';
import type { Production } from '../../../../types/production.types';

const mockProductions: Production[] = [
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
  {
    id: '2',
    cattleId: '123',
    date: '2024-01-15',
    shift: 'evening',
    quantity: 20,
    recordedBy: 'user1',
    notes: null,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '3',
    cattleId: '123',
    date: '2024-01-14',
    shift: 'morning',
    quantity: 23,
    recordedBy: 'user1',
    notes: null,
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-14'),
  },
];

describe('CattleProductionChart', () => {
  it('should display empty state when no productions', () => {
    render(<CattleProductionChart productions={[]} />);

    expect(screen.getByText('Production History')).toBeInTheDocument();
    expect(screen.getByText('No production data recorded')).toBeInTheDocument();
  });

  it('should display summary statistics', () => {
    render(<CattleProductionChart productions={mockProductions} />);

    // Total production
    expect(screen.getByText('68.0 L')).toBeInTheDocument(); // 25 + 20 + 23

    // Average per session
    expect(screen.getByText('22.7 L')).toBeInTheDocument(); // 68 / 3

    // Sessions count
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should display section headers', () => {
    render(<CattleProductionChart productions={mockProductions} />);

    expect(screen.getByText('Total Production')).toBeInTheDocument();
    expect(screen.getByText('Average per Session')).toBeInTheDocument();
    expect(screen.getByText('Sessions')).toBeInTheDocument();
  });

  it('should display recent productions list', () => {
    render(<CattleProductionChart productions={mockProductions} />);

    expect(screen.getByText('Recent Productions')).toBeInTheDocument();
    
    // Check for production entries
    expect(screen.getByText('25.0 L')).toBeInTheDocument();
    expect(screen.getByText('20.0 L')).toBeInTheDocument();
    expect(screen.getByText('23.0 L')).toBeInTheDocument();
  });

  it('should display shift information', () => {
    render(<CattleProductionChart productions={mockProductions} />);

    const morningShifts = screen.getAllByText('morning shift');
    const eveningShifts = screen.getAllByText('evening shift');

    expect(morningShifts).toHaveLength(2);
    expect(eveningShifts).toHaveLength(1);
  });

  // Removed test for quality information as it's not part of the Production type

  it('should show placeholder for chart implementation', () => {
    render(<CattleProductionChart productions={mockProductions} />);

    expect(screen.getByText('Interactive chart visualization will be implemented with Chart.js')).toBeInTheDocument();
  });

  it('should limit recent productions to last 10', () => {
    const manyProductions = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      cattleId: '123',
      date: `2024-01-${String(15 - i).padStart(2, '0')}`,
      shift: 'morning' as const,
      quantity: 20 + i,
      recordedBy: 'user1',
      notes: null,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
    }));

    render(<CattleProductionChart productions={manyProductions} />);

    // Should only show 10 most recent entries in the productions list
    // The summary stats also contain numbers with "L", so we need to be more specific
    const recentProductionsSection = screen.getByText('Recent Productions').parentElement;
    const productionEntries = recentProductionsSection?.querySelectorAll('p.font-semibold');
    expect(productionEntries).toHaveLength(10);
  });

  it('should handle productions without quantity', () => {
    const productionsWithNull = [
      ...mockProductions,
      {
        id: '4',
        cattleId: '123',
        date: '2024-01-13',
        shift: 'morning' as const,
        quantity: null,
        recordedBy: 'user1',
        notes: null,
        createdAt: new Date('2024-01-13'),
        updatedAt: new Date('2024-01-13'),
      },
    ];

    render(<CattleProductionChart productions={productionsWithNull} />);

    // Should handle null quantity as 0
    expect(screen.getByText('0.0 L')).toBeInTheDocument();
  });

  it('should calculate correct total with null quantities', () => {
    const productionsWithNull = [
      {
        ...mockProductions[0],
        quantity: null,
      },
      mockProductions[1],
    ];

    render(<CattleProductionChart productions={productionsWithNull} />);

    // Check that the total appears in the summary stats
    // Total should be 0 + 20 = 20
    const totalElement = screen.getByText('Total Production').parentElement?.parentElement;
    expect(totalElement).toHaveTextContent('20.0 L');
  });
});