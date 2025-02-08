import axios from 'axios';
import { API_BASE_URL } from '../config/config';

// @desc    Base API configuration with authentication
const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10_000
});

// @desc    Upload API configuration for handling file uploads
const uploadApi = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    withCredentials: true,
    headers: {
        'Content-Type': 'multipart/form-data',
    },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

uploadApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 502) {
            console.error('Server is unavailable. Please try again later.');
        } else if (error.code === 'ERR_NETWORK') {
            console.error('Network error. Please check your connection.');
        }
        return Promise.reject(error);
    }
);

// @desc    API service for file upload operations
export const uploadAPI = {
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await uploadApi.post('/upload', formData);
        return response.data;
    }
};

// @desc    API service for authentication related requests
export const authAPI = {
    // @desc    Register new user
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },

    // @desc    Login user with credentials
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    guestLogin: async () => {
        const response = await api.post('/auth/guest-login');
        return response.data;
    },
    getProfile: async () => {
        const response = await api.get('/auth/profile');
        return response.data;
    },
    updateProfile: async (userData) => {
        const response = await api.put('/auth/profile', userData);
        return response.data;
    },
};

// Events API
export const eventsAPI = {
    getEvents: async (params) => {
        const response = await api.get('/events', { params });
        return response.data;
    },
    getEvent: async (id) => {
        const response = await api.get(`/events/${id}`);
        return response.data;
    },
    createEvent: async (eventData) => {
        const response = await api.post('/events', eventData);
        return response.data;
    },
    updateEvent: async (id, eventData) => {
        const response = await api.put(`/events/${id}`, eventData);
        return response.data;
    },
    deleteEvent: async (id) => {
        const response = await api.delete(`/events/${id}`);
        return response.data;
    },
    rsvpToEvent: async (id) => {
        const response = await api.post(`/events/${id}/rsvp`);
        return response.data;
    },
    cancelRsvp: async (id) => {
        const response = await api.delete(`/events/${id}/rsvp`);
        return response.data;
    },
};

// Comments API
export const commentsAPI = {
    getEventComments: async (eventId) => {
        const response = await api.get(`/events/${eventId}/comments`);
        return response.data;
    },
    createComment: async (eventId, commentData) => {
        const response = await api.post(`/events/${eventId}/comments`, commentData);
        return response.data;
    },
    updateComment: async (eventId, commentId, content) => {
        const response = await api.put(`/events/${eventId}/comments/${commentId}`, { content });
        return response.data;
    },
    deleteComment: async (eventId, commentId) => {
        const response = await api.delete(`/events/${eventId}/comments/${commentId}`);
        return response.data;
    },
    toggleLike: async (eventId, commentId) => {
        const response = await api.post(`/events/${eventId}/comments/${commentId}/like`);
        return response.data;
    },
};

// Notifications API
export const notificationsAPI = {
    getNotifications: async (page = 1, limit = 10) => {
        const response = await api.get('/notifications', { params: { page, limit } });
        return response.data;
    },
    markAsRead: async (id) => {
        const response = await api.put(`/notifications/${id}/read`);
        return response.data;
    },
    markAllAsRead: async () => {
        const response = await api.put('/notifications/read-all');
        return response.data;
    },
    deleteNotification: async (id) => {
        const response = await api.delete(`/notifications/${id}`);
        return response.data;
    },
    getNotificationPreferences: async () => {
        const response = await api.get('/auth/notifications/preferences');
        return response.data;
    },
    updateNotificationPreferences: async (preferences) => {
        const response = await api.put('/auth/notifications/preferences', preferences);
        return response.data;
    },
    updateNotificationTiming: async (timing) => {
        const response = await api.put('/auth/notifications/timing', timing);
        return response.data;
    }
};

export default api; 