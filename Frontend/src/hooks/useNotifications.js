// @desc    Custom hook for managing notification state and actions
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { notificationsAPI } from '../services/api';
import { toast } from 'react-hot-toast';

export const useNotifications = () => {
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);
    const { notifications } = useSelector(state => state.notifications);

    // @desc    Fetch user notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationsAPI.getNotifications();
            return response;
        } catch (error) {
            toast.error('Failed to fetch notifications');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // @desc    Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            await notificationsAPI.markAsRead(notificationId);
            toast.success('Notification marked as read');
        } catch (error) {
            toast.error('Failed to mark notification as read');
            throw error;
        }
    };

    return {
        notifications,
        loading,
        fetchNotifications,
        markAsRead
    };
}; 