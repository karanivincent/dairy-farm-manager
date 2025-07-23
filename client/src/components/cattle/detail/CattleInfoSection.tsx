import { useNavigate } from 'react-router-dom';
import type { Cattle } from '../../../types/cattle.types';
import { Gender } from '../../../types/cattle.types';
import { formatDate } from '../../../lib/utils/date';
import { ArrowRightIcon, CalendarIcon, CurrencyDollarIcon, TagIcon, HomeIcon } from '@heroicons/react/24/outline';

interface CattleInfoSectionProps {
  cattle: Cattle;
  offspringCount: number;
}

export function CattleInfoSection({ cattle, offspringCount }: CattleInfoSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Detailed Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Basic Information</h4>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 flex items-center">
                <TagIcon className="h-4 w-4 mr-2" />
                Tag Number
              </dt>
              <dd className="text-sm font-medium">{cattle.tagNumber}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Birth Date
              </dt>
              <dd className="text-sm font-medium">{cattle.birthDate ? formatDate(cattle.birthDate) : 'Unknown'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Breed</dt>
              <dd className="text-sm font-medium">{cattle.breed || 'Unknown'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Gender</dt>
              <dd className="text-sm font-medium">
                {cattle.gender === Gender.MALE ? 'Male' : 'Female'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600">Current Weight</dt>
              <dd className="text-sm font-medium">
                {cattle.metadata?.weight ? `${cattle.metadata.weight} kg` : 'Not recorded'}
              </dd>
            </div>
          </dl>
        </div>

        {/* Additional Information */}
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Additional Information</h4>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-600 flex items-center">
                <HomeIcon className="h-4 w-4 mr-2" />
                Origin
              </dt>
              <dd className="text-sm font-medium">
                {cattle.metadata?.purchaseDate ? 'Purchased' : 'Born on farm'}
              </dd>
            </div>
            {cattle.metadata?.purchaseDate && (
              <>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Purchase Date
                  </dt>
                  <dd className="text-sm font-medium">{formatDate(cattle.metadata.purchaseDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-600 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                    Purchase Price
                  </dt>
                  <dd className="text-sm font-medium">
                    ${cattle.metadata?.purchasePrice?.toLocaleString() || 'N/A'}
                  </dd>
                </div>
              </>
            )}
            {cattle.metadata?.location && (
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">Current Location</dt>
                <dd className="text-sm font-medium">{cattle.metadata.location}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Breeding Information */}
      <div className="mt-6 pt-6 border-t">
        <h4 className="font-medium text-gray-700 mb-3">Breeding Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Mother</p>
            {cattle.parentCowId ? (
              <button
                onClick={() => navigate(`/cattle/${cattle.parentCowId}`)}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View Details
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <p className="text-gray-900 font-medium">Unknown</p>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Father</p>
            {cattle.parentBullId ? (
              <button
                onClick={() => navigate(`/cattle/${cattle.parentBullId}`)}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
              >
                View Details
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </button>
            ) : (
              <p className="text-gray-900 font-medium">Unknown</p>
            )}
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Offspring</p>
            <p className="text-2xl font-bold text-gray-900">{offspringCount}</p>
          </div>
        </div>
      </div>
    </div>
  );
}