import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get user's notification preferences
// @route   GET /api/auth/notifications/preferences
// @access  Private
export const getNotificationPreferences = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('notificationPreferences');
        res.json({
            success: true,
            preferences: user.notificationPreferences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update user's notification preferences
// @route   PUT /api/auth/notifications/preferences
// @access  Private
export const updateNotificationPreferences = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                notificationPreferences: {
                    ...req.user.notificationPreferences,
                    ...req.body
                }
            },
            { new: true }
        ).select('notificationPreferences');

        res.json({
            success: true,
            preferences: user.notificationPreferences
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Unsubscribe from notifications using token
// @route   GET /api/auth/notifications/unsubscribe/:token
// @access  Public
export const unsubscribeFromNotifications = async (req, res) => {
    try {
        const user = await User.findOne({ unsubscribeToken: req.params.token });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Invalid or expired unsubscribe token'
            });
        }

        // Disable all notifications
        user.notificationPreferences = {
            eventComments: false,
            commentReplies: false,
            eventUpdates: false,
            eventReminders: false,
            rsvpUpdates: false
        };

        // Clear the unsubscribe token
        user.unsubscribeToken = undefined;
        await user.save();

        res.json({
            success: true,
            message: 'Successfully unsubscribed from all notifications'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get user notifications with pagination
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({ user: req.user._id });

        res.json({
            notifications,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        notification.isRead = true;
        await notification.save();

        res.json(notification);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        await notification.deleteOne();
        res.json({
            success: true,
            message: 'Notification removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
}; 