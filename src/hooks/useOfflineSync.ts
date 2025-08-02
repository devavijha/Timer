import { getOfflineQueue, clearOfflineQueue } from '../utils/offlineQueue';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useEffect } from 'react';
// import { syncChangeToBackend } from '../services/syncService'; // Implement this for your backend

export function useOfflineSync() {
  const isConnected = useNetworkStatus();

  useEffect(() => {
    if (isConnected) {
      (async () => {
        const queue = await getOfflineQueue();
        for (const change of queue) {
          try {
            // await syncChangeToBackend(change); // Implement backend sync logic
          } catch (e) {
            // Optionally re-queue failed changes
          }
        }
        await clearOfflineQueue();
      })();
    }
  }, [isConnected]);
}
