# Event Management Platform - Developer Documentation

## Overview

A full-stack event management platform where users can create, manage, and view events. The platform includes:
- User Authentication
- Event Creation and Management Tools
- Real-Time Updates for Attendees

## Features and Workflow

### Frontend

#### 1. User Authentication
- Users can register and log in using email and password
- Authentication is secured with JWT
- Guest Login option allows users to access limited features without registration
- Session persistence using tokens stored in localStorage or cookies

#### 2. Event Dashboard
- Displays upcoming and past events
- Users can filter events by category and date
- Each event card shows event name, description, date/time, and number of attendees
- Clicking on an event redirects to a detailed event page

#### 3. Event Creation
Users can create events using a form with fields:
- Event Name
- Description
- Date & Time
- Location
- Category
- Capacity (max attendees)

**Notes:**
- Only authenticated users can create and manage events
- Events are displayed on the dashboard in real-time

#### 4. Real-Time Attendee List
- Displays the number of attendees for each event
- Updates dynamically using WebSockets

#### 5. Responsive Design
- The platform is designed to work seamlessly on all devices
- Uses CSS frameworks like Tailwind or Bootstrap for responsiveness

### Backend

#### 1. Event Management API
**CRUD Operations for Events:**
- Create, Read, Update, and Delete events
- Only event creators can modify their events
- Users can RSVP to events

**Ownership Restrictions:**
- Only the event creator can edit or delete an event
- Guests have view-only access

#### 2. Real-Time Updates
Uses WebSockets (Socket.io) for:
- Live attendee count updates
- Instant event updates across users

#### 3. Database
Uses MongoDB for storing:
- Users (ID, Name, Email, Password Hash)
- Events (ID, Name, Description, Date/Time, Creator ID, Attendees List)
- RSVPs (User ID, Event ID)

*Ensures efficient data indexing for fast retrieval.*

## Tech Stack
- **Frontend:** React, TailwindCSS/Bootstrap
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose for ORM)
- **Authentication:** JWT, Bcrypt
- **Real-Time Communication:** WebSockets (Socket.io)

## API Endpoints

### HTTP Endpoints

#### Events API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | Fetch all events |
| GET | `/api/events/:id` | Fetch event by ID |
| POST | `/api/events` | Create a new event (requires authentication) |
| PUT | `/api/events/:id` | Update event (requires ownership) |
| DELETE | `/api/events/:id` | Delete event (requires ownership) |

#### Authentication API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate user and return JWT |
| GET | `/api/auth/profile` | Fetch user profile (requires authentication) |

### WebSockets
- `connect` - Establish a real-time connection
- `event:update` - Broadcast event updates
- `attendee:update` - Broadcast attendee list updates

## Deployment & Hosting
- **Frontend:** Vercel / Netlify
- **Backend:** Render / AWS / DigitalOcean
- **Database:** MongoDB Atlas / Self-hosted MongoDB

## Future Enhancements
- Email Notifications for event updates
- Event Comments & Discussions
- Social Media Sharing for events

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: { type: String, unique: true },
  password: String, // Hashed password
  profileImage: String,
  createdAt: Date,
  updatedAt: Date,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  events: [{ type: ObjectId, ref: 'Event' }], // Events created by user
  attendingEvents: [{ type: ObjectId, ref: 'Event' }] // Events user is attending
}
```

### Event Collection
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  category: { 
    type: String, 
    enum: ['conference', 'workshop', 'social', 'sports', 'other'],
    required: true 
  },
  capacity: { type: Number, required: true },
  creator: { type: ObjectId, ref: 'User', required: true },
  attendees: [{ type: ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

### RSVP Collection
```javascript
{
  _id: ObjectId,
  event: { type: ObjectId, ref: 'Event', required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['attending', 'maybe', 'not_attending'],
    default: 'attending'
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Project Structure

```
event-manager/
├── frontend/                   # React + Vite Frontend
│   ├── public/
│   │   └── assets/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   └── Modal.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── events/
│   │   │       ├── EventCard.jsx
│   │   │       ├── EventForm.jsx
│   │   │       └── EventList.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── Events/
│   │   │       ├── EventDetails.jsx
│   │   │       └── CreateEvent.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── EventContext.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useEvents.js
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   ├── styles/
│   │   │   └── index.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/                    # Node.js + Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js
│   │   │   └── socket.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   └── eventController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── validation.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Event.js
│   │   │   └── RSVP.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   └── events.js
│   │   ├── services/
│   │   │   └── socket.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── helpers.js
│   │   └── app.js
│   ├── .env
│   └── package.json
│
├── .gitignore
├── README.md
└── package.json
```

## Database Indexes

### User Collection Indexes
```javascript
// Email index for quick lookup during authentication
{ email: 1 }, { unique: true }
```

### Event Collection Indexes
```javascript
// Compound index for efficient event queries
{ category: 1, date: 1 }
// Creator index for finding user's events
{ creator: 1 }
// Status index for filtering events
{ status: 1 }
```

### RSVP Collection Indexes
```javascript
// Compound index for efficient RSVP lookups
{ event: 1, user: 1 }, { unique: true }
```
