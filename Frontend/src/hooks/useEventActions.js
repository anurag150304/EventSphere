// @desc    Custom hook for event-related actions
import { useDispatch } from 'react-redux';
import { eventsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

export const useEventActions = () => {
    const dispatch = useDispatch();

    // @desc    Handle event deletion
    const deleteEvent = async (eventId) => {
        try {
            await eventsAPI.deleteEvent(eventId);
            toast.success('Event deleted successfully');
            return true;
        } catch (error) {
            toast.error('Failed to delete event');
            return false;
        }
    };

    // @desc    Handle RSVP status update
    const updateRSVP = async (eventId, status) => {
        try {
            const response = await eventsAPI.rsvpToEvent(eventId, status);
            toast.success('RSVP updated successfully');
            return response;
        } catch (error) {
            toast.error('Failed to update RSVP');
            throw error;
        }
    };

    return {
        deleteEvent,
        updateRSVP
    };
}; 