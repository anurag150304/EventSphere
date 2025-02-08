import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Event name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Event date is required']
    },
    time: {
        type: String,
        required: [true, 'Event time is required']
    },
    location: {
        address: {
            type: String,
            required: [true, 'Address is required']
        },
        city: {
            type: String,
            required: [true, 'City is required']
        },
        state: String,
        country: {
            type: String,
            required: [true, 'Country is required']
        },
        zipCode: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['conference', 'workshop', 'social', 'sports', 'other']
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attendees: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['confirmed', 'waitlist', 'cancelled'],
            default: 'confirmed'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'cancelled', 'completed'],
        default: 'published'
    },
    image: String
}, {
    timestamps: true
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function () {
    return this.attendees.filter(a => a.status === 'confirmed').length >= this.capacity;
});

// Virtual for current attendee count
eventSchema.virtual('attendeeCount').get(function () {
    return this.attendees.filter(a => a.status === 'confirmed').length;
});

// Index for searching events
eventSchema.index({ name: 'text', description: 'text' });

// Compound index for querying events by category and date
eventSchema.index({ category: 1, date: 1 });

const Event = mongoose.model('Event', eventSchema);

export default Event; 