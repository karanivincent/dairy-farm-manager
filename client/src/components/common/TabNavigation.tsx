import { useState } from 'react';
import { cn } from '../../lib/utils';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabNavigationProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  className?: string;
}

export function TabNavigation({ 
  tabs, 
  defaultTab, 
  onChange, 
  className 
}: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  return (
    <div className={cn('border-b', className)}>
      <div className="flex space-x-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            )}
          >
            {tab.icon && <span className="h-5 w-5">{tab.icon}</span>}
            {tab.label}
            {tab.badge !== undefined && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TabContent({ 
  activeTab, 
  tabId, 
  children 
}: { 
  activeTab: string; 
  tabId: string; 
  children: React.ReactNode;
}) {
  if (activeTab !== tabId) return null;
  return <>{children}</>;
}