import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TabNavigation, TabContent } from './TabNavigation';
import { HomeIcon, UserIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

describe('TabNavigation', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1', icon: <HomeIcon className="h-5 w-5" /> },
    { id: 'tab2', label: 'Tab 2', icon: <UserIcon className="h-5 w-5" />, badge: 5 },
    { id: 'tab3', label: 'Tab 3', icon: <Cog6ToothIcon className="h-5 w-5" /> },
  ];

  it('should render all tabs', () => {
    render(<TabNavigation tabs={mockTabs} />);

    expect(screen.getByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 2')).toBeInTheDocument();
    expect(screen.getByText('Tab 3')).toBeInTheDocument();
  });

  it('should display badge when provided', () => {
    render(<TabNavigation tabs={mockTabs} />);

    const badge = screen.getByText('5');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-gray-100', 'text-gray-800');
  });

  it('should highlight the active tab', () => {
    render(<TabNavigation tabs={mockTabs} defaultTab="tab2" />);

    const tab2Button = screen.getByText('Tab 2').closest('button');
    expect(tab2Button).toHaveClass('border-blue-500', 'text-blue-600');

    const tab1Button = screen.getByText('Tab 1').closest('button');
    expect(tab1Button).toHaveClass('border-transparent', 'text-gray-500');
  });

  it('should call onChange when tab is clicked', () => {
    const mockOnChange = vi.fn();
    render(<TabNavigation tabs={mockTabs} onChange={mockOnChange} />);

    fireEvent.click(screen.getByText('Tab 2'));
    expect(mockOnChange).toHaveBeenCalledWith('tab2');
  });

  it('should switch active tab on click', () => {
    render(<TabNavigation tabs={mockTabs} />);

    const tab1Button = screen.getByText('Tab 1').closest('button');
    const tab2Button = screen.getByText('Tab 2').closest('button');

    // Initially tab1 should be active (first tab by default)
    expect(tab1Button).toHaveClass('border-blue-500');
    expect(tab2Button).toHaveClass('border-transparent');

    // Click tab2
    fireEvent.click(tab2Button!);

    // Now tab2 should be active
    expect(tab1Button).toHaveClass('border-transparent');
    expect(tab2Button).toHaveClass('border-blue-500');
  });

  it('should accept custom className', () => {
    const { container } = render(
      <TabNavigation tabs={mockTabs} className="custom-class" />
    );

    const tabContainer = container.firstChild;
    expect(tabContainer).toHaveClass('custom-class', 'border-b');
  });
});

describe('TabContent', () => {
  it('should render children when tab is active', () => {
    render(
      <TabContent activeTab="tab1" tabId="tab1">
        <div>Tab 1 Content</div>
      </TabContent>
    );

    expect(screen.getByText('Tab 1 Content')).toBeInTheDocument();
  });

  it('should not render children when tab is not active', () => {
    render(
      <TabContent activeTab="tab1" tabId="tab2">
        <div>Tab 2 Content</div>
      </TabContent>
    );

    expect(screen.queryByText('Tab 2 Content')).not.toBeInTheDocument();
  });

  it('should switch content when active tab changes', () => {
    const { rerender } = render(
      <>
        <TabContent activeTab="tab1" tabId="tab1">
          <div>Tab 1 Content</div>
        </TabContent>
        <TabContent activeTab="tab1" tabId="tab2">
          <div>Tab 2 Content</div>
        </TabContent>
      </>
    );

    expect(screen.getByText('Tab 1 Content')).toBeInTheDocument();
    expect(screen.queryByText('Tab 2 Content')).not.toBeInTheDocument();

    rerender(
      <>
        <TabContent activeTab="tab2" tabId="tab1">
          <div>Tab 1 Content</div>
        </TabContent>
        <TabContent activeTab="tab2" tabId="tab2">
          <div>Tab 2 Content</div>
        </TabContent>
      </>
    );

    expect(screen.queryByText('Tab 1 Content')).not.toBeInTheDocument();
    expect(screen.getByText('Tab 2 Content')).toBeInTheDocument();
  });
});