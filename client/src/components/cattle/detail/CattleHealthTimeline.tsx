import { HeartIcon, BeakerIcon, CubeIcon, ChartBarIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../../../lib/utils/date';

interface HealthEvent {
  id: string;
  date: string;
  type: 'vaccination' | 'checkup' | 'treatment' | 'test';
  description: string;
  veterinarian?: string;
  notes?: string;
}

interface CattleHealthTimelineProps {
  cattleId: string;
}

export function CattleHealthTimeline({ cattleId }: CattleHealthTimelineProps) {
  // Placeholder data - will be replaced with actual API call
  const healthEvents: HealthEvent[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'vaccination',
      description: 'Annual vaccination',
      veterinarian: 'Dr. Smith',
      notes: 'FMD and Brucellosis vaccines administered'
    },
    {
      id: '2',
      date: '2023-11-20',
      type: 'checkup',
      description: 'Routine health checkup',
      veterinarian: 'Dr. Johnson',
      notes: 'All vitals normal, weight recorded'
    }
  ];

  const getEventIcon = (type: HealthEvent['type']) => {
    switch (type) {
      case 'vaccination':
        return <BeakerIcon className="h-5 w-5" />;
      case 'checkup':
        return <HeartIcon className="h-5 w-5" />;
      case 'treatment':
        return <CubeIcon className="h-5 w-5" />;
      case 'test':
        return <ChartBarIcon className="h-5 w-5" />;
    }
  };

  const getEventColor = (type: HealthEvent['type']) => {
    switch (type) {
      case 'vaccination':
        return 'bg-blue-100 text-blue-800';
      case 'checkup':
        return 'bg-green-100 text-green-800';
      case 'treatment':
        return 'bg-orange-100 text-orange-800';
      case 'test':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold mb-4">Health Timeline</h3>
      
      {healthEvents.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <HeartIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>No health records available</p>
          <p className="text-sm mt-2">Health tracking will be implemented in a future update</p>
        </div>
      ) : (
        <div className="space-y-4">
          {healthEvents.map((event, index) => (
            <div key={event.id} className="relative">
              {index !== healthEvents.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200" />
              )}
              
              <div className="flex gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.description}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {formatDate(event.date)}
                        </span>
                        {event.veterinarian && (
                          <span>by {event.veterinarian}</span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                  
                  {event.notes && (
                    <p className="mt-2 text-sm text-gray-600">{event.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}