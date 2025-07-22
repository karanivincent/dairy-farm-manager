export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome to your farm management dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Cattle</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">15</p>
          <p className="text-sm text-gray-500 mt-1">Active animals</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Today's Production</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">120L</p>
          <p className="text-sm text-gray-500 mt-1">Milk collected</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Alerts</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">3</p>
          <p className="text-sm text-gray-500 mt-1">Require attention</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">$2,450</p>
          <p className="text-sm text-gray-500 mt-1">This month</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-900">Morning milking completed</span>
            <span className="text-sm text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-100">
            <span className="text-gray-900">Added new cattle: Bessie #016</span>
            <span className="text-sm text-gray-500">Yesterday</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-gray-900">Feed inventory updated</span>
            <span className="text-sm text-gray-500">2 days ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}