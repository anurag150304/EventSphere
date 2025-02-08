import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, FunnelIcon } from '@heroicons/react/24/outline';

const categories = ['all', 'conference', 'workshop', 'social', 'sports', 'other'];

export default function FilterDrawer({ isOpen, onClose, filters, onFilterChange }) {
    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-500"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-500"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                                        <div className="px-4 sm:px-6">
                                            <div className="flex items-start justify-between">
                                                <Dialog.Title className="text-lg font-medium text-gray-900">
                                                    Filters
                                                </Dialog.Title>
                                                <div className="ml-3 flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                                                        onClick={onClose}
                                                    >
                                                        <span className="sr-only">Close panel</span>
                                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="relative mt-6 flex-1 px-4 sm:px-6">
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">Category</h3>
                                                    <select
                                                        value={filters.category}
                                                        onChange={(e) => onFilterChange('category', e.target.value)}
                                                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                                    >
                                                        {categories.map(category => (
                                                            <option key={category} value={category}>
                                                                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">Time Frame</h3>
                                                    <select
                                                        value={filters.timeFrame}
                                                        onChange={(e) => onFilterChange('timeFrame', e.target.value)}
                                                        className="mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                                    >
                                                        <option value="all">All Events</option>
                                                        <option value="upcoming">Upcoming Events</option>
                                                        <option value="past">Past Events</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-900">Date Range</h3>
                                                    <div className="mt-2 space-y-4">
                                                        <div>
                                                            <label className="block text-sm text-gray-700">Start Date</label>
                                                            <input
                                                                type="date"
                                                                value={filters.startDate}
                                                                onChange={(e) => onFilterChange('startDate', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm text-gray-700">End Date</label>
                                                            <input
                                                                type="date"
                                                                value={filters.endDate}
                                                                onChange={(e) => onFilterChange('endDate', e.target.value)}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
} 