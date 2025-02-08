import { useState } from 'react';
import {
    CalendarIcon,
    ClockIcon,
    MapPinIcon,
    TagIcon,
    UsersIcon,
    PhotoIcon
} from '@heroicons/react/24/outline';
import { uploadAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const categories = ['conference', 'workshop', 'social', 'sports', 'other'];

export default function EventForm({ onSubmit, initialData }) {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        description: '',
        date: '',
        time: '',
        category: 'conference',
        capacity: '',
        location: {
            address: '',
            city: '',
            country: ''
        },
        image: null
    });
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(initialData?.image || null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleImageChange = async (e) => {
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

            try {
                setUploading(true);
                const { imageUrl } = await uploadAPI.uploadImage(file);
                setFormData(prev => ({
                    ...prev,
                    image: imageUrl
                }));
                setImagePreview(imageUrl);
                toast.success('Image uploaded successfully');
            } catch (error) {
                console.error('Upload error:', error);
                toast.error(error.response?.data?.message || 'Failed to upload image');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Event Name
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        name="name"
                        id="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Description */}
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                </label>
                <div className="mt-1">
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        required
                        value={formData.description}
                        onChange={handleChange}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                    />
                </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                        Date
                    </label>
                    <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="date"
                            name="date"
                            id="date"
                            required
                            value={formData.date}
                            onChange={handleChange}
                            className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                        Time
                    </label>
                    <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="time"
                            name="time"
                            id="time"
                            required
                            value={formData.time}
                            onChange={handleChange}
                            className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Category and Capacity */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                        Category
                    </label>
                    <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <TagIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                            id="category"
                            name="category"
                            required
                            value={formData.category}
                            onChange={handleChange}
                            className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                        Capacity
                    </label>
                    <div className="mt-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UsersIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="number"
                            name="capacity"
                            id="capacity"
                            min="1"
                            required
                            value={formData.capacity}
                            onChange={handleChange}
                            className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Location Details</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label htmlFor="location.address" className="block text-sm font-medium text-gray-700">
                            Address
                        </label>
                        <div className="mt-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MapPinIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="location.address"
                                id="location.address"
                                required
                                value={formData.location.address}
                                onChange={handleChange}
                                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
                            City
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="location.city"
                                id="location.city"
                                required
                                value={formData.location.city}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
                            Country
                        </label>
                        <div className="mt-1">
                            <input
                                type="text"
                                name="location.country"
                                id="location.country"
                                required
                                value={formData.location.country}
                                onChange={handleChange}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Event Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        {imagePreview ? (
                            <div className="relative">
                                <img
                                    src={imagePreview}
                                    alt="Event preview"
                                    className="mx-auto h-32 w-auto object-cover rounded-md"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImagePreview(null);
                                        setFormData(prev => ({ ...prev, image: null }));
                                    }}
                                    className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <>
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label
                                        htmlFor="image-upload"
                                        className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-purple-500"
                                    >
                                        <span>{uploading ? 'Uploading...' : 'Upload an image'}</span>
                                        <input
                                            id="image-upload"
                                            name="image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="sr-only"
                                            onChange={handleImageChange}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div>
                <button
                    type="submit"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                    Create Event
                </button>
            </div>
        </form>
    );
} 