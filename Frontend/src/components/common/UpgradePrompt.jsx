import { Link } from 'react-router-dom';
import { ArrowUpCircleIcon } from '@heroicons/react/24/outline';

// @desc    Component to prompt guest users to upgrade their account
export default function UpgradePrompt({ message, className = '' }) {
    return (
        <div className={`rounded-md bg-purple-50 p-4 ${className}`}>
            <div className="flex">
                <div className="flex-shrink-0">
                    <ArrowUpCircleIcon className="h-5 w-5 text-purple-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <p className="text-sm text-purple-700">
                        {message || 'This feature is only available for registered users.'}
                        {' '}
                        <Link
                            to="/register"
                            className="font-medium text-purple-700 underline hover:text-purple-600"
                        >
                            Create an account
                        </Link>
                        {' '}to unlock all features.
                    </p>
                </div>
            </div>
        </div>
    );
} 