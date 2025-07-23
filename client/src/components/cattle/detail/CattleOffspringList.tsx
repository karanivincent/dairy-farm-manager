import { useNavigate } from 'react-router-dom';
import type { Cattle } from '../../../types/cattle.types';
import { Gender, CattleStatus } from '../../../types/cattle.types';
import { formatDate } from '../../../lib/utils/date';
import { ArrowRightIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { cn } from '../../../lib/utils';

interface CattleOffspringListProps {
  offspring: Cattle[];
}

export function CattleOffspringList({ offspring }: CattleOffspringListProps) {
  const navigate = useNavigate();

  if (offspring.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Offspring</h3>
        <p className="text-gray-500 text-center py-8">No offspring recorded</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">
        Offspring ({offspring.length})
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offspring.map((child) => (
          <div
            key={child.id}
            className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => navigate(`/cattle/${child.id}`)}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                  {child.name}
                </h4>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <TagIcon className="h-3 w-3 mr-1" />
                  {child.tagNumber}
                </div>
              </div>
              <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-3 w-3 mr-1" />
                Born {formatDate(child.birthDate)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {child.gender === Gender.MALE ? 'Bull' : 'Heifer'}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    child.status === CattleStatus.ACTIVE && 'bg-green-100 text-green-800',
                    child.status === CattleStatus.SOLD && 'bg-gray-100 text-gray-800',
                    child.status === CattleStatus.DECEASED && 'bg-red-100 text-red-800',
                    child.status === CattleStatus.DRY && 'bg-yellow-100 text-yellow-800',
                    child.status === CattleStatus.PREGNANT && 'bg-blue-100 text-blue-800',
                    child.status === CattleStatus.CULLED && 'bg-red-100 text-red-800'
                  )}
                >
                  {child.status}
                </span>
              </div>
              
              {child.breed && (
                <p className="text-sm text-gray-600">
                  Breed: <span className="font-medium">{child.breed}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}