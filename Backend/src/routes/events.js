import express from 'express';
import {
    getEvents,
    getEvent,
    createEvent,
    updateEvent,
    deleteEvent,
    rsvpToEvent,
    cancelRsvp
} from '../controllers/eventController.js';
import { protect, canCreateEvent, canManageEvent } from '../middleware/auth.js';
import { validateEvent } from '../middleware/validation.js';
import commentRoutes from './comments.js';

const router = express.Router();

// Re-route into comment routes
router.use('/:eventId/comments', commentRoutes);

// Public routes
router.get('/', getEvents);
router.get('/:id', getEvent);

// Protected routes
router.post('/', protect, canCreateEvent, validateEvent, createEvent);
router.put('/:id', protect, canManageEvent, validateEvent, updateEvent);
router.delete('/:id', protect, canManageEvent, deleteEvent);

// RSVP routes - available to all authenticated users including guests
router.post('/:id/rsvp', protect, rsvpToEvent);
router.delete('/:id/rsvp', protect, cancelRsvp);

export default router; 