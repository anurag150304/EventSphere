import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/config';

// @desc    Socket.IO client configuration for real-time notifications
const socket = io(API_BASE_URL, {
    path: '/socket.io', // Make sure this matches your backend socket.io path
    withCredentials: true,
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
});

// Handle socket connection errors
socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

export default function Notifications() {
    // ... rest of the component code ...
} 