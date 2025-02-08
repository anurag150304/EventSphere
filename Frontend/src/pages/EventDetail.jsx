import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    CalendarIcon,
    MapPinIcon,
    UserGroupIcon,
    ClockIcon,
    PencilIcon,
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChatBubbleLeftIcon,
    ShareIcon
} from '@heroicons/react/24/outline';
import { format, parseISO } from 'date-fns';
import { eventAPI } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorAlert from '../components/common/ErrorAlert';
import CommentSection from '../components/event/CommentSection';
import ShareModal from '../components/event/ShareModal';
import { toast } from 'react-hot-toast';

export default function EventDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAttending, setIsAttending] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);

    useEffect(() => {
        fetchEvent();
    }, [id]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const data = await eventAPI.getEventById(id);
            setEvent(data);
            setIsAttending(data.attendees.some(attendee => attendee._id === user?._id));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await eventAPI.deleteEvent(id);
            toast.success('Event deleted successfully');
            navigate('/');
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleAttendance = async () => {
        if (!user) {
            navigate('/login', { state: { from: `/events/${id}` } });
            return;
        }

        try {
            if (isAttending) {
                await eventAPI.cancelAttendance(id);
                toast.success('You are no longer attending this event');
            } else {
                await eventAPI.attendEvent(id);
                toast.success('You are now attending this event');
            }
            setIsAttending(!isAttending);
            fetchEvent(); // Refresh event data
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorAlert message={error} />;
    }

    if (!event) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">Event not found</h2>
                    <Link
                        to="/"
                        className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-500"
                    >
                        <ChevronLeftIcon className="mr-1 h-5 w-5" />
                        Back to events
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center mb-4 sm:mb-0">
                    <Link
                        to="/"
                        className="mr-4 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-500"
                    >
                        <ChevronLeftIcon className="mr-1 h-5 w-5" />
                        Back
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{event.name}</h1>
                </div>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        <ShareIcon className="h-5 w-5 mr-2 text-gray-500" />
                        Share
                    </button>
                    {user?._id === event.creator._id && (
                        <>
                            <Link
                                to={`/events/${id}/edit`}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                                <PencilIcon className="h-5 w-5 mr-2 text-gray-500" />
                                Edit
                            </Link>
                            <button
                                onClick={() => setShowConfirmDelete(true)}
                                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <TrashIcon className="h-5 w-5 mr-2 text-red-500" />
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            {event.image && (
                                <img
                                    src={event.image}
                                    alt={event.name}
                                    className="w-full h-64 object-cover rounded-lg mb-6"
                                />
                            )}
                            <div className="prose max-w-none">
                                <p className="text-gray-600">{event.description}</p>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Details</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center text-gray-600">
                                        <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
                                        <span>{format(parseISO(event.date), 'EEEE, MMMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <ClockIcon className="h-5 w-5 mr-2 text-gray-400" />
                                        <span>{format(parseISO(event.date), 'h:mm a')}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                                        <span>{event.location}</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <UserGroupIcon className="h-5 w-5 mr-2 text-gray-400" />
                                        <span>{event.attendees.length} attending</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>
                                <CommentSection eventId={id} />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Hosted by</h3>
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <span className="text-purple-600 font-medium">
                                                {event.creator.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-gray-900">{event.creator.name}</p>
                                            <p className="text-sm text-gray-500">{event.creator.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAttendance}
                                    className={`w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isAttending
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-purple-600 hover:bg-purple-700'
                                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                                >
                                    {isAttending ? (
                                        <>
                                            <XMarkIcon className="h-5 w-5 mr-2" />
                                            Cancel Attendance
                                        </>
                                    ) : (
                                        <>
                                            <CheckIcon className="h-5 w-5 mr-2" />
                                            Attend Event
                                        </>
                                    )}
                                </button>

                                {event.attendees.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Attendees</h3>
                                        <div className="flow-root">
                                            <ul className="-my-2">
                                                {event.attendees.map((attendee) => (
                                                    <li key={attendee._id} className="py-2">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                                                                <span className="text-purple-600 font-medium">
                                                                    {attendee.name.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {attendee.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    eventId={id}
                    eventName={event.name}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showConfirmDelete && (
                <div className="fixed z-10 inset-0 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                            <div>
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                    <TrashIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                                </div>
                                <div className="mt-3 text-center sm:mt-5">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Event</h3>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500">
                                            Are you sure you want to delete this event? This action cannot be undone.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm"
                                    onClick={handleDelete}
                                >
                                    Delete
                                </button>
                                <button
                                    type="button"
                                    className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:col-start-1 sm:text-sm"
                                    onClick={() => setShowConfirmDelete(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 