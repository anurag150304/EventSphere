import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { fetchEventsStart, fetchEventsSuccess, fetchEventsFailure, setFilters } from '../store/slices/eventSlice';
import { eventsAPI } from '../services/api';
import {
    ViewColumnsIcon,
    TableCellsIcon,
    CalendarIcon,
    ListBulletIcon,
    TagIcon,
    ClockIcon,
    MapPinIcon,
    UsersIcon
} from '@heroicons/react/24/outline';
import EventList from '../components/event/EventList';

const categories = ['all', 'conference', 'workshop', 'social', 'sports', 'other'];

export default function Home() {
    const [view, setView] = useState('cards'); // 'cards', 'table', or 'calendar'
    const [selectedCategory, setSelectedCategory] = useState('all');
    const { events, loading, error } = useSelector((state) => state.events);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isGuest = user?.role === 'guest';

    useEffect(() => {
        fetchEvents();
    }, [selectedCategory]);

    const fetchEvents = async () => {
        try {
            dispatch(fetchEventsStart());
            const params = {
                category: selectedCategory !== 'all' ? selectedCategory : undefined
            };
            const { events } = await eventsAPI.getEvents(params);
            dispatch(fetchEventsSuccess(events));
        } catch (error) {
            dispatch(fetchEventsFailure(error.message));
        }
    };

    const handleDragEnd = async (result) => {
        if (!result.destination || !isAuthenticated) return;

        const { draggableId, destination } = result;
        const event = events.find(e => e._id === draggableId);

        if (!event || event.creator !== user?._id) {
            return; // Only allow dragging of events you own
        }

        const newDate = destination.droppableId;

        try {
            await eventsAPI.updateEvent(draggableId, {
                ...event,
                date: newDate
            });
            fetchEvents(); // Refresh events after update
        } catch (error) {
            console.error('Failed to update event date:', error);
        }
    };

    const renderCardView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
                <div
                    key={event._id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                    <div className="p-6">
                        <div className="flex items-start justify-between">
                            <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.category === 'conference' ? 'bg-blue-100 text-blue-800' :
                                    event.category === 'workshop' ? 'bg-green-100 text-green-800' :
                                        event.category === 'social' ? 'bg-yellow-100 text-yellow-800' :
                                            event.category === 'sports' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                    }`}>
                                    {event.category}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <span className="text-xs text-gray-500">
                                    {format(parseISO(event.date), 'MMM d, yyyy')}
                                </span>
                            </div>
                        </div>
                        <Link to={`/events/${event._id}`} className="block mt-4">
                            <h3 className="text-lg font-medium text-gray-900 hover:text-purple-600">
                                {event.name}
                            </h3>
                            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                                {event.description}
                            </p>
                        </Link>
                        <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-1" />
                                    {event.time}
                                </div>
                                <div className="flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    {event.location.city}
                                </div>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <UsersIcon className="h-4 w-4 mr-1" />
                                {event.attendees?.filter(a => a.status === 'confirmed').length}/{event.capacity}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderTableView = () => (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Attendees
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => (
                        <tr key={event._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div>
                                        <Link
                                            to={`/events/${event._id}`}
                                            className="text-sm font-medium text-gray-900 hover:text-purple-600"
                                        >
                                            {event.name}
                                        </Link>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${event.category === 'conference' ? 'bg-blue-100 text-blue-800' :
                                            event.category === 'workshop' ? 'bg-green-100 text-green-800' :
                                                event.category === 'social' ? 'bg-yellow-100 text-yellow-800' :
                                                    event.category === 'sports' ? 'bg-red-100 text-red-800' :
                                                        'bg-gray-100 text-gray-800'
                                            }`}>
                                            {event.category}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div>{format(parseISO(event.date), 'MMM d, yyyy')}</div>
                                <div>{event.time}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {event.location.city}, {event.location.country}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {event.attendees?.filter(a => a.status === 'confirmed').length}/{event.capacity}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

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

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Discover Amazing Events
                        </h1>
                        <p className="mt-3 text-xl text-gray-500 sm:mt-4">
                            Find and join events that match your interests
                        </p>
                    </div>
                </div>
            </div>

            {/* Events List Section */}
            <EventList />
        </div>
    );
} 