import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CattleProfileCard } from '../CattleProfileCard';
import type { Cattle } from '../../../../types/cattle.types';
import { Gender, CattleStatus } from '../../../../types/cattle.types';

const mockCattle: Cattle = {
  id: 123,
  name: 'Bessie',
  tagNumber: 'COW-001',
  breed: 'Holstein',
  birthDate: '2022-01-15',
  gender: Gender.FEMALE,
  status: CattleStatus.ACTIVE,
  parentCowId: null,
  parentBullId: null,
  photoUrl: null,
  metadata: {
    weight: 550,
    notes: 'Healthy and productive cow',
    location: 'Barn A',
  },
  createdAt: new Date('2022-03-01'),
  updatedAt: new Date('2024-01-15'),
};

describe('CattleProfileCard', () => {
  it('should render cattle basic information', () => {
    render(<CattleProfileCard cattle={mockCattle} age="2 years" />);

    expect(screen.getByText('Bessie')).toBeInTheDocument();
    expect(screen.getByText('Tag: COW-001')).toBeInTheDocument();
    expect(screen.getByText('Holstein')).toBeInTheDocument();
    expect(screen.getByText('Female')).toBeInTheDocument();
    expect(screen.getByText('2 years')).toBeInTheDocument();
    // Weight appears multiple times in the UI
    const weightElements = screen.getAllByText(/550 kg/);
    expect(weightElements.length).toBeGreaterThan(0);
  });

  it('should display status badge with correct styling', () => {
    render(<CattleProfileCard cattle={mockCattle} age="2 years" />);

    const statusBadge = screen.getByText('active');
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800');
  });

  it('should display sold status correctly', () => {
    const soldCattle = { ...mockCattle, status: CattleStatus.SOLD };
    render(<CattleProfileCard cattle={soldCattle} age="2 years" />);

    const statusBadge = screen.getByText('sold');
    expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should display deceased status correctly', () => {
    const deceasedCattle = { ...mockCattle, status: CattleStatus.DECEASED };
    render(<CattleProfileCard cattle={deceasedCattle} age="2 years" />);

    const statusBadge = screen.getByText('deceased');
    expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800');
  });

  it('should show "No photo" when imageUrl is not provided', () => {
    render(<CattleProfileCard cattle={mockCattle} age="2 years" />);

    expect(screen.getByText('No photo')).toBeInTheDocument();
  });

  it('should display image when imageUrl is provided', () => {
    const cattleWithImage = { ...mockCattle, photoUrl: 'https://example.com/cow.jpg' };
    render(<CattleProfileCard cattle={cattleWithImage} age="2 years" />);

    const image = screen.getByAltText('Bessie');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/cow.jpg');
  });

  it('should display "Not recorded" when weight is not provided', () => {
    const cattleWithoutWeight = { ...mockCattle, metadata: { ...mockCattle.metadata, weight: undefined } };
    render(<CattleProfileCard cattle={cattleWithoutWeight} age="2 years" />);

    expect(screen.getByText('Not recorded')).toBeInTheDocument();
  });

  it('should display birth date', () => {
    render(<CattleProfileCard cattle={mockCattle} age="2 years" />);

    expect(screen.getByText(/Born/)).toBeInTheDocument();
  });

  it('should display location when provided', () => {
    render(<CattleProfileCard cattle={mockCattle} age="2 years" />);

    expect(screen.getByText('Barn A')).toBeInTheDocument();
  });

  it('should display notes when provided', () => {
    render(<CattleProfileCard cattle={mockCattle} age="2 years" />);

    expect(screen.getByText('Healthy and productive cow')).toBeInTheDocument();
  });

  it('should not display notes section when notes are not provided', () => {
    const cattleWithoutNotes = { ...mockCattle, metadata: { ...mockCattle.metadata, notes: undefined } };
    render(<CattleProfileCard cattle={cattleWithoutNotes} age="2 years" />);

    expect(screen.queryByText('Healthy and productive cow')).not.toBeInTheDocument();
  });
});