import cron from 'node-cron';
import Event from '../models/Event.js';
import { sendEventReminder } from './emailService.js';

// Function to send reminders for upcoming events based on user preferences
const sendEventReminders = async () => {
    try {
        // Get current date and time
        const now = new Date();

        // Find all upcoming events within the next 7 days (maximum reminder window)
        const futureDate = new Date(now);
        futureDate.setDate(futureDate.getDate() + 7);

        const events = await Event.find({
            date: {
                $gte: now,
                $lt: futureDate
            },
            status: 'published'
        }).populate('attendees.user', 'email notificationPreferences notificationTiming');

        // Process each event
        for (const event of events) {
            const confirmedAttendees = event.attendees.filter(a => a.status === 'confirmed');

            // Check each attendee's reminder preferences
            for (const attendee of confirmedAttendees) {
                if (!attendee.user || !attendee.user.notificationPreferences?.eventReminders) {
                    continue;
                }

                const userPrefs = attendee.user.notificationTiming?.eventReminders;
                if (!userPrefs) continue;

                // Calculate when the reminder should be sent based on user preferences
                const eventDate = new Date(event.date);
                const reminderDate = new Date(eventDate);
                reminderDate.setDate(reminderDate.getDate() - userPrefs.days);

                // Parse preferred reminder time
                const [hours, minutes] = userPrefs.time.split(':').map(Number);
                reminderDate.setHours(hours, minutes, 0, 0);

                // Check if it's time to send the reminder
                const timeDiff = Math.abs(now - reminderDate);
                if (timeDiff <= 5 * 60 * 1000) { // Within 5 minutes of preferred time
                    try {
                        await sendEventReminder(event, attendee.user._id);
                    } catch (error) {
                        console.error(`Failed to send reminder to ${attendee.user.email}:`, error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error sending event reminders:', error);
    }
};

// Schedule the reminder job to run every 5 minutes
const scheduleEventReminders = () => {
    cron.schedule('*/5 * * * *', () => {
        console.log('Running event reminder check...');
        sendEventReminders();
    });
};

export default scheduleEventReminders; 