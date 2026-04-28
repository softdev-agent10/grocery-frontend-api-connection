// context/NotificationContext.tsx
'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotificationState {
    message: string;
    type: NotificationType;
}

interface NotificationContextValue {
    notification: NotificationState | null;
    showNotification: (message: string, type: NotificationType) => void;
    hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
    const [notification, setNotification] = useState<NotificationState | null>(null);

    const showNotification = (message: string, type: NotificationType) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const hideNotification = () => setNotification(null);

    return (
        <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
}