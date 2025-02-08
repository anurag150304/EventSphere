// @desc    Permission utility functions for role-based access control
import { storage } from './localStorage';

// @desc    Check if user has required role
export const hasRole = (user, requiredRole) => {
    if (!user) return false;
    if (requiredRole === 'guest') return true;
    if (requiredRole === 'user') return user.role !== 'guest';
    return user.role === requiredRole;
};

// @desc    Check if user can perform specific action
export const canPerformAction = (user, action) => {
    if (!user) return false;

    const permissions = {
        createEvent: ['admin', 'user'],
        editEvent: ['admin', 'user'],
        deleteEvent: ['admin', 'user'],
        manageUsers: ['admin'],
        viewAnalytics: ['admin']
    };

    const allowedRoles = permissions[action] || [];
    return allowedRoles.includes(user.role);
};

// @desc    Check if user owns a resource
export const isResourceOwner = (user, resource) => {
    if (!user || !resource) return false;
    return resource.creator === user._id || resource.creator?._id === user._id;
}; 