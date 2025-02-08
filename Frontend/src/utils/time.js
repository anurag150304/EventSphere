// @desc    Time utility functions for handling time-related operations
import { format, parseISO, differenceInMinutes, addMinutes } from 'date-fns';

// @desc    Format time to 12-hour format
export const formatTime12Hour = (time) => {
    if (!time) return '';
    return format(parseISO(`2000-01-01T${time}`), 'h:mm a');
};

// @desc    Format time to 24-hour format
export const formatTime24Hour = (time) => {
    if (!time) return '';
    return format(parseISO(`2000-01-01T${time}`), 'HH:mm');
};

// @desc    Get time slots for a given duration and interval
export const getTimeSlots = (startTime, endTime, intervalMinutes = 30) => {
    const slots = [];
    let currentTime = parseISO(`2000-01-01T${startTime}`);
    const end = parseISO(`2000-01-01T${endTime}`);

    while (differenceInMinutes(end, currentTime) >= 0) {
        slots.push(format(currentTime, 'HH:mm'));
        currentTime = addMinutes(currentTime, intervalMinutes);
    }

    return slots;
}; 