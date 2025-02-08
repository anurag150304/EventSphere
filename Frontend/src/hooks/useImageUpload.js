// @desc    Custom hook for handling image uploads
import { useState } from 'react';
import { uploadAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { formatFileSize } from '../utils/formatters';

export const useImageUpload = (options = {}) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const maxSize = options.maxSize || 5 * 1024 * 1024; // 5MB default

    // @desc    Validate file before upload
    const validateFile = (file) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload an image file');
            return false;
        }

        if (file.size > maxSize) {
            toast.error(`File size should be less than ${formatFileSize(maxSize)}`);
            return false;
        }

        return true;
    };

    // @desc    Handle file upload with progress
    const uploadImage = async (file) => {
        if (!validateFile(file)) return null;

        try {
            setUploading(true);
            setProgress(0);

            const { imageUrl } = await uploadAPI.uploadImage(file, (progressEvent) => {
                const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setProgress(progress);
            });

            return imageUrl;
        } catch (error) {
            toast.error('Failed to upload image');
            return null;
        } finally {
            setUploading(false);
            setProgress(0);
        }
    };

    return {
        uploading,
        progress,
        uploadImage
    };
}; 