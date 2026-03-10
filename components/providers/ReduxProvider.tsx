'use client';

import { Provider } from 'react-redux';
import { store } from '@/lib/redux/store';
import { useEffect } from 'react';
import { initSyncListener } from '@/lib/redux/sync';

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize cross-tab synchronization
    const cleanup = initSyncListener(store.dispatch);
    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
