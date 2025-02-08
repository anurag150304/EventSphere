import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { updateProfileStart, updateProfileSuccess, updateProfileFailure } from '../../store/slices/authSlice';
import { authAPI, notificationsAPI, uploadAPI } from '../../services/api';
import { UserIcon, BellIcon, ClockIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import ImageUpload from '../../components/common/ImageUpload';
import { toast } from 'react-hot-toast';
import UpgradePrompt from '../../components/common/UpgradePrompt';

export default function Profile() {
    const dispatch = useDispatch();
    const { user, loading, error } = useSelector((state) => state.auth);
    const isGuest = user?.role === 'guest';
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        profileImage: user?.profileImage || ''
    });
    const [notificationPrefs, setNotificationPrefs] = useState({
        eventComments: true,
        commentReplies: true,
        eventUpdates: true,
        eventReminders: true,
        rsvpUpdates: true
    });
    const [preferencesLoading, setPreferencesLoading] = useState(false);
    const [preferencesError, setPreferencesError] = useState(null);
    const [notificationTiming, setNotificationTiming] = useState({
        eventReminders: {
            days: 1,
            time: '09:00'
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    });
    const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                profileImage: user.profileImage
            });
            fetchNotificationPreferences();
        }
    }, [user]);

    const fetchNotificationPreferences = async () => {
        try {
            setPreferencesLoading(true);
            const { preferences } = await notificationsAPI.getNotificationPreferences();
            setNotificationPrefs(preferences);
            if (user.notificationTiming) {
                setNotificationTiming(user.notificationTiming);
            }
        } catch (error) {
            setPreferencesError('Failed to load notification preferences');
        } finally {
            setPreferencesLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageUpload = async (file) => {
        try {
            setUploading(true);
            const { imageUrl } = await uploadAPI.uploadImage(file);
            setFormData(prev => ({
                ...prev,
                profileImage: imageUrl
            }));
            setImagePreview(imageUrl);
            toast.success('Image uploaded successfully');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleImageChange = (e) => {
        if (isGuest) {
            toast.error('Guest users cannot change profile pictures. Please upgrade your account.');
            return;
        }

        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                toast.error('Image size should be less than 5MB');
                return;
            }

            if (!file.type.startsWith('image/')) {
                toast.error('Please upload an image file');
                return;
            }

            handleImageUpload(file);
        }
    };

    const handlePreferenceChange = async (key) => {
        if (isGuest) {
            toast.error('Guest users cannot modify notification preferences. Please upgrade your account.');
            return;
        }
        try {
            const newPrefs = {
                ...notificationPrefs,
                [key]: !notificationPrefs[key]
            };
            await notificationsAPI.updateNotificationPreferences(newPrefs);
            setNotificationPrefs(newPrefs);
            toast.success('Preferences updated successfully');
        } catch (error) {
            toast.error('Failed to update preferences');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isGuest) {
            toast.error('Guest users cannot update profile information. Please upgrade your account.');
            return;
        }
        try {
            dispatch(updateProfileStart());
            const { user } = await authAPI.updateProfile(formData);
            dispatch(updateProfileSuccess(user));
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch (error) {
            dispatch(updateProfileFailure(error.message));
            toast.error('Failed to update profile');
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-semibold text-gray-900">Please log in to view your profile</h2>
                    <Link
                        to="/login"
                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700"
                    >
                        Log in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {isGuest && (
                <div className="mb-6">
                    <UpgradePrompt
                        message="You are using a guest account. Upgrade to a full account to access all features including profile customization, notification preferences, and more."
                        className="bg-purple-50 border-purple-200"
                    />
                </div>
            )}
            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Profile</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {isGuest
                                        ? "Limited profile access. Upgrade to customize your profile."
                                        : "Update your personal information and profile picture."
                                    }
                                </p>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2">
                                <form onSubmit={handleSubmit}>
                                    <div className="grid grid-cols-6 gap-6">
                                        <div className="col-span-6 sm:col-span-4">
                                            <div className="flex items-center space-x-6">
                                                <div className="flex-shrink-0 relative">
                                                    {imagePreview ? (
                                                        <img
                                                            src={imagePreview}
                                                            alt={formData.name}
                                                            className={`h-24 w-24 rounded-full object-cover ${isGuest ? 'opacity-50' : ''}`}
                                                        />
                                                    ) : (
                                                        <div className={`h-24 w-24 rounded-full bg-purple-100 flex items-center justify-center ${isGuest ? 'opacity-50' : ''}`}>
                                                            <UserIcon className="h-12 w-12 text-purple-600" />
                                                        </div>
                                                    )}
                                                    {isGuest && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <LockClosedIcon className="h-8 w-8 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        id="profileImage"
                                                        accept="image/*"
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                        disabled={isGuest}
                                                    />
                                                    <label
                                                        htmlFor="profileImage"
                                                        className={`cursor-pointer py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isGuest
                                                            ? 'bg-gray-400 cursor-not-allowed'
                                                            : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                                                            }`}
                                                    >
                                                        {isGuest ? 'Upgrade to Change Photo' : 'Change Photo'}
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                disabled={isGuest}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${isGuest ? 'bg-gray-100 cursor-not-allowed' : ''
                                                    }`}
                                            />
                                        </div>

                                        <div className="col-span-6 sm:col-span-4">
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={isGuest}
                                                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm ${isGuest ? 'bg-gray-100 cursor-not-allowed' : ''
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="mt-4 text-sm text-red-600">
                                            {error}
                                        </div>
                                    )}

                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={loading || isGuest}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isGuest
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                                                }`}
                                        >
                                            {isGuest ? 'Upgrade to Edit Profile' : loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notification Preferences Section */}
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="md:grid md:grid-cols-3 md:gap-6">
                            <div className="md:col-span-1">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {isGuest
                                        ? "Upgrade to customize your notification preferences."
                                        : "Manage your notification preferences."
                                    }
                                </p>
                            </div>
                            <div className="mt-5 md:mt-0 md:col-span-2">
                                {isGuest ? (
                                    <div className="text-center py-6">
                                        <LockClosedIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="mt-2 text-sm text-gray-500">
                                            Notification preferences are available only for full account users.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {preferencesLoading ? (
                                            <div className="flex justify-center py-4">
                                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                                            </div>
                                        ) : preferencesError ? (
                                            <div className="text-red-600 text-sm">{preferencesError}</div>
                                        ) : (
                                            <div className="space-y-6">
                                                {Object.entries(notificationPrefs).map(([key, value]) => (
                                                    <div key={key} className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                            <span className="text-sm font-medium text-gray-700">
                                                                {key.split(/(?=[A-Z])/).join(' ')}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePreferenceChange(key)}
                                                            className={`${value
                                                                ? 'bg-purple-600'
                                                                : 'bg-gray-200'
                                                                } relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
                                                        >
                                                            <span
                                                                className={`${value ? 'translate-x-5' : 'translate-x-0'
                                                                    } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}
                                                            />
                                                        </button>
                                                    </div>
                                                ))}

                                                <div className="border-t border-gray-200 pt-6">
                                                    <div className="flex items-center mb-4">
                                                        <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                                                        <span className="text-sm font-medium text-gray-700">
                                                            Event Reminder Settings
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Days before event
                                                            </label>
                                                            <select
                                                                value={notificationTiming.eventReminders.days}
                                                                onChange={(e) => setNotificationTiming({
                                                                    ...notificationTiming,
                                                                    eventReminders: {
                                                                        ...notificationTiming.eventReminders,
                                                                        days: parseInt(e.target.value)
                                                                    }
                                                                })}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                                            >
                                                                {[1, 2, 3, 5, 7].map((day) => (
                                                                    <option key={day} value={day}>
                                                                        {day} {day === 1 ? 'day' : 'days'}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700">
                                                                Reminder time
                                                            </label>
                                                            <input
                                                                type="time"
                                                                value={notificationTiming.eventReminders.time}
                                                                onChange={(e) => setNotificationTiming({
                                                                    ...notificationTiming,
                                                                    eventReminders: {
                                                                        ...notificationTiming.eventReminders,
                                                                        time: e.target.value
                                                                    }
                                                                })}
                                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 