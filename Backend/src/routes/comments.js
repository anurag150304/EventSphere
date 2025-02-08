import express from 'express';
import {
    getEventComments,
    createComment,
    updateComment,
    deleteComment,
    toggleLike
} from '../controllers/commentController.js';
import { protect, fullAccess } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

// Public routes
router.get('/', getEventComments);

// Protected routes - guests can create comments but can't edit/delete/like
router.post('/', protect, createComment);
router.put('/:commentId', protect, fullAccess, updateComment);
router.delete('/:commentId', protect, fullAccess, deleteComment);
router.post('/:commentId/like', protect, fullAccess, toggleLike);

export default router; 