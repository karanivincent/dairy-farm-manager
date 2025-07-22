import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { BottomNavigation } from './BottomNavigation';
import { OfflineIndicator } from './OfflineIndicator';
import { useUIStore } from '../../store/ui.store';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export function AppLayout() {
  const { sidebarOpen, setSidebarOpen, bottomNavVisible } = useUIStore();
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    if (!isDesktop && sidebarOpen) {
      const handleClickOutside = () => setSidebarOpen(false);
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDesktop, sidebarOpen, setSidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {isDesktop && <Sidebar />}
      
      {/* Mobile Header */}
      {!isDesktop && <MobileHeader />}
      
      {/* Mobile Sidebar Overlay */}
      {!isDesktop && sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full z-50">
            <Sidebar />
          </div>
        </>
      )}

      {/* Main Content */}
      <main 
        className={`
          ${isDesktop ? 'ml-64' : 'mt-16'}
          p-4 min-h-screen
          ${bottomNavVisible && !isDesktop ? 'pb-20' : 'pb-4'}
        `}
      >
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      {!isDesktop && bottomNavVisible && <BottomNavigation />}
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}