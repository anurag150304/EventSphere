// @desc    Utility functions for date formatting and manipulation
import { format, parseISO, differenceInDays } from 'date-fns';

// @desc    Format date to display format
export const formatDate = (date) => {
    return format(parseISO(date), 'MMMM d, yyyy');
};

// @desc    Format time to display format
export const formatTime = (time) => {
    return format(parseISO(time), 'h:mm a');
};

// @desc    Calculate days until event
export const getDaysUntilEvent = (eventDate) => {
    return differenceInDays(parseISO(eventDate), new Date());
}; 