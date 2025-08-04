import { useFormContext } from 'react-hook-form';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cattleApi } from '../../../lib/api/cattle.api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export function BreedingDetailsStep() {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  const [bullSearch, setBullSearch] = useState('');
  const [cowSearch, setCowSearch] = useState('');

  const parentBullId = watch('parentBullId');
  const parentCowId = watch('parentCowId');

  // Search for male parents (bulls)
  const { data: bulls = [] } = useQuery({
    queryKey: ['cattle', 'parents', 'male', bullSearch],
    queryFn: () => cattleApi.searchForParents('male', bullSearch),
    enabled: bullSearch.length >= 0,
  });

  // Search for female parents (cows)
  const { data: cows = [] } = useQuery({
    queryKey: ['cattle', 'parents', 'female', cowSearch],
    queryFn: () => cattleApi.searchForParents('female', cowSearch),
    enabled: cowSearch.length >= 0,
  });

  // Get selected parent details
  const selectedBull = bulls.find(b => b.id === parentBullId);
  const selectedCow = cows.find(c => c.id === parentCowId);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Breeding Details</h3>
      
      {/* Parent Bull Selection */}
      <div>
        <label htmlFor="parentBull" className="block text-sm font-medium text-gray-700">
          Sire (Father)
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="parentBull"
            value={bullSearch}
            onChange={(e) => setBullSearch(e.target.value)}
            placeholder="Search for bull by name or tag..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        
        {bulls.length > 0 && !selectedBull && (
          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            {bulls.map((bull) => (
              <button
                key={bull.id}
                type="button"
                onClick={() => {
                  setValue('parentBullId', bull.id);
                  setBullSearch(bull.name);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="font-medium text-sm">{bull.name}</div>
                <div className="text-xs text-gray-500">Tag: {bull.tagNumber}</div>
              </button>
            ))}
          </div>
        )}
        
        {selectedBull && (
          <div className="mt-2 p-2 bg-green-50 rounded-md text-sm">
            Selected: {selectedBull.name} (Tag: {selectedBull.tagNumber})
            <button
              type="button"
              onClick={() => {
                setValue('parentBullId', undefined);
                setBullSearch('');
              }}
              className="ml-2 text-green-600 hover:text-green-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Parent Cow Selection */}
      <div>
        <label htmlFor="parentCow" className="block text-sm font-medium text-gray-700">
          Dam (Mother)
        </label>
        <div className="mt-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="parentCow"
            value={cowSearch}
            onChange={(e) => setCowSearch(e.target.value)}
            placeholder="Search for cow by name or tag..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
          />
        </div>
        
        {cows.length > 0 && !selectedCow && (
          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
            {cows.map((cow) => (
              <button
                key={cow.id}
                type="button"
                onClick={() => {
                  setValue('parentCowId', cow.id);
                  setCowSearch(cow.name);
                }}
                className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
              >
                <div className="font-medium text-sm">{cow.name}</div>
                <div className="text-xs text-gray-500">Tag: {cow.tagNumber}</div>
              </button>
            ))}
          </div>
        )}
        
        {selectedCow && (
          <div className="mt-2 p-2 bg-green-50 rounded-md text-sm">
            Selected: {selectedCow.name} (Tag: {selectedCow.tagNumber})
            <button
              type="button"
              onClick={() => {
                setValue('parentCowId', undefined);
                setCowSearch('');
              }}
              className="ml-2 text-green-600 hover:text-green-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Birth Weight */}
      <div>
        <label htmlFor="birthWeight" className="block text-sm font-medium text-gray-700">
          Birth Weight (kg)
        </label>
        <input
          type="number"
          id="birthWeight"
          step="0.1"
          min="0"
          {...register('birthWeight')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          placeholder="e.g., 35.5"
        />
      </div>

      {/* Birth Type */}
      <div>
        <label htmlFor="birthType" className="block text-sm font-medium text-gray-700">
          Birth Type
        </label>
        <select
          id="birthType"
          {...register('birthType')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        >
          <option value="">Select birth type</option>
          <option value="single">Single</option>
          <option value="twin">Twin</option>
        </select>
      </div>
    </div>
  );
}