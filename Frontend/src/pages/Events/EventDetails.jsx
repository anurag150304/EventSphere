import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { format, parseISO } from 'date-fns';
import {
    ClockIcon,
    MapPinIcon,
    UsersIcon,
    CalendarIcon,
    PencilIcon,
    TrashIcon,
    ShareIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import {
    fetchEventStart,
    fetchEventSuccess,
    fetchEventFailure,
    deleteEventStart,
    deleteEventSuccess,
    deleteEventFailure
} from '../../store/slices/eventSlice';
import { eventsAPI } from '../../services/api';
import Comments from '../../components/comments/Comments';
import io from 'socket.io-client';
import ShareModal from '../../components/event/ShareModal';
import { toast } from 'react-hot-toast';
import UpgradePrompt from '../../components/common/UpgradePrompt';

// Configure Socket.IO client
const socket = io('http://localhost:5000', {
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

// @desc    Page component for displaying detailed event information
export default function EventDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { event, loading, error } = useSelector((state) => state.events);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const [rsvpLoading, setRsvpLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const isGuest = user?.role === 'guest';
    const isEventCreator = event?.creator?._id ? event.creator._id === user?._id : event?.creator === user?._id;

    useEffect(() => {
        fetchEventDetails();
        // Join event room for real-time updates
        socket.emit('joinEvent', id);

        // Listen for RSVP updates
        socket.on('rsvpUpdated', (eventId) => {
            if (eventId === id) {
                fetchEventDetails();
            }
        });

        return () => {
            socket.emit('leaveEvent', id);
            socket.off('rsvpUpdated');
        };
    }, [id]);

    const fetchEventDetails = async () => {
        try {
            dispatch(fetchEventStart());
            const { event } = await eventsAPI.getEvent(id);
            dispatch(fetchEventSuccess(event));
        } catch (error) {
            dispatch(fetchEventFailure(error.message));
        }
    };

    // @desc    Handle RSVP status changes
    const handleRSVP = async () => {
        if (!isAuthenticated) {
            toast.error('Please log in to attend events');
            navigate('/login', { state: { from: `/events/${id}` } });
            return;
        }

        if (isGuest) {
            toast.error('Guest users cannot attend events. Please create a full account.');
            return;
        }

        try {
            setRsvpLoading(true);
            const isAttending = event.attendees?.some(
                (attendee) => attendee.user && attendee.user._id === user._id && attendee.status === 'confirmed'
            );

            if (isAttending) {
                await eventsAPI.cancelRsvp(id);
                toast.success('You have cancelled your attendance');
            } else {
                await eventsAPI.rsvpToEvent(id);
                toast.success('You are now attending this event');
            }

            // Emit RSVP update
            socket.emit('rsvpUpdate', id);
            await fetchEventDetails();
        } catch (error) {
            console.error('RSVP error:', error);
            toast.error(error.message || 'Failed to update RSVP status');
        } finally {
            setRsvpLoading(false);
        }
    };

    // @desc    Handle event deletion
    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
            return;
        }

        try {
            setDeleteLoading(true);
            dispatch(deleteEventStart());
            await eventsAPI.deleteEvent(id);
            dispatch(deleteEventSuccess(id));
            navigate('/');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete event';
            dispatch(deleteEventFailure(message));
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">Event not found</h2>
                </div>
            </div>
        );
    }

    const isAttending = event.attendees?.some(
        (a) => a.user._id === user?._id && a.status === 'confirmed'
    );
    const isFull = event.attendees?.filter((a) => a.status === 'confirmed').length >= event.capacity;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                {/* Event Header */}
                <div className="relative">
                    {event.image && (
                        <img
                            src={event.image}
                            alt={event.name}
                            className="w-full h-64 object-cover"
                        />
                    )}
                    <div className="absolute top-4 right-4 space-x-2">
                        {isAuthenticated && !isGuest && isEventCreator && (
                            <>
                                <Link
                                    to={`/events/${id}/edit`}
                                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                                >
                                    <PencilIcon className="h-4 w-4 mr-1" />
                                    Edit
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                                >
                                    <TrashIcon className="h-4 w-4 mr-1" />
                                    Delete
                                </button>
                            </>
                        )}
                        {isGuest && isEventCreator && (
                            <UpgradePrompt
                                message="Create a full account to edit or manage your events."
                                className="mt-2"
                            />
                        )}
                        <button
                            onClick={() => setIsShareModalOpen(true)}
                            className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <ShareIcon className="h-4 w-4 mr-1" />
                            Share
                        </button>
                    </div>
                </div>

                {/* Event Details */}
                <div className="px-6 py-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{event.name}</h1>
                            <p className="mt-2 text-gray-600">{event.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                            {isGuest ? (
                                <div className="text-center">
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                                    >
                                        Log in to Attend
                                    </button>
                                    <p className="mt-2 text-sm text-gray-500">
                                        Create a full account to attend events
                                    </p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleRSVP}
                                    disabled={rsvpLoading || (isFull && !isAttending)}
                                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${isAttending
                                        ? 'text-purple-600 bg-purple-100 hover:bg-purple-200'
                                        : isFull
                                            ? 'text-gray-500 bg-gray-100 cursor-not-allowed'
                                            : 'text-white bg-purple-600 hover:bg-purple-700'
                                        }`}
                                >
                                    {rsvpLoading ? (
                                        'Processing...'
                                    ) : isAttending ? (
                                        <>
                                            <CheckIcon className="h-5 w-5 mr-2" />
                                            Attending
                                        </>
                                    ) : isFull ? (
                                        'Event Full'
                                    ) : (
                                        'RSVP'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Event Info */}
                    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex items-center text-gray-600">
                            <CalendarIcon className="h-5 w-5 mr-2" />
                            <span>{format(parseISO(event.date), 'MMMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <ClockIcon className="h-5 w-5 mr-2" />
                            <span>{event.time}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <MapPinIcon className="h-5 w-5 mr-2" />
                            <span>
                                {event.location.address}, {event.location.city},{' '}
                                {event.location.country}
                            </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <UsersIcon className="h-5 w-5 mr-2" />
                            <span>
                                {event.attendees?.filter(a => a.status === 'confirmed').length || 0} /{' '}
                                {event.capacity} attendees
                            </span>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="border-t border-gray-200 px-6 py-4">
                    <Comments eventId={id} />
                    {isGuest && (
                        <UpgradePrompt
                            message="Create a full account to like, edit, or delete comments."
                            className="mt-4"
                        />
                    )}
                </div>
            </div>

            {/* Share Modal */}
            <ShareModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                eventId={id}
                eventName={event.name}
            />
        </div>
    );
} 