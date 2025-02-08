import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    notifications: [],
    loading: false,
    error: null,
    pagination: {
        currentPage: 1,
        totalPages: 1,
        total: 0
    }
};

// @desc    Redux slice for managing notifications state
const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        // @desc    Start notifications fetch
        fetchNotificationsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchNotificationsSuccess: (state, action) => {
            state.loading = false;
            state.notifications = action.payload.notifications;
            state.pagination = {
                currentPage: action.payload.currentPage,
                totalPages: action.payload.totalPages,
                total: action.payload.total
            };
        },
        fetchNotificationsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Mark notification as read
        markAsReadSuccess: (state, action) => {
            const notification = state.notifications.find(n => n._id === action.payload._id);
            if (notification) {
                notification.isRead = true;
            }
        },

        // Mark all notifications as read
        markAllAsReadSuccess: (state) => {
            state.notifications.forEach(notification => {
                notification.isRead = true;
            });
        },

        // Delete notification
        deleteNotificationSuccess: (state, action) => {
            state.notifications = state.notifications.filter(
                notification => notification._id !== action.payload
            );
            state.pagination.total -= 1;
        },

        // Add new notification (for real-time updates)
        addNotification: (state, action) => {
            state.notifications.unshift(action.payload);
            state.pagination.total += 1;
        },

        // Clear notifications
        clearNotifications: (state) => {
            state.notifications = [];
            state.loading = false;
            state.error = null;
            state.pagination = {
                currentPage: 1,
                totalPages: 1,
                total: 0
            };
        }
    }
});

export const {
    fetchNotificationsStart,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
    markAsReadSuccess,
    markAllAsReadSuccess,
    deleteNotificationSuccess,
    addNotification,
    clearNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer; 