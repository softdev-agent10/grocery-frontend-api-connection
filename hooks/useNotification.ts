'use client';

import { useState } from 'react';

interface NotificationState {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export function useNotification() {
    const [notification, setNotification] = useState<NotificationState | null>(null);

    const showNotification = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    return {
        notification,
        showNotification,
    };
}
