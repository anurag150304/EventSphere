import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

// Function to upload buffer to Cloudinary
const uploadToCloudinary = async (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'event-manager',
                resource_type: 'auto'
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );

        const bufferStream = new Readable();
        bufferStream.push(buffer);
        bufferStream.push(null);
        bufferStream.pipe(uploadStream);
    });
};

// @route   POST /api/upload
// @desc    Upload an image to Cloudinary
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        // Upload image to Cloudinary
        const result = await uploadToCloudinary(req.file.buffer);

        res.json({
            success: true,
            imageUrl: result.secure_url
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading file',
            error: error.message
        });
    }
});

export default router; 