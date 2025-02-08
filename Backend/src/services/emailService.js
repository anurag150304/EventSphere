import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import crypto from 'crypto';
import User from '../models/User.js';

dotenv.config();

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Generate unsubscribe token
const generateUnsubscribeToken = async (userId) => {
    const token = crypto.randomBytes(32).toString('hex');
    await User.findByIdAndUpdate(userId, { unsubscribeToken: token });
    return token;
};

// Update the FRONTEND_URL in email templates
const FRONTEND_URL = process.env.NODE_ENV === 'production'
    ? 'https://event-sphere-phi.vercel.app'
    : 'http://localhost:5173';

// Get unsubscribe link
const getUnsubscribeLink = (token) => {
    return `${FRONTEND_URL}/notifications/unsubscribe/${token}`;
};

// Common email footer
const getEmailFooter = async (userId) => {
    const token = await generateUnsubscribeToken(userId);
    return `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;">
                You received this email based on your notification preferences. 
                <a href="${getUnsubscribeLink(token)}" style="color: #666;">
                    Unsubscribe or manage your notification settings
                </a>
            </p>
        </div>
    `;
};

// Send notification when someone comments on an event
export const sendCommentNotification = async (event, comment, recipientEmail) => {
    const user = await User.findById(event.creator);
    if (!user?.notificationPreferences?.eventComments) return;

    const footer = await getEmailFooter(user._id);
    const mailOptions = {
        from: `"Event Manager" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: `New Comment on Your Event: ${event.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Comment on Your Event</h2>
                <p><strong>${comment.user.name}</strong> commented on your event "${event.title}":</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    ${comment.content}
                </div>
                <p>
                    <a href="${FRONTEND_URL}/events/${event._id}" 
                       style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Comment
                    </a>
                </p>
                ${footer}
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Send notification when someone replies to a comment
export const sendReplyNotification = async (event, reply, parentComment, recipientEmail) => {
    const user = await User.findById(parentComment.user);
    if (!user?.notificationPreferences?.commentReplies) return;

    const footer = await getEmailFooter(user._id);
    const mailOptions = {
        from: `"Event Manager" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: `New Reply to Your Comment on: ${event.title}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Reply to Your Comment</h2>
                <p><strong>${reply.user.name}</strong> replied to your comment on the event "${event.title}":</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <p style="color: #666;"><em>Your comment:</em></p>
                    ${parentComment.content}
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 10px 0;">
                    <p style="color: #666;"><em>Reply:</em></p>
                    ${reply.content}
                </div>
                <p>
                    <a href="${FRONTEND_URL}/events/${event._id}" 
                       style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Reply
                    </a>
                </p>
                ${footer}
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Send notification when an event is updated
export const sendEventUpdateNotification = async (event, changes, recipientId) => {
    const user = await User.findById(recipientId);
    if (!user?.notificationPreferences?.eventUpdates) return;

    const footer = await getEmailFooter(user._id);
    const mailOptions = {
        from: `"Event Manager" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Event Update: ${event.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Event Update</h2>
                <p>The event "${event.name}" has been updated:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    ${Object.entries(changes).map(([key, value]) => `
                        <p><strong>${key}:</strong> ${value}</p>
                    `).join('')}
                </div>
                <p>
                    <a href="${FRONTEND_URL}/events/${event._id}" 
                       style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Event
                    </a>
                </p>
                ${footer}
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Send event reminder
export const sendEventReminder = async (event, recipientId) => {
    const user = await User.findById(recipientId);
    if (!user?.notificationPreferences?.eventReminders) return;

    const footer = await getEmailFooter(user._id);
    const mailOptions = {
        from: `"Event Manager" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: `Reminder: ${event.name} is Tomorrow`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Event Reminder</h2>
                <p>This is a reminder that you're attending "${event.name}" tomorrow!</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <p><strong>Date:</strong> ${new Date(event.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Location:</strong> ${event.location.address}, ${event.location.city}</p>
                </div>
                <p>
                    <a href="${FRONTEND_URL}/events/${event._id}" 
                       style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Event Details
                    </a>
                </p>
                ${footer}
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
};

// Send RSVP update notification
export const sendRSVPUpdateNotification = async (event, user, status) => {
    const eventCreator = await User.findById(event.creator);
    if (!eventCreator?.notificationPreferences?.rsvpUpdates) return;

    const footer = await getEmailFooter(eventCreator._id);
    const mailOptions = {
        from: `"Event Manager" <${process.env.SMTP_USER}>`,
        to: eventCreator.email,
        subject: `RSVP Update for ${event.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>RSVP Update</h2>
                <p><strong>${user.name}</strong> has ${status === 'confirmed' ? 'RSVP\'d to' : 'cancelled their RSVP for'} your event "${event.name}"</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <p>Current attendee count: ${event.attendees.filter(a => a.status === 'confirmed').length}/${event.capacity}</p>
                </div>
                <p>
                    <a href="${FRONTEND_URL}/events/${event._id}" 
                       style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        View Attendee List
                    </a>
                </p>
                ${footer}
            </div>
        `
    };

    await transporter.sendMail(mailOptions);
}; 