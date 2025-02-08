import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import scheduleEventReminders from './services/reminderService.js';
import authRoutes from './routes/auth.js';
import eventRoutes from './routes/events.js';
import notificationRoutes from './routes/notificationRoutes.js';
import uploadRoutes from './routes/upload.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

// Load environment variables
dotenv.config();

// @desc    Express app configuration with Socket.IO and middleware setup
const app = express();
const httpServer = createServer(app);

// @desc    CORS configuration for allowed origins
const allowedOrigins = "*";

// Configure express middleware first
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// CORS middleware with proper configuration
app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

// Socket.IO server configuration
const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
connectDB();

// Initialize event reminders
scheduleEventReminders();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/upload', uploadRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to Event Manager API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Handle payload too large error specifically
    if (err.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Request entity too large. Please reduce the size of your request.'
        });
    }

    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
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

// Export io instance for use in controllers
export { io };

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 