import React, { useEffect } from 'react';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { SyncEngine } from './services/syncEngine';

export const App: React.FC = () => {
  useEffect(() => {
    // Fire up the background sync loop when the application mounts
    SyncEngine.startBackgroundSync();

    return () => {
      // Clean up intervals if components unmount
      SyncEngine.stopBackgroundSync();
    };
  }, []);

  return <Dashboard />;
};

