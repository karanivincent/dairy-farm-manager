import { useFormContext } from 'react-hook-form';
import { Gender } from '../../../types/cattle.types';
import { useQuery } from '@tanstack/react-query';
import { cattleApi } from '../../../lib/api/cattle.api';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';

export function BasicInfoStep() {
  const location = useLocation();
  const isEditMode = location.pathname.includes('/edit');
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext();

  const tagNumber = watch('tagNumber');
  const birthDate = watch('birthDate');

  // Check for duplicate tag number (only in add mode)
  const { data: tagCheckData } = useQuery({
    queryKey: ['cattle', 'check-tag', tagNumber],
    queryFn: () => cattleApi.checkTagNumber(tagNumber),
    enabled: !isEditMode && !!tagNumber && tagNumber.length > 0,
    staleTime: 0,
  });

  // Get list of breeds
  const { data: breeds = [] } = useQuery({
    queryKey: ['cattle', 'breeds'],
    queryFn: () => cattleApi.getBreeds(),
  });

  // Calculate age
  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null;
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 30) {
      return `${ageInDays} days`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const months = Math.floor((ageInDays % 365) / 30);
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
  };

  const age = birthDate ? calculateAge(birthDate) : null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
      
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          placeholder="e.g., Bessie"
        />
        {errors.name?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message as string}</p>
        )}
      </div>

      {/* Tag Number */}
      <div>
        <label htmlFor="tagNumber" className="block text-sm font-medium text-gray-700">
          Tag Number <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="tagNumber"
          {...register('tagNumber')}
          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-green-500 sm:text-sm ${
            tagCheckData?.exists 
              ? 'border-red-300 focus:border-red-500' 
              : 'border-gray-300 focus:border-green-500'
          }`}
          placeholder="e.g., COW-001"
        />
        {errors.tagNumber?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.tagNumber.message as string}</p>
        )}
        {tagCheckData?.exists && (
          <div className="mt-1 flex items-center text-sm text-red-600">
            <ExclamationCircleIcon className="h-4 w-4 mr-1" />
            This tag number already exists
          </div>
        )}
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
          Gender <span className="text-red-500">*</span>
        </label>
        <select
          id="gender"
          {...register('gender')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        >
          <option value={Gender.FEMALE}>Female</option>
          <option value={Gender.MALE}>Male</option>
        </select>
        {errors.gender?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.gender.message as string}</p>
        )}
      </div>

      {/* Birth Date */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
          Birth Date
        </label>
        <input
          type="date"
          id="birthDate"
          {...register('birthDate')}
          max={new Date().toISOString().split('T')[0]}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        />
        {age && (
          <p className="mt-1 text-sm text-gray-500">Age: {age}</p>
        )}
      </div>

      {/* Breed */}
      <div>
        <label htmlFor="breed" className="block text-sm font-medium text-gray-700">
          Breed
        </label>
        <select
          id="breed"
          {...register('breed')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
        >
          <option value="">Select a breed</option>
          {breeds.map((breed) => (
            <option key={breed} value={breed}>
              {breed}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}