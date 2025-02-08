import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Event from '../models/Event.js';

// @desc    Protect routes - Verify JWT token and add user to request
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        next(error);
    }
};

// Middleware for admin routes
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as an admin'
        });
    }
};

// Middleware for full access (non-guest users)
export const fullAccess = (req, res, next) => {
    if (req.user && req.user.role !== 'guest') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'This feature requires a full account'
        });
    }
};

// Middleware to check if user can create events
export const canCreateEvent = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'user')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Guest users cannot create events'
        });
    }
};

// Middleware to check if user can edit/delete events
export const canManageEvent = async (req, res, next) => {
    try {
        if (req.user.role === 'admin') {
            return next();
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        if (event.creator.toString() === req.user._id.toString() && req.user.role === 'user') {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Not authorized to manage this event'
            });
        }
    } catch (error) {
        next(error);
    }
}; 