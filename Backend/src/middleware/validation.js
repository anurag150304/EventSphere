export const validateRegistration = (req, res, next) => {
    const { name, email, password } = req.body;

    const errors = [];

    if (!name || name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    if (!email || !email.match(/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/)) {
        errors.push('Please provide a valid email address');
    }

    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

export const validateEvent = (req, res, next) => {
    const { name, description, date, time, location, category, capacity } = req.body;

    const errors = [];

    if (!name || name.trim().length < 3) {
        errors.push('Event name must be at least 3 characters long');
    }

    if (!description || description.trim().length < 10) {
        errors.push('Description must be at least 10 characters long');
    }

    if (!date) {
        errors.push('Event date is required');
    }

    if (!time) {
        errors.push('Event time is required');
    }

    if (!location || !location.address || !location.city || !location.country) {
        errors.push('Complete location details are required');
    }

    if (!category || !['conference', 'workshop', 'social', 'sports', 'other'].includes(category)) {
        errors.push('Valid category is required');
    }

    if (!capacity || capacity < 1) {
        errors.push('Capacity must be at least 1');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
}; 