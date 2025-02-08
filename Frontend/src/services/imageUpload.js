const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/your-cloud-name/image/upload';
const CLOUDINARY_UPLOAD_PRESET = 'your-upload-preset';

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Failed to upload image');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const validateImage = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or GIF image.');
    }

    if (file.size > maxSize) {
        throw new Error('File size too large. Please upload an image smaller than 5MB.');
    }

    return true;
}; 