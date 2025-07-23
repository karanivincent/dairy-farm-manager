import { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CattleStatus, Gender, type CattleFilterDto } from '../../types/cattle.types';

interface CattleFiltersProps {
  filters: CattleFilterDto;
  onFiltersChange: (filters: Partial<CattleFilterDto>) => void;
  onReset: () => void;
}

export function CattleFilters({ filters, onFiltersChange, onReset }: CattleFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        onFiltersChange({ search });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, filters.search, onFiltersChange]);

  const hasActiveFilters = 
    filters.status || 
    filters.gender || 
    filters.breed || 
    filters.search;

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            data-testid="cattle-search"
            placeholder="Search by name or tag number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`px-4 py-2 rounded-lg border flex items-center gap-2 ${
            hasActiveFilters
              ? 'bg-green-50 border-green-300 text-green-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FunnelIcon className="h-5 w-5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-green-600 text-white text-xs rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900">Advanced Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={onReset}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status-filter"
                data-testid="status-filter"
                value={filters.status || ''}
                onChange={(e) => onFiltersChange({ status: e.target.value as CattleStatus || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {Object.values(CattleStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div>
              <label htmlFor="gender-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="gender-filter"
                data-testid="gender-filter"
                value={filters.gender || ''}
                onChange={(e) => onFiltersChange({ gender: e.target.value as Gender || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">All Genders</option>
                <option value={Gender.FEMALE}>Female</option>
                <option value={Gender.MALE}>Male</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort-select"
                data-testid="sort-select"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [any, any];
                  onFiltersChange({ sortBy, sortOrder });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="tagNumber-asc">Tag Number (Ascending)</option>
                <option value="tagNumber-desc">Tag Number (Descending)</option>
                <option value="birthDate-desc">Age (Oldest First)</option>
                <option value="birthDate-asc">Age (Youngest First)</option>
                <option value="createdAt-desc">Recently Added</option>
                <option value="createdAt-asc">Oldest Added</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}