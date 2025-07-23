import { format, formatDistanceToNow } from 'date-fns';
import { CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import type { Cattle } from '../../types/cattle.types';

interface CattleCardProps {
  cattle: Cattle;
  onClick?: (cattle: Cattle) => void;
}

export function CattleCard({ cattle, onClick }: CattleCardProps) {
  const age = cattle.birthDate
    ? formatDistanceToNow(new Date(cattle.birthDate), { addSuffix: false })
    : 'Unknown age';

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    sold: 'bg-gray-100 text-gray-800',
    deceased: 'bg-red-100 text-red-800',
    dry: 'bg-yellow-100 text-yellow-800',
    pregnant: 'bg-blue-100 text-blue-800',
    culled: 'bg-orange-100 text-orange-800',
  };

  const genderDisplay = cattle.gender === 'male' ? '♂️ Bull' : '♀️ Cow';

  return (
    <div
      data-testid="cattle-card"
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
      onClick={() => onClick?.(cattle)}
    >
      {/* Image Section */}
      <div className="aspect-video bg-gray-200 relative">
        {cattle.photoUrl ? (
          <img
            src={cattle.photoUrl}
            alt={cattle.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-6xl">🐄</span>
          </div>
        )}
        <div
          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
            statusColors[cattle.status]
          }`}
        >
          {cattle.status.charAt(0).toUpperCase() + cattle.status.slice(1)}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{cattle.name}</h3>
          <span className="text-sm text-gray-500">{genderDisplay}</span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            <span>{cattle.tagNumber}</span>
          </div>
          
          {cattle.birthDate && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{age} old</span>
            </div>
          )}

          {cattle.breed && (
            <div className="text-gray-500">
              Breed: {cattle.breed}
            </div>
          )}
        </div>

        {/* Parent Info */}
        {(cattle.parentBull || cattle.parentCow) && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
            {cattle.parentBull && <div>Sire: {cattle.parentBull.name}</div>}
            {cattle.parentCow && <div>Dam: {cattle.parentCow.name}</div>}
          </div>
        )}
      </div>
    </div>
  );
}