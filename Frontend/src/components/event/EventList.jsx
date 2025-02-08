import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import { CalendarDaysIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';
import { eventsAPI } from '../../services/api';

const categories = ['all', 'conference', 'workshop', 'social', 'sports', 'other'];

export default function EventList() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        category: 'all',
        timeFrame: 'upcoming',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        fetchEvents();
    }, [filters]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            // Only include category in params if it's not 'all'
            const params = {
                ...(filters.category !== 'all' && { category: filters.category }),
                ...(filters.startDate && { startDate: filters.startDate }),
                ...(filters.endDate && { endDate: filters.endDate })
            };
            const { events } = await eventsAPI.getEvents(params);
            setEvents(events);
        } catch (error) {
            setError('Failed to load events');
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredEvents = events.filter(event => {
        const eventDate = parseISO(event.date);

        // Time Frame Filter
        const matchesTimeFrame = filters.timeFrame === 'all' ||
            (filters.timeFrame === 'upcoming' && isFuture(eventDate)) ||
            (filters.timeFrame === 'past' && isPast(eventDate));

        // Date Range Filter
        const startDate = filters.startDate ? parseISO(filters.startDate) : null;
        const endDate = filters.endDate ? parseISO(filters.endDate) : null;
        const matchesDateRange = (!startDate || eventDate >= startDate) &&
            (!endDate || eventDate <= endDate);

        return matchesTimeFrame && matchesDateRange;
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 p-4 rounded-md">
                <p className="text-red-700">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Category Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time Frame Filter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Time Frame</label>
                        <select
                            value={filters.timeFrame}
                            onChange={(e) => handleFilterChange('timeFrame', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        >
                            <option value="all">All Events</option>
                            <option value="upcoming">Upcoming Events</option>
                            <option value="past">Past Events</option>
                        </select>
                    </div>

                    {/* Date Range Filters */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">End Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                        />
                    </div>
                </div>
            </div>

            {/* Events List */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <p className="text-gray-500">No events found matching your filters</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <Link
                            key={event._id}
                            to={`/events/${event._id}`}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                            {event.image && (
                                <img
                                    src={event.image}
                                    alt={event.name}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-4 space-y-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{event.name}</h3>
                                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{event.description}</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <CalendarDaysIcon className="h-5 w-5 mr-2" />
                                        <span>{format(parseISO(event.date), 'MMMM d, yyyy')} at {event.time}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <MapPinIcon className="h-5 w-5 mr-2" />
                                        <span>{event.location.city}, {event.location.country}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-500">
                                        <UsersIcon className="h-5 w-5 mr-2" />
                                        <span>
                                            {event.attendees?.filter(a => a.status === 'confirmed').length || 0} /{' '}
                                            {event.capacity} attendees
                                        </span>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                        {event.category}
                                    </span>
                                    {isPast(parseISO(event.date)) ? (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            Past Event
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Upcoming
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
} 