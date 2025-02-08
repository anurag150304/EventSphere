import { Fragment, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
    CalendarDaysIcon,
    CalendarIcon,
    PlusIcon,
    BellIcon,
    Bars3Icon,
    XMarkIcon,
    ChartBarIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import { logout } from '../../store/slices/authSlice';

function classNames(...classes) {
    return classes.filter(Boolean).join(' ');
}

const Layout = ({ children }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const isGuest = user?.role === 'guest';

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navigation = [
        { name: 'Events', href: '/', icon: CalendarDaysIcon },
        { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
        ...(!isGuest && isAuthenticated ? [{ name: 'Analytics', href: '/analytics', icon: ChartBarIcon }] : []),
        ...(!isGuest && isAuthenticated ? [{ name: 'Create Event', href: '/events/create', icon: PlusIcon }] : [])
    ];


    return (
        <div className="min-h-screen bg-gray-100">
            <Disclosure as="nav" className="bg-white shadow-sm">
                {({ open }) => (
                    <>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between h-16">
                                <div className="flex">
                                    <div className="flex-shrink-0 flex items-center">
                                        <Link to="/" className="text-xl font-bold text-purple-600">
                                            EventSphere
                                        </Link>
                                    </div>
                                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                to={item.href}
                                                className={classNames(
                                                    location.pathname === item.href
                                                        ? 'border-purple-500 text-gray-900'
                                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                                    'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
                                                )}
                                            >
                                                <item.icon className="h-5 w-5 mr-2" />
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                                    {isAuthenticated ? (
                                        <>
                                            <Link
                                                to="/notifications"
                                                className="p-2 rounded-full text-gray-500 hover:text-gray-700"
                                            >
                                                <BellIcon className="h-6 w-6" />
                                            </Link>
                                            <Menu as="div" className="ml-3 relative">
                                                <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                                                    {user?.profileImage ? (
                                                        <img
                                                            className="h-8 w-8 rounded-full"
                                                            src={user.profileImage}
                                                            alt={user.name}
                                                        />
                                                    ) : (
                                                        <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                                    )}
                                                </Menu.Button>
                                                <Transition
                                                    as={Fragment}
                                                    enter="transition ease-out duration-200"
                                                    enterFrom="transform opacity-0 scale-95"
                                                    enterTo="transform opacity-100 scale-100"
                                                    leave="transition ease-in duration-75"
                                                    leaveFrom="transform opacity-100 scale-100"
                                                    leaveTo="transform opacity-0 scale-95"
                                                >
                                                    <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <Link
                                                                    to="/profile"
                                                                    className={classNames(
                                                                        active ? 'bg-gray-100' : '',
                                                                        'block px-4 py-2 text-sm text-gray-700'
                                                                    )}
                                                                >
                                                                    Profile
                                                                </Link>
                                                            )}
                                                        </Menu.Item>
                                                        <Menu.Item>
                                                            {({ active }) => (
                                                                <button
                                                                    onClick={handleLogout}
                                                                    className={classNames(
                                                                        active ? 'bg-gray-100' : '',
                                                                        'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                                                    )}
                                                                >
                                                                    Sign out
                                                                </button>
                                                            )}
                                                        </Menu.Item>
                                                    </Menu.Items>
                                                </Transition>
                                            </Menu>
                                        </>
                                    ) : (
                                        <div className="flex space-x-4">
                                            <Link
                                                to="/login"
                                                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                                            >
                                                Sign in
                                            </Link>
                                            <Link
                                                to="/register"
                                                className="bg-purple-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-purple-700"
                                            >
                                                Sign up
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                <div className="-mr-2 flex items-center sm:hidden">
                                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500">
                                        <span className="sr-only">Open main menu</span>
                                        {open ? (
                                            <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                        ) : (
                                            <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                        )}
                                    </Disclosure.Button>
                                </div>
                            </div>
                        </div>

                        <Disclosure.Panel className="sm:hidden">
                            <div className="pt-2 pb-3 space-y-1">
                                {navigation.map((item) => (
                                    <Disclosure.Button
                                        key={item.name}
                                        as={Link}
                                        to={item.href}
                                        className={classNames(
                                            location.pathname === item.href
                                                ? 'bg-purple-50 border-purple-500 text-purple-700'
                                                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700',
                                            'block pl-3 pr-4 py-2 border-l-4 text-base font-medium'
                                        )}
                                    >
                                        <div className="flex items-center">
                                            <item.icon className="h-5 w-5 mr-2" />
                                            {item.name}
                                        </div>
                                    </Disclosure.Button>
                                ))}
                            </div>
                            <div className="pt-4 pb-3 border-t border-gray-200">
                                {isAuthenticated ? (
                                    <>
                                        <div className="flex items-center px-4">
                                            {user?.profileImage ? (
                                                <img
                                                    className="h-8 w-8 rounded-full"
                                                    src={user.profileImage}
                                                    alt={user.name}
                                                />
                                            ) : (
                                                <UserCircleIcon className="h-8 w-8 text-gray-400" />
                                            )}
                                            <div className="ml-3">
                                                <div className="text-base font-medium text-gray-800">
                                                    {user?.name}
                                                </div>
                                                <div className="text-sm font-medium text-gray-500">
                                                    {user?.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-3 space-y-1">
                                            <Disclosure.Button
                                                as={Link}
                                                to="/profile"
                                                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                            >
                                                Profile
                                            </Disclosure.Button>
                                            <Disclosure.Button
                                                as={Link}
                                                to="/notifications"
                                                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                            >
                                                Notifications
                                            </Disclosure.Button>
                                            <Disclosure.Button
                                                as="button"
                                                onClick={handleLogout}
                                                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                            >
                                                Sign out
                                            </Disclosure.Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-1">
                                        <Disclosure.Button
                                            as={Link}
                                            to="/login"
                                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                                        >
                                            Sign in
                                        </Disclosure.Button>
                                        <Disclosure.Button
                                            as={Link}
                                            to="/register"
                                            className="block px-4 py-2 text-base font-medium text-purple-600 hover:text-purple-800 hover:bg-gray-100"
                                        >
                                            Sign up
                                        </Disclosure.Button>
                                    </div>
                                )}
                            </div>
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>

            <main className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
        </div>
    );
};

export default Layout; 