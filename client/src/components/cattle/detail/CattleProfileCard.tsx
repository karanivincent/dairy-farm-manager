import type { Cattle } from '../../../types/cattle.types';
import { CattleStatus, Gender } from '../../../types/cattle.types';
import { cn } from '../../../lib/utils';
import { formatDate } from '../../../lib/utils/date';
import { CameraIcon, CalendarIcon, ScaleIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface CattleProfileCardProps {
  cattle: Cattle;
  age: string;
}

export function CattleProfileCard({ cattle, age }: CattleProfileCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div className="md:flex">
        {/* Photo Section */}
        <div className="md:w-1/3 bg-gray-100">
          <div className="aspect-square flex items-center justify-center">
            {cattle.photoUrl ? (
              <img
                src={cattle.photoUrl}
                alt={cattle.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">
                <CameraIcon className="h-16 w-16" />
                <p className="text-sm mt-2">No photo</p>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="md:w-2/3 p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{cattle.name}</h2>
              <p className="text-lg text-gray-600">Tag: {cattle.tagNumber}</p>
            </div>
            <span
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 md:mt-0',
                cattle.status === CattleStatus.ACTIVE && 'bg-green-100 text-green-800',
                cattle.status === CattleStatus.SOLD && 'bg-gray-100 text-gray-800',
                cattle.status === CattleStatus.DECEASED && 'bg-red-100 text-red-800',
                cattle.status === CattleStatus.DRY && 'bg-yellow-100 text-yellow-800',
                cattle.status === CattleStatus.PREGNANT && 'bg-blue-100 text-blue-800',
                cattle.status === CattleStatus.CULLED && 'bg-red-100 text-red-800'
              )}
            >
              {cattle.status}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600">Breed</p>
              <p className="font-medium">{cattle.breed || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium">
                {cattle.gender === Gender.MALE ? 'Male' : 'Female'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-medium">{age}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Weight</p>
              <p className="font-medium">
                {cattle.metadata?.weight ? `${cattle.metadata.weight} kg` : 'Not recorded'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center text-gray-600">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Born {cattle.birthDate ? formatDate(cattle.birthDate) : 'Unknown'}
            </div>
            {cattle.metadata?.weight && (
              <div className="flex items-center text-gray-600">
                <ScaleIcon className="h-4 w-4 mr-1" />
                {cattle.metadata.weight} kg
              </div>
            )}
            {cattle.metadata?.location && (
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {cattle.metadata.location}
              </div>
            )}
          </div>

          {cattle.metadata?.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{cattle.metadata.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}