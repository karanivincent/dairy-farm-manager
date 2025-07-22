import { WifiIcon, SignalSlashIcon } from '@heroicons/react/24/outline';
import { useUIStore } from '../../store/ui.store';

export function OfflineIndicator() {
  const { isOnline, syncInProgress } = useUIStore();

  if (isOnline && !syncInProgress) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`
        flex items-center px-4 py-2 rounded-full shadow-lg border text-sm font-medium
        ${isOnline 
          ? 'bg-blue-50 text-blue-700 border-blue-200' 
          : 'bg-red-50 text-red-700 border-red-200'
        }
      `}>
        {syncInProgress ? (
          <>
            <div className="animate-spin w-4 h-4 mr-2">
              <div className="w-full h-full border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
            Syncing...
          </>
        ) : isOnline ? (
          <>
            <WifiIcon className="w-4 h-4 mr-2" />
            Online
          </>
        ) : (
          <>
            <SignalSlashIcon className="w-4 h-4 mr-2" />
            Offline
          </>
        )}
      </div>
    </div>
  );
}