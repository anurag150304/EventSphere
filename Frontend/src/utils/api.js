// @desc    API utility functions and error handling
import axios from 'axios';
import { toast } from 'react-hot-toast';

// @desc    Handle API errors consistently
export const handleApiError = (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    toast.error(message);
    return Promise.reject(error);
};

// @desc    Add auth token to requests
export const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }
}; 