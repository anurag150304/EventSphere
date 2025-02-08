import Comment from '../models/Comment.js';
import Event from '../models/Event.js';
import { io } from '../app.js';
import { sendCommentNotification, sendReplyNotification } from '../services/emailService.js';

// @desc    Get comments for an event
// @route   GET /api/events/:eventId/comments
// @access  Public
export const getEventComments = async (req, res) => {
    try {
        const comments = await Comment.find({
            event: req.params.eventId,
            parentComment: null
        })
            .populate('user', 'name profileImage')
            .populate({
                path: 'replies',
                populate: {
                    path: 'user',
                    select: 'name profileImage'
                }
            })
            .sort('-createdAt');

        res.json({
            success: true,
            comments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Create a comment
// @route   POST /api/events/:eventId/comments
// @access  Private
export const createComment = async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId)
            .populate('creator', 'email name');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const comment = await Comment.create({
            event: req.params.eventId,
            user: req.user._id,
            content: req.body.content,
            parentComment: req.body.parentComment || null
        });

        // If this is a reply, add it to the parent comment's replies
        if (req.body.parentComment) {
            const parentComment = await Comment.findById(req.body.parentComment)
                .populate('user', 'email name');

            await Comment.findByIdAndUpdate(req.body.parentComment, {
                $push: { replies: comment._id }
            });

            // Send email notification to parent comment author
            if (parentComment.user.email && parentComment.user._id.toString() !== req.user._id.toString()) {
                try {
                    await sendReplyNotification(
                        event,
                        { ...comment.toObject(), user: { name: req.user.name } },
                        parentComment,
                        parentComment.user.email
                    );
                } catch (emailError) {
                    console.error('Failed to send reply notification email:', emailError);
                }
            }
        } else {
            // Send email notification to event creator
            if (event.creator.email && event.creator._id.toString() !== req.user._id.toString()) {
                try {
                    await sendCommentNotification(
                        event,
                        { ...comment.toObject(), user: { name: req.user.name } },
                        event.creator.email
                    );
                } catch (emailError) {
                    console.error('Failed to send comment notification email:', emailError);
                }
            }
        }

        // Populate user information
        await comment.populate('user', 'name profileImage');

        // Emit socket event for real-time updates
        io.to(`event:${req.params.eventId}`).emit('newComment', comment);

        res.status(201).json({
            success: true,
            comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Update a comment
// @route   PUT /api/events/:eventId/comments/:commentId
// @access  Private
export const updateComment = async (req, res) => {
    try {
        let comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is comment owner
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this comment'
            });
        }

        comment = await Comment.findByIdAndUpdate(
            req.params.commentId,
            { content: req.body.content },
            { new: true }
        ).populate('user', 'name profileImage');

        // Emit socket event for real-time updates
        io.to(`event:${req.params.eventId}`).emit('updateComment', comment);

        res.json({
            success: true,
            comment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/events/:eventId/comments/:commentId
// @access  Private
export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user is comment owner
        if (comment.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        // Remove comment from parent's replies if it's a reply
        if (comment.parentComment) {
            await Comment.findByIdAndUpdate(comment.parentComment, {
                $pull: { replies: comment._id }
            });
        }

        // Delete all replies if it's a parent comment
        if (comment.replies.length > 0) {
            await Comment.deleteMany({ _id: { $in: comment.replies } });
        }

        await comment.deleteOne();

        // Emit socket event for real-time updates
        io.to(`event:${req.params.eventId}`).emit('deleteComment', req.params.commentId);

        res.json({
            success: true,
            message: 'Comment deleted'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
};

// @desc    Like/Unlike a comment
// @route   POST /api/events/:eventId/comments/:commentId/like
// @access  Private
export const toggleLike = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        const isLiked = comment.likes.includes(req.user._id);

        if (isLiked) {
            comment.likes = comment.likes.filter(
                (userId) => userId.toString() !== req.user._id.toString()
            );
        } else {
            comment.likes.push(req.user._id);
        }

        await comment.save();

        // Emit socket event for real-time updates
        io.to(`event:${req.params.eventId}`).emit('likeComment', {
            commentId: req.params.commentId,
            likes: comment.likes
        });

        res.json({
            success: true,
            likes: comment.likes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
}; 