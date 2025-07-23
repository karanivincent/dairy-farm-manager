import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { useCattleStore } from '../../store/cattle.store';
import { cattleApi } from '../../lib/api/cattle.api';
import { CattleCard } from '../../components/cattle/CattleCard';
import { CattleFilters } from '../../components/cattle/CattleFilters';
import { Pagination } from '../../components/common/Pagination';
import { CattleListSkeleton } from '../../components/cattle/CattleCardSkeleton';
import toast from 'react-hot-toast';

export function CattleListPage() {
  const navigate = useNavigate();
  const {
    cattle,
    total,
    page,
    totalPages,
    filters,
    viewMode,
    setFilters,
    resetFilters,
    setCattle,
    setViewMode,
    setLoading,
    setError,
  } = useCattleStore();

  // Fetch cattle data
  const { data, isLoading, error } = useQuery({
    queryKey: ['cattle', filters],
    queryFn: () => cattleApi.getAll(filters),
  });

  // Update store when data changes
  useEffect(() => {
    if (data) {
      setCattle(data.items, data.total, data.page, data.totalPages);
    }
  }, [data, setCattle]);

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    setError(error ? error.message : null);
    if (error) {
      toast.error('Failed to load cattle');
    }
  }, [error, setError]);

  const handleCattleClick = (cattle: any) => {
    navigate(`/cattle/${cattle.id}`);
  };

  const handleAddCattle = () => {
    navigate('/cattle/add');
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  const isEmpty = !isLoading && cattle.length === 0;
  const hasFilters = filters.search || filters.status || filters.gender || filters.breed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cattle Management</h1>
          <p className="text-gray-600">
            {total > 0 ? `${total} cattle in your inventory` : 'Manage your cattle inventory'}
          </p>
        </div>
        <button
          onClick={handleAddCattle}
          data-testid="add-cattle-button"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Add Cattle
        </button>
      </div>

      {/* Filters */}
      <CattleFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />

      {/* View Mode Toggle */}
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setViewMode('grid')}
          data-testid="view-toggle-grid"
          className={`p-2 rounded ${
            viewMode === 'grid'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Grid view"
        >
          <Squares2X2Icon className="h-5 w-5" />
        </button>
        <button
          onClick={() => setViewMode('list')}
          data-testid="view-toggle-list"
          className={`p-2 rounded ${
            viewMode === 'list'
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="List view"
        >
          <ListBulletIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {isLoading ? (
          <div className="p-6">
            <CattleListSkeleton count={filters.limit} />
          </div>
        ) : isEmpty ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {hasFilters ? 'No cattle found' : 'No cattle yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {hasFilters
                ? 'Try adjusting your filters or search terms'
                : 'Add your first cattle to get started'}
            </p>
            {!hasFilters && (
              <button
                onClick={handleAddCattle}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Add First Cattle
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div 
                data-testid="cattle-grid"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
              >
                {cattle.map((item) => (
                  <CattleCard
                    key={item.id}
                    cattle={item}
                    onClick={handleCattleClick}
                  />
                ))}
              </div>
            ) : (
              <div data-testid="cattle-list" className="divide-y divide-gray-200">
                {cattle.map((item) => (
                  <div
                    key={item.id}
                    data-testid="cattle-card"
                    className="p-4 hover:bg-gray-50 cursor-pointer flex items-center gap-4"
                    onClick={() => handleCattleClick(item)}
                  >
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl">
                          🐄
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        {item.tagNumber} • {item.gender === 'male' ? 'Bull' : 'Cow'} • {item.breed || 'Unknown breed'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  totalItems={total}
                  pageSize={filters.limit}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}