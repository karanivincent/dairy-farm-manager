import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useAuthStore } from '../../store/auth.store';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Cattle', href: '/cattle', icon: UsersIcon },
  { name: 'Production', href: '/production', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">
          Farm Manager
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center mb-4" data-testid="user-menu-button">
          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.role}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleLogout}
          data-testid="logout-button"
          className="w-full flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
}