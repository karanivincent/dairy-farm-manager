import { Bars3Icon } from '@heroicons/react/24/outline';
import { useUIStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';

export function MobileHeader() {
  const { setSidebarOpen } = useUIStore();
  const { user } = useAuthStore();

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

      <div className="flex items-center">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </span>
        </div>
      </div>
    </header>
  );
}