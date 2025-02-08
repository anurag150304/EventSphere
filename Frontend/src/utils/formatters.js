// @desc    Utility functions for formatting data
import { format, formatDistanceToNow } from 'date-fns';

// @desc    Format currency values
export const formatCurrency = (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency
    }).format(amount);
};

// @desc    Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// @desc    Format file size
export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}; 