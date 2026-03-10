'use client';

import { Middleware } from '@reduxjs/toolkit';

const SYNC_CHANNEL = 'redux_sales_sync';
const TAB_ID = typeof window !== 'undefined' ? Math.random().toString(36).substring(2, 11) : 'server';

// Middleware to broadcast actions to other tabs
export const syncMiddleware: Middleware = (store) => {
  let channel: BroadcastChannel | null = null;

  if (typeof window !== 'undefined') {
    channel = new BroadcastChannel(SYNC_CHANNEL);
  }

  return (next) => (action: any) => {
    // Only sync actions from the 'sales' slice and ignore the sync action itself
    if (
      action.type.startsWith('sales/') && 
      !action.meta?.isSyncAction
    ) {
      if (channel) {
        channel.postMessage({
          ...action,
          meta: { ...action.meta, senderId: TAB_ID }
        });
      }
    }
    return next(action);
  };
};

// Function to initialize the listener in other tabs
export const initSyncListener = (dispatch: any) => {
  if (typeof window === 'undefined') return;

  const channel = new BroadcastChannel(SYNC_CHANNEL);
  channel.onmessage = (event) => {
    const action = event.data;
    
    // Ignore messages from the same tab/instance
    if (action && action.type && action.meta?.senderId !== TAB_ID) {
      // Dispatch the action with a meta flag to prevent infinite loops
      dispatch({
        ...action,
        meta: { ...action.meta, isSyncAction: true },
      });
    }
  };

  return () => channel.close();
};
