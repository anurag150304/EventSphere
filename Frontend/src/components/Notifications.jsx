import { API_BASE_URL } from '../config/config';

// Configure Socket.IO client
const socket = io(API_BASE_URL, {
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