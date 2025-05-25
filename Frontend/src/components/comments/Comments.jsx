import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import {
    fetchCommentsStart,
    fetchCommentsSuccess,
    fetchCommentsFailure,
    addCommentStart,
    addCommentSuccess,
    addCommentFailure,
    updateCommentStart,
    updateCommentSuccess,
    updateCommentFailure,
    deleteCommentStart,
    deleteCommentSuccess,
    deleteCommentFailure,
    toggleLikeSuccess,
    handleNewComment,
    handleUpdateComment,
    handleDeleteComment,
    handleLikeUpdate,
    clearComments
} from '../../store/slices/commentSlice';
import { commentsAPI } from '../../services/api';
import CommentForm from './CommentForm';
import Comment from './Comment';
import UpgradePrompt from '../common/UpgradePrompt';
import { toast } from 'react-hot-toast';

// @desc    Socket.IO client configuration for real-time comments
const socket = io(import.meta.env.VITE_BASE_URL, {
    path: '/socket.io',
    withCredentials: true,
    transports: ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 3,
    reconnectionDelay: 1000,
    timeout: 20000
});

// Handle socket connection errors
socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
});

export default function Comments({ eventId }) {
    const dispatch = useDispatch();
    const { comments, loading, error } = useSelector((state) => state.comments);
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const isGuest = user?.role === 'guest';

    useEffect(() => {
        fetchComments();

        // Socket.io event listeners
        socket.emit('joinEvent', eventId);

        socket.on('newComment', (comment) => {
            dispatch(handleNewComment(comment));
        });

        socket.on('updateComment', (comment) => {
            dispatch(handleUpdateComment(comment));
        });

        socket.on('deleteComment', (commentId) => {
            dispatch(handleDeleteComment(commentId));
        });

        socket.on('likeComment', ({ commentId, likes }) => {
            dispatch(handleLikeUpdate({ commentId, likes }));
        });

        return () => {
            socket.emit('leaveEvent', eventId);
            socket.off('newComment');
            socket.off('updateComment');
            socket.off('deleteComment');
            socket.off('likeComment');
            dispatch(clearComments());
        };
    }, [eventId, dispatch]);

    const fetchComments = async () => {
        try {
            dispatch(fetchCommentsStart());
            const { comments } = await commentsAPI.getEventComments(eventId);
            dispatch(fetchCommentsSuccess(comments));
        } catch (error) {
            dispatch(fetchCommentsFailure(error.message));
            toast.error('Failed to load comments');
        }
    };

    const handleAddComment = async (content) => {
        if (!isAuthenticated) {
            toast.error('Please log in to add a comment');
            return;
        }
        if (isGuest) {
            toast.error('Guest users cannot add comments');
            return;
        }

        try {
            dispatch(addCommentStart());
            const { comment } = await commentsAPI.createComment(eventId, { content });
            dispatch(addCommentSuccess(comment));
            toast.success('Comment added successfully');
        } catch (error) {
            dispatch(addCommentFailure(error.message));
            toast.error('Failed to add comment');
        }
    };

    const handleAddReply = async (parentId, content) => {
        if (!isAuthenticated) {
            toast.error('Please log in to reply to comments');
            return;
        }
        if (isGuest) {
            toast.error('Guest users cannot reply to comments');
            return;
        }

        try {
            dispatch(addCommentStart());
            const { comment } = await commentsAPI.createComment(eventId, {
                content,
                parentComment: parentId
            });
            dispatch(addCommentSuccess(comment));
            toast.success('Reply added successfully');
        } catch (error) {
            dispatch(addCommentFailure(error.message));
            toast.error('Failed to add reply');
        }
    };

    const handleEditComment = async (commentId, content) => {
        if (isGuest) {
            toast.error('Guest users cannot edit comments');
            return;
        }

        try {
            dispatch(updateCommentStart());
            const { comment } = await commentsAPI.updateComment(eventId, commentId, content);
            dispatch(updateCommentSuccess(comment));
            toast.success('Comment updated successfully');
        } catch (error) {
            dispatch(updateCommentFailure(error.message));
            toast.error('Failed to update comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (isGuest) {
            toast.error('Guest users cannot delete comments');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this comment?')) {
            return;
        }

        try {
            dispatch(deleteCommentStart());
            await commentsAPI.deleteComment(eventId, commentId);
            dispatch(deleteCommentSuccess(commentId));
            toast.success('Comment deleted successfully');
        } catch (error) {
            dispatch(deleteCommentFailure(error.message));
            toast.error('Failed to delete comment');
        }
    };

    const handleLikeComment = async (commentId) => {
        if (isGuest) {
            toast.error('Guest users cannot like comments');
            return;
        }

        try {
            const { likes } = await commentsAPI.toggleLike(eventId, commentId);
            dispatch(toggleLikeSuccess({ commentId, likes }));
        } catch (error) {
            toast.error('Failed to toggle like');
        }
    };

    return (
        <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>

            <div className="mb-6">
                <CommentForm onSubmit={handleAddComment} loading={loading} />
            </div>

            {isGuest && (
                <UpgradePrompt
                    message="Create a full account to edit, delete, or like comments."
                    className="mb-6"
                />
            )}

            {error && (
                <div className="bg-red-50 p-4 rounded-md mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {loading && comments.length === 0 ? (
                <div className="text-center py-4">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                </div>
            ) : comments.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No comments yet</p>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <Comment
                            key={comment._id}
                            comment={comment}
                            onReply={handleAddReply}
                            onEdit={handleEditComment}
                            onDelete={handleDeleteComment}
                            onLike={handleLikeComment}
                            isGuest={isGuest}
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 