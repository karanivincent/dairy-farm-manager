import type { Production } from '../../../types/production.types';
import { ChartBarIcon, ArrowTrendingUpIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../../lib/utils/date';

interface CattleProductionChartProps {
  productions: Production[];
}

export function CattleProductionChart({ productions }: CattleProductionChartProps) {
  if (!productions || productions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Production History</h3>
        <div className="text-center py-12 text-gray-500">
          <ChartBarIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No production data recorded</p>
        </div>
      </div>
    );
  }

  // Calculate total production and average
  const totalProduction = productions.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const avgProduction = totalProduction / productions.length;
  
  // Get recent productions (last 10)
  const recentProductions = productions.slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Production History</h3>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Production</p>
              <p className="text-2xl font-bold text-blue-900">
                {totalProduction.toFixed(1)} L
              </p>
            </div>
            <ChartBarIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Average per Session</p>
              <p className="text-2xl font-bold text-green-900">
                {avgProduction.toFixed(1)} L
              </p>
            </div>
            <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Sessions</p>
              <p className="text-2xl font-bold text-purple-900">
                {productions.length}
              </p>
            </div>
            <CalendarIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Productions List */}
      <div>
        <h4 className="font-medium text-gray-700 mb-3">Recent Productions</h4>
        <div className="space-y-2">
          {recentProductions.map((production) => (
            <div
              key={production.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <p className="font-medium text-gray-900">
                    {formatDate(production.date)}
                  </p>
                  <p className="text-gray-600">
                    {production.shift} shift
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {(production.quantity || 0).toFixed(1)} L
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          Interactive chart visualization will be implemented with Chart.js
        </p>
      </div>
    </div>
  );
}