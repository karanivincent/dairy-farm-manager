import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UsersIcon as UsersIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  EllipsisHorizontalIcon as EllipsisHorizontalIconSolid,
} from '@heroicons/react/24/solid';

const navigation = [
  { 
    name: 'Home', 
    href: '/', 
    icon: HomeIcon, 
    activeIcon: HomeIconSolid 
  },
  { 
    name: 'Cattle', 
    href: '/cattle', 
    icon: UsersIcon, 
    activeIcon: UsersIconSolid 
  },
  { 
    name: 'Production', 
    href: '/production', 
    icon: ChartBarIcon, 
    activeIcon: ChartBarIconSolid 
  },
  { 
    name: 'More', 
    href: '/menu', 
    icon: EllipsisHorizontalIcon, 
    activeIcon: EllipsisHorizontalIconSolid 
  },
];

export function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-40">
      <div className="grid grid-cols-4 gap-1">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            {({ isActive }) => {
              const Icon = isActive ? item.activeIcon : item.icon;
              return (
                <>
                  <Icon className="w-6 h-6" />
                  <span className="text-xs mt-1 font-medium">
                    {item.name}
                  </span>
                </>
              );
            }}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}