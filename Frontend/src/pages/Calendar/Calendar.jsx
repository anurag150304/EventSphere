import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { eventsAPI } from '../../services/api';
import { Link } from 'react-router-dom';

export default function Calendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchEvents();
    }, [currentMonth]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const start = startOfMonth(currentMonth);
            const end = endOfMonth(currentMonth);
            const { events } = await eventsAPI.getEvents({
                startDate: start.toISOString(),
                endDate: end.toISOString()
            });
            setEvents(events);
        } catch (err) {
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const getEventsForDay = (day) => {
        return events.filter(event => isSameDay(new Date(event.date), day));
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-semibold text-gray-900">
                            {format(currentMonth, 'MMMM yyyy')}
                        </h2>
                        <div className="flex space-x-2">
                            <button
                                onClick={previousMonth}
                                className="p-2 rounded-md hover:bg-gray-100"
                            >
                                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-2 rounded-md hover:bg-gray-100"
                            >
                                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-center text-red-600">{error}</div>
                ) : (
                    <div className="grid grid-cols-7 gap-px bg-gray-200">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                            <div
                                key={day}
                                className="bg-gray-50 py-2 text-center text-sm font-semibold text-gray-700"
                            >
                                {day}
                            </div>
                        ))}
                        {days.map((day, dayIdx) => {
                            const dayEvents = getEventsForDay(day);
                            return (
                                <div
                                    key={day.toString()}
                                    className={`bg-white min-h-[120px] p-2 ${dayIdx === 0 ? `col-start-${day.getDay() + 1}` : ''
                                        }`}
                                >
                                    <div className="font-medium text-sm text-gray-500">
                                        {format(day, 'd')}
                                    </div>
                                    <div className="mt-1 space-y-1">
                                        {dayEvents.map((event) => (
                                            <Link
                                                key={event._id}
                                                to={`/events/${event._id}`}
                                                className="block px-2 py-1 text-xs rounded-md bg-purple-50 text-purple-700 hover:bg-purple-100 truncate"
                                            >
                                                {event.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
} 