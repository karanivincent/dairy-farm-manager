import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatCard } from './StatCard';
import { ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Total Cattle" value={150} />);

    expect(screen.getByText('Total Cattle')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(
      <StatCard 
        title="Total Cattle" 
        value={150} 
        subtitle="Active animals"
      />
    );

    expect(screen.getByText('Active animals')).toBeInTheDocument();
  });

  it('should render icon when provided', () => {
    const { container } = render(
      <StatCard 
        title="Total Cattle" 
        value={150} 
        icon={<ArrowTrendingUpIcon data-testid="trend-icon" />}
      />
    );

    expect(container.querySelector('[data-testid="trend-icon"]')).toBeInTheDocument();
  });

  it('should display positive trend correctly', () => {
    render(
      <StatCard 
        title="Production" 
        value="1,250 L" 
        trend={{ value: 12.5, isPositive: true }}
      />
    );

    expect(screen.getByText('+12.5%')).toBeInTheDocument();
    expect(screen.getByText('+12.5%')).toHaveClass('text-green-600');
    expect(screen.getByText('from last month')).toBeInTheDocument();
  });

  it('should display negative trend correctly', () => {
    render(
      <StatCard 
        title="Production" 
        value="1,250 L" 
        trend={{ value: 8.3, isPositive: false }}
      />
    );

    expect(screen.getByText('8.3%')).toBeInTheDocument();
    expect(screen.getByText('8.3%')).toHaveClass('text-red-600');
  });

  it('should accept custom className', () => {
    const { container } = render(
      <StatCard 
        title="Total Cattle" 
        value={150} 
        className="custom-class"
      />
    );

    const card = container.firstChild;
    expect(card).toHaveClass('custom-class', 'bg-white', 'rounded-lg');
  });

  it('should handle string values', () => {
    render(<StatCard title="Status" value="Active" />);

    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should handle all props together', () => {
    render(
      <StatCard 
        title="Milk Production" 
        value="2,500 L"
        subtitle="This month"
        icon={<ArrowTrendingUpIcon />}
        trend={{ value: 15, isPositive: true }}
        className="production-stat"
      />
    );

    expect(screen.getByText('Milk Production')).toBeInTheDocument();
    expect(screen.getByText('2,500 L')).toBeInTheDocument();
    expect(screen.getByText('This month')).toBeInTheDocument();
    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('should not show trend section when trend is not provided', () => {
    render(<StatCard title="Total Cattle" value={150} />);

    expect(screen.queryByText('from last month')).not.toBeInTheDocument();
  });
});