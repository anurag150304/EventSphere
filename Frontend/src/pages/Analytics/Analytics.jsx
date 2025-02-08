import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { eventsAPI } from '../../services/api';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

export default function Analytics() {
    const [eventStats, setEventStats] = useState({
        totalEvents: 0,
        totalAttendees: 0,
        averageAttendance: 0,
        categoryDistribution: {},
        monthlyEvents: {}
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        fetchEventStats();
    }, []);

    const fetchEventStats = async () => {
        try {
            setLoading(true);
            const { events } = await eventsAPI.getEvents();

            // Calculate statistics
            const stats = {
                totalEvents: events.length,
                totalAttendees: events.reduce((sum, event) =>
                    sum + event.attendees.filter(a => a.status === 'confirmed').length, 0),
                categoryDistribution: {},
                monthlyEvents: {}
            };

            // Calculate category distribution
            events.forEach(event => {
                stats.categoryDistribution[event.category] =
                    (stats.categoryDistribution[event.category] || 0) + 1;
            });

            // Calculate monthly distribution
            events.forEach(event => {
                const month = new Date(event.date).toLocaleString('default', { month: 'long' });
                stats.monthlyEvents[month] = (stats.monthlyEvents[month] || 0) + 1;
            });

            stats.averageAttendance = stats.totalEvents > 0
                ? Math.round(stats.totalAttendees / stats.totalEvents)
                : 0;

            setEventStats(stats);
        } catch (err) {
            setError('Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    const categoryChartData = {
        labels: Object.keys(eventStats.categoryDistribution),
        datasets: [
            {
                data: Object.values(eventStats.categoryDistribution),
                backgroundColor: [
                    'rgba(147, 51, 234, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)'
                ]
            }
        ]
    };

    const monthlyChartData = {
        labels: Object.keys(eventStats.monthlyEvents),
        datasets: [
            {
                label: 'Events per Month',
                data: Object.values(eventStats.monthlyEvents),
                backgroundColor: 'rgba(147, 51, 234, 0.8)'
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 text-center text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">Total Events</h3>
                    <p className="text-3xl font-bold text-purple-600">{eventStats.totalEvents}</p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">Total Attendees</h3>
                    <p className="text-3xl font-bold text-purple-600">{eventStats.totalAttendees}</p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900">Average Attendance</h3>
                    <p className="text-3xl font-bold text-purple-600">{eventStats.averageAttendance}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Events by Category</h3>
                    <div className="h-64">
                        <Doughnut data={categoryChartData} options={chartOptions} />
                    </div>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Event Distribution</h3>
                    <div className="h-64">
                        <Bar data={monthlyChartData} options={chartOptions} />
                    </div>
                </div>
            </div>
        </div>
    );
} 