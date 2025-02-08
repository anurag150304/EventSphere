import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { eventsAPI } from '../../services/api';
import { fetchEventsSuccess } from '../../store/slices/eventSlice';

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [attending, setAttending] = useState(false);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const data = await eventsAPI.getEvent(id);
            setEvent(data.event);
            setAttending(data.event.attendees?.some(a => a.user === user?._id && a.status === 'confirmed'));
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;

        try {
            await eventsAPI.deleteEvent(id);
            const { events } = await eventsAPI.getEvents();
            dispatch(fetchEventsSuccess(events));
            navigate('/');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleAttendance = async () => {
        try {
            if (attending) {
                await eventsAPI.cancelAttendance(id);
            } else {
                await eventsAPI.attendEvent(id);
            }
            fetchEvent();
        } catch (error) {
            setError(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="text-center py-12">
                <div className="text-gray-500">Event not found</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center space-x-3">
                                <h1 className="text-2xl font-bold text-gray-900">{event.name}</h1>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.category === 'conference' ? 'bg-blue-100 text-blue-800' :
                                    event.category === 'workshop' ? 'bg-green-100 text-green-800' :
                                        event.category === 'social' ? 'bg-yellow-100 text-yellow-800' :
                                            event.category === 'sports' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {event.category}
                                </span>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Created by {event.creator?.name || 'Unknown'}
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            {event.creator === user?._id && (
                                <>
                                    <button
                                        onClick={() => navigate(`/events/${id}/edit`)}
                                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-red-600 bg-white hover:bg-red-50"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </>
                            )}
                            <button
                                onClick={handleAttendance}
                                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${attending
                                    ? 'text-purple-700 bg-purple-100 hover:bg-purple-200'
                                    : 'text-white bg-purple-600 hover:bg-purple-700'
                                    }`}
                            >
                                {attending ? (
                                    <>
                                        <CheckIcon className="h-4 w-4 mr-2" />
                                        Attending
                                    </>
                                ) : (
                                    'Attend Event'
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Event details */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <div className="prose max-w-none">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">About this event</h3>
                                <p className="text-gray-500">{event.description}</p>
                            </div>

                            {/* Schedule */}
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                                        <span>{format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500 mt-2">
                                        <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                                        <span>{event.time}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="mt-8">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <MapPinIcon className="h-5 w-5 mr-2 text-gray-400 mt-0.5" />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {event.location.venue}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {event.location.address}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {event.location.city}, {event.location.country}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Attendees</h3>
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <UsersIcon className="h-5 w-5 mr-2 text-gray-400" />
                                    <span>
                                        {event.attendees?.filter(a => a.status === 'confirmed').length || 0} of {event.capacity} spots filled
                                    </span>
                                </div>
                                <div className="space-y-4">
                                    {event.attendees
                                        ?.filter(a => a.status === 'confirmed')
                                        .map((attendee) => (
                                            <div key={attendee.user} className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                    <span className="text-purple-600 font-medium">
                                                        {attendee.name?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {attendee.name}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Share */}
                            <div className="mt-6">
                                <button
                                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    <ShareIcon className="h-4 w-4 mr-2" />
                                    Share Event
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 