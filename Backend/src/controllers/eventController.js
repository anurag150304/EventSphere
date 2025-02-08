import Event from '../models/Event.js';
import User from '../models/User.js';
import RSVP from '../models/RSVP.js';
import { sendEventUpdateNotification, sendRSVPUpdateNotification } from '../services/emailService.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public
export const getEvents = async (req, res) => {
    try {
        const { category, date, search } = req.query;
        let query = {};

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by date
        if (date) {
            query.date = { $gte: new Date(date) };
        }

        // Search by name or description
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const events = await Event.find(query)
            .populate('creator', 'name email')
            .sort({ date: 1 });

        res.json({
            success: true,
            count: events.length,
            events
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('creator', 'name email')
            .populate('attendees.user', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
    try {
        const event = await Event.create({
            ...req.body,
            creator: req.user._id
        });

        // Add event to user's events array
        await User.findByIdAndUpdate(req.user._id, {
            $push: { events: event._id }
        });

        res.status(201).json({
            success: true,
            event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req, res) => {
    try {
        let event = await Event.findById(req.params.id)
            .populate('attendees.user', 'email notificationPreferences');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is event creator
        if (event.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this event'
            });
        }

        // Get the changes made to the event
        const changes = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (event[key] !== value) {
                changes[key] = value;
            }
        }

        event = await Event.findByIdAndUpdate(
            req.params.id,
            { ...req.body },
            { new: true, runValidators: true }
        );

        // Send notifications to confirmed attendees
        const confirmedAttendees = event.attendees.filter(a => a.status === 'confirmed');
        for (const attendee of confirmedAttendees) {
            if (attendee.user && attendee.user.notificationPreferences?.eventUpdates) {
                try {
                    await sendEventUpdateNotification(event, changes, attendee.user._id);
                } catch (error) {
                    console.error(`Failed to send update notification to ${attendee.user.email}:`, error);
                }
            }
        }

        res.json({
            success: true,
            event
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if user is event creator
        if (event.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this event'
            });
        }

        await event.deleteOne();

        // Remove event from user's events array
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { events: event._id }
        });

        // Remove all RSVPs for this event
        await RSVP.deleteMany({ event: event._id });

        res.json({
            success: true,
            message: 'Event removed'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    RSVP to event
// @route   POST /api/events/:id/rsvp
// @access  Private
export const rsvpToEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('creator', 'email notificationPreferences');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Check if event is full
        const confirmedAttendees = event.attendees.filter(
            a => a.status === 'confirmed'
        ).length;

        const status = confirmedAttendees >= event.capacity ? 'waitlist' : 'confirmed';

        // Create or update RSVP
        const rsvp = await RSVP.findOneAndUpdate(
            { event: event._id, user: req.user._id },
            { status },
            { upsert: true, new: true }
        );

        // Update event attendees
        await Event.findByIdAndUpdate(event._id, {
            $addToSet: {
                attendees: {
                    user: req.user._id,
                    status,
                    joinedAt: new Date()
                }
            }
        });

        // Update user's attending events
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { attendingEvents: event._id }
        });

        // Send notification to event creator
        if (event.creator && event.creator.notificationPreferences?.rsvpUpdates) {
            try {
                await sendRSVPUpdateNotification(event, req.user, status);
            } catch (error) {
                console.error('Failed to send RSVP notification:', error);
            }
        }

        res.json({
            success: true,
            rsvp
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Cancel RSVP
// @route   DELETE /api/events/:id/rsvp
// @access  Private
export const cancelRsvp = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        // Remove RSVP
        await RSVP.findOneAndDelete({
            event: event._id,
            user: req.user._id
        });

        // Remove user from event attendees
        await Event.findByIdAndUpdate(event._id, {
            $pull: {
                attendees: { user: req.user._id }
            }
        });

        // Remove event from user's attending events
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { attendingEvents: event._id }
        });

        res.json({
            success: true,
            message: 'RSVP cancelled'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
}; 