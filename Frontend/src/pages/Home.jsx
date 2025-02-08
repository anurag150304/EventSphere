import { useSelector } from 'react-redux';
import EventList from '../components/event/EventList';

export default function Home() {
    const { user } = useSelector((state) => state.auth);
    const isGuest = user?.role === 'guest';

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