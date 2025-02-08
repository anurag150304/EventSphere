import express from 'express';
import { protect, fullAccess } from '../middleware/auth.js';
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Protected routes - all notification routes require authentication
router.use(protect);

// Basic notification routes - available to all authenticated users
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

// Advanced notification features - not available to guest users
router.put('/read-all', fullAccess, markAllAsRead);
router.delete('/:id', fullAccess, deleteNotification);

export default router; 