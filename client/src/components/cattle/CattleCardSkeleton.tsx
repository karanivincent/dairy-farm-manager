export function CattleCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-video bg-gray-300" />
      
      {/* Content skeleton */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="h-6 bg-gray-300 rounded w-32" />
          <div className="h-4 bg-gray-300 rounded w-16" />
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded w-24" />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded w-20" />
          </div>
          
          <div className="h-4 bg-gray-300 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

export function CattleListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CattleCardSkeleton key={index} />
      ))}
    </div>
  );
}