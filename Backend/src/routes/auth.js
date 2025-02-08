import express from 'express';
import { register, login, getProfile, guestLogin, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRegistration } from '../middleware/validation.js';
import {
    updateNotificationPreferences,
    unsubscribeFromNotifications,
    getNotificationPreferences
} from '../controllers/notificationController.js';

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, register);
router.post('/login', login);
router.post('/guest-login', guestLogin);

// Protected routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

// Notification routes
router.get('/notifications/preferences', protect, getNotificationPreferences);
router.put('/notifications/preferences', protect, updateNotificationPreferences);
router.get('/notifications/unsubscribe/:token', unsubscribeFromNotifications);

export default router; 