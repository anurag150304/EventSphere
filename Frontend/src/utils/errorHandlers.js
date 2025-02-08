// @desc    Utility functions for error handling and logging
import { toast } from 'react-hot-toast';

// @desc    Handle API errors with custom messages
export const handleApiError = (error, customMessage = null) => {
    const message = customMessage || error.response?.data?.message || 'An error occurred';
    toast.error(message);
    console.error('API Error:', error);
    return Promise.reject(error);
};

// @desc    Log errors to monitoring service
export const logError = (error, context = {}) => {
    console.error('Error:', {
        message: error.message,
        stack: error.stack,
        context
    });
    // Here you could add integration with error monitoring services like Sentry
};

// @desc    Handle form validation errors
export const handleFormError = (error) => {
    if (error.name === 'ValidationError') {
        Object.values(error.errors).forEach((err) => {
            toast.error(err.message);
        });
    } else {
        toast.error('Please check your form inputs');
    }
}; 