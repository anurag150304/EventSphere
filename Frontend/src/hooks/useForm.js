// @desc    Custom hook for form handling with validation
import { useState, useCallback } from 'react';
import { validateEventForm } from '../utils/validation';

export const useForm = (initialState = {}, validate = validateEventForm) => {
    const [values, setValues] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // @desc    Handle form field changes
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setValues(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when field is modified
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    // @desc    Validate form and return result
    const validateForm = useCallback(() => {
        const validationResult = validate(values);
        setErrors(validationResult.errors || {});
        return validationResult.isValid;
    }, [values, validate]);

    return {
        values,
        errors,
        isSubmitting,
        setIsSubmitting,
        handleChange,
        validateForm,
        setValues,
        setErrors
    };
}; 