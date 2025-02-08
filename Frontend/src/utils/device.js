// @desc    Device utility functions for handling device-specific operations
export const deviceUtils = {
    // @desc    Check if device is mobile
    isMobile: () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
            .test(navigator.userAgent);
    },

    // @desc    Check if device supports touch events
    isTouchDevice: () => {
        return ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0);
    },

    // @desc    Get device orientation
    getOrientation: () => {
        if (window.screen && window.screen.orientation) {
            return window.screen.orientation.type;
        }
        return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    },

    // @desc    Check if device is online
    isOnline: () => {
        return navigator.onLine;
    },

    // @desc    Get device screen size category
    getScreenSize: () => {
        const width = window.innerWidth;
        if (width < 640) return 'xs';
        if (width < 768) return 'sm';
        if (width < 1024) return 'md';
        if (width < 1280) return 'lg';
        return 'xl';
    }
};
