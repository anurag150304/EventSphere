// @desc    Redux store configuration with middleware setup
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import eventReducer from './slices/eventSlice';
import notificationReducer from './slices/notificationSlice';
import commentReducer from './slices/commentSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        events: eventReducer,
        notifications: notificationReducer,
        comments: commentReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false
        })
});

export default store; 