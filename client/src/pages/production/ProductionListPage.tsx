export function ProductionListPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Tracking</h1>
          <p className="text-gray-600">Record and monitor milk production</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Record Production
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Production Records</h2>
        <div className="text-center py-8 text-gray-500">
          <p>Production tracking interface will be implemented here.</p>
          <p className="text-sm mt-2">This connects to the backend production API that's already built.</p>
        </div>
      </div>
    </div>
  );
}