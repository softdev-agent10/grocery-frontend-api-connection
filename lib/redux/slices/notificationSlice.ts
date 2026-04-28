import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Notification {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number; // milliseconds
    timestamp: number;
}

interface NotificationState {
    notifications: Notification[];
}

const initialState: NotificationState = {
    notifications: [],
};

let notificationId = 0;

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
            const notification: Notification = {
                id: `notification-${notificationId++}`,
                timestamp: Date.now(),
                ...action.payload,
            };
            state.notifications.push(notification);
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
    },
});

export const { addNotification, removeNotification, clearNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
