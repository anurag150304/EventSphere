// @desc    Custom hook for handling keyboard events
import { useEffect, useState } from 'react';

export const useKeyPress = (targetKey) => {
    const [isKeyPressed, setIsKeyPressed] = useState(false);

    useEffect(() => {
        // @desc    Handle keydown event
        const handleKeyDown = ({ key }) => {
            if (key === targetKey) {
                setIsKeyPressed(true);
            }
        };

        // @desc    Handle keyup event
        const handleKeyUp = ({ key }) => {
            if (key === targetKey) {
                setIsKeyPressed(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [targetKey]);

    return isKeyPressed;
}; 