import { Server } from "socket.io";

let io;

export const initializeSocket = (httpServer) => {
    io = new Server(httpServer, {
        path: '/socket.io',
        cors: {
            origin: [process.env.LOCAL_URL, process.env.FRONTEND_URL],
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        }
    });
    // Socket.io connection handling
    io.on('connection', (socket) => {
        console.log('A user connected');

        // Join event room
        socket.on('joinEvent', (eventId) => {
            socket.join(`event:${eventId}`);
        });

        // Leave event room
        socket.on('leaveEvent', (eventId) => {
            socket.leave(`event:${eventId}`);
        });

        // Handle RSVP updates
        socket.on('rsvpUpdate', (eventId) => {
            io.to(`event:${eventId}`).emit('rsvpUpdated', eventId);
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    });
}

export { io };