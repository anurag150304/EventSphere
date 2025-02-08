import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters']
    },
    profileImage: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'guest'],
        default: 'user'
    },
    events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    attendingEvents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }],
    notificationPreferences: {
        eventComments: { type: Boolean, default: true },
        commentReplies: { type: Boolean, default: true },
        eventUpdates: { type: Boolean, default: true },
        eventReminders: { type: Boolean, default: true },
        rsvpUpdates: { type: Boolean, default: true }
    },
    notificationTiming: {
        eventReminders: {
            days: { type: Number, default: 1 }, // Days before event
            time: { type: String, default: '09:00' } // Time of day for reminders (24h format)
        },
        dailyDigest: {
            enabled: { type: Boolean, default: false },
            time: { type: String, default: '18:00' } // Time of day for daily digest
        },
        timezone: { type: String, default: 'UTC' }
    },
    unsubscribeToken: {
        type: String,
        sparse: true,
        unique: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password when converting to JSON
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

export default User; 