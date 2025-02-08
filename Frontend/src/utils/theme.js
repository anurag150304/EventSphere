// @desc    Theme utility functions for managing application theme
import { storage } from './localStorage';

const THEME_KEY = 'app_theme';
const THEMES = ['light', 'dark', 'system'];

export const themeUtils = {
    // @desc    Get current theme preference
    getCurrentTheme: () => {
        return storage.get(THEME_KEY) || 'system';
    },

    // @desc    Set theme preference
    setTheme: (theme) => {
        if (!THEMES.includes(theme)) {
            throw new Error(`Invalid theme. Must be one of: ${THEMES.join(', ')}`);
        }

        storage.set(THEME_KEY, theme);
        themeUtils.applyTheme(theme);
    },

    // @desc    Apply theme to document
    applyTheme: (theme) => {
        const isDark = theme === 'dark' ||
            (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        document.documentElement.classList.toggle('dark', isDark);
    }
}; 