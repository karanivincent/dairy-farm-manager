import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bars3Icon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';

export function MobileHeader() {
  const { setSidebarOpen } = useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4 z-30">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
        <h1 className="ml-3 text-lg font-semibold text-gray-900">
          Farm Manager
        </h1>
      </div>

      <div className="relative">
        <button
          data-testid="user-menu-button"
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <span className="text-white font-medium text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </button>

        {/* Dropdown Menu */}
        {showUserMenu && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowUserMenu(false)}
            />
            
            {/* Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
              
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                data-testid="logout-button"
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}