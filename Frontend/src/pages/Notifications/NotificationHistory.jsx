import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { BellIcon, CheckCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import { notificationsAPI } from '../../services/api';
import {
    fetchNotificationsStart,
    fetchNotificationsSuccess,
    fetchNotificationsFailure,
    markAsReadSuccess,
    markAllAsReadSuccess,
    deleteNotificationSuccess
} from '../../store/slices/notificationSlice';
import { toast } from 'react-hot-toast';
import UpgradePrompt from '../../components/common/UpgradePrompt';

// @desc    Page component for displaying user notifications
export default function NotificationHistory() {
    const dispatch = useDispatch();
    const { notifications, loading, error, pagination } = useSelector((state) => state.notifications);
    const { user } = useSelector((state) => state.auth);
    const [currentPage, setCurrentPage] = useState(1);
    const isGuest = user?.role === 'guest';

    useEffect(() => {
        fetchNotifications(currentPage);
    }, [currentPage]);

    const fetchNotifications = async (page) => {
        try {
            dispatch(fetchNotificationsStart());
            const data = await notificationsAPI.getNotifications(page);
            dispatch(fetchNotificationsSuccess(data));
        } catch (error) {
            dispatch(fetchNotificationsFailure(error.message));
            toast.error('Failed to load notifications');
        }
    };

    // @desc    Mark notification as read
    const handleMarkAsRead = async (id) => {
        try {
            const notification = await notificationsAPI.markAsRead(id);
            dispatch(markAsReadSuccess(notification));
            toast.success('Notification marked as read');
        } catch (error) {
            toast.error('Failed to mark notification as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsAPI.markAllAsRead();
            dispatch(markAllAsReadSuccess());
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all notifications as read');
        }
    };

    // @desc    Delete notification
    const handleDelete = async (id) => {
        try {
            await notificationsAPI.deleteNotification(id);
            dispatch(deleteNotificationSuccess(id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'new_comment':
                return '💬';
            case 'event_update':
                return '📝';
            case 'event_reminder':
                return '⏰';
            case 'rsvp_confirmation':
                return '✅';
            case 'event_cancelled':
                return '❌';
            default:
                return '🔔';
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                        {notifications.length > 0 && !isGuest && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-sm text-purple-600 hover:text-purple-800"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {isGuest && (
                        <UpgradePrompt
                            message="Create a full account to access advanced notification features like marking all as read or deleting notifications."
                            className="mb-6"
                        />
                    )}

                    {loading && notifications.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600">{error}</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <BellIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <p>No notifications yet</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 rounded-lg border ${notification.isRead ? 'bg-gray-50' : 'bg-purple-50 border-purple-100'}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                            <span className="text-2xl">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div>
                                                <h3 className="font-medium text-gray-900">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {notification.message}
                                                </p>
                                                {notification.event && (
                                                    <Link
                                                        to={`/events/${notification.event}`}
                                                        className="text-sm text-purple-600 hover:text-purple-800 mt-1 inline-block"
                                                    >
                                                        View Event →
                                                    </Link>
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                    className="text-purple-600 hover:text-purple-800"
                                                    title="Mark as read"
                                                >
                                                    <CheckCircleIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                            {!isGuest && (
                                                <button
                                                    onClick={() => handleDelete(notification._id)}
                                                    className="text-gray-400 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    <TrashIcon className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {pagination.totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                            <nav className="flex space-x-2">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                                    (page) => (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`px-3 py-1 rounded ${currentPage === page
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}
                            </nav>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 