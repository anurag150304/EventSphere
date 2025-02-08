// @desc    Custom hook for managing Socket.IO connections and events
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/config';

export const useSocket = (eventId) => {
    const socket = useRef(null);

    useEffect(() => {
        // @desc    Initialize socket connection
        socket.current = io(API_BASE_URL, {
            path: '/socket.io',
            withCredentials: true,
            transports: ['websocket', 'polling']
        });

        // @desc    Join event room if eventId is provided
        if (eventId) {
            socket.current.emit('joinEvent', eventId);
        }

        return () => {
            if (eventId) {
                socket.current.emit('leaveEvent', eventId);
            }
            socket.current.disconnect();
        };
    }, [eventId]);

    return socket.current;
}; 