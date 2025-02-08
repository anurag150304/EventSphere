import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { eventsAPI } from '../../services/api';
import { fetchEventsSuccess } from '../../store/slices/eventSlice';
import { toast } from 'react-hot-toast';
import EventForm from '../../components/event/EventForm';

export default function CreateEvent() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isGuest = user?.role === 'guest';

    useEffect(() => {
        if (isGuest) {
            toast.error('Guest users cannot create events');
            navigate('/');
        }
    }, [isGuest, navigate]);

    if (isGuest) {
        return null;
    }

    const handleSubmit = async (formData) => {
        try {
            await eventsAPI.createEvent(formData);
            const { events } = await eventsAPI.getEvents();
            dispatch(fetchEventsSuccess(events));
            toast.success('Event created successfully');
            navigate('/');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create event');
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Event</h1>
            <EventForm onSubmit={handleSubmit} />
        </div>
    );
} 