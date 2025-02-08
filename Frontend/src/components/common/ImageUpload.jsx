import { useState, useRef } from 'react';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';

export default function ImageUpload({ onUpload, onError }) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            await handleFileUpload(files[0]);
        }
    };

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            await handleFileUpload(files[0]);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file.type.startsWith('image/')) {
            onError('Please upload an image file');
            return;
        }

        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            onError('File size should be less than 5MB');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            onUpload(data.imageUrl);
        } catch (error) {
            onError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div
            className={`relative border-2 border-dashed rounded-lg p-4 text-center ${isDragging
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-300 hover:border-purple-500'
                }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
            />

            <div className="space-y-2">
                <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                    <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-purple-600 hover:text-purple-500"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <span>Upload a file</span>
                    </label>
                    <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            </div>

            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                </div>
            )}
        </div>
    );
} 