// @desc    Validation utility functions for forms
export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

// @desc    Validate password requirements
export const validatePassword = (password) => {
    return {
        isValid: password.length >= 6,
        message: password.length < 6 ? 'Password must be at least 6 characters' : ''
    };
};

// @desc    Validate event form data
export const validateEventForm = (formData) => {
    const errors = {};

    if (!formData.name?.trim()) {
        errors.name = 'Event name is required';
    }

    if (!formData.date) {
        errors.date = 'Event date is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
}; 