import { useFormContext } from 'react-hook-form';
import { CattleStatus } from '../../../types/cattle.types';

const statusDescriptions: Record<CattleStatus, string> = {
  [CattleStatus.ACTIVE]: 'Healthy and actively producing',
  [CattleStatus.DRY]: 'Not currently producing milk',
  [CattleStatus.PREGNANT]: 'Currently pregnant',
  [CattleStatus.SOLD]: 'Sold to another farm',
  [CattleStatus.DECEASED]: 'No longer alive',
  [CattleStatus.CULLED]: 'Removed from production',
};

const statusColors: Record<CattleStatus, string> = {
  [CattleStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
  [CattleStatus.DRY]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [CattleStatus.PREGNANT]: 'bg-blue-100 text-blue-800 border-blue-200',
  [CattleStatus.SOLD]: 'bg-gray-100 text-gray-800 border-gray-200',
  [CattleStatus.DECEASED]: 'bg-red-100 text-red-800 border-red-200',
  [CattleStatus.CULLED]: 'bg-orange-100 text-orange-800 border-orange-200',
};

export function HealthStatusStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const selectedStatus = watch('status') || CattleStatus.ACTIVE;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Health Status</h3>
      
      {/* Status Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Current Status <span className="text-red-500">*</span>
        </label>
        
        <div className="space-y-2">
          {Object.values(CattleStatus).map((status) => (
            <label
              key={status}
              className={`
                relative flex items-start p-4 border rounded-lg cursor-pointer
                ${selectedStatus === status ? 'ring-2 ring-green-500' : ''}
                hover:bg-gray-50
              `}
            >
              <input
                type="radio"
                value={status}
                checked={selectedStatus === status}
                onChange={(e) => setValue('status', e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <div
                    className={`
                      h-4 w-4 rounded-full border-2
                      ${selectedStatus === status ? 'border-green-500 bg-green-500' : 'border-gray-300 bg-white'}
                    `}
                  >
                    {selectedStatus === status && (
                      <div className="h-2 w-2 m-0.5 rounded-full bg-white" />
                    )}
                  </div>
                </div>
                <div className="ml-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}>
                    {status}
                  </span>
                  <p className="mt-1 text-sm text-gray-500">
                    {statusDescriptions[status]}
                  </p>
                </div>
              </div>
            </label>
          ))}
        </div>
        
        {errors.status?.message && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message as string}</p>
        )}
      </div>

      {/* Health Notes */}
      <div>
        <label htmlFor="healthNotes" className="block text-sm font-medium text-gray-700">
          Health Notes
        </label>
        <textarea
          id="healthNotes"
          rows={4}
          {...register('healthNotes')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
          placeholder="Enter any health-related notes, vaccination records, or medical history..."
        />
        <p className="mt-1 text-xs text-gray-500">
          Optional: Add any relevant health information or observations
        </p>
      </div>

      {/* Special Instructions based on Status */}
      {selectedStatus === CattleStatus.PREGNANT && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-blue-900">Pregnancy Information</h4>
          <p className="mt-1 text-sm text-blue-700">
            Remember to record the expected calving date and update breeding records.
          </p>
        </div>
      )}

      {selectedStatus === CattleStatus.DRY && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="text-sm font-medium text-yellow-900">Dry Period</h4>
          <p className="mt-1 text-sm text-yellow-700">
            Cattle in dry period should be monitored for proper nutrition and health.
          </p>
        </div>
      )}
    </div>
  );
}