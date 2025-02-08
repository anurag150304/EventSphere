import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { UserIcon, TrashIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { eventAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

// @desc    Component to display and manage event comments
export default function CommentSection({ eventId }) {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        fetchComments();
    }, [eventId]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const data = await eventAPI.getEventComments(eventId);
            setComments(data);
        } catch (err) {
            setError(err.message);
            toast.error('Failed to load comments');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login', { state: { from: `/events/${eventId}` } });
            return;
        }

        if (!newComment.trim()) {
            return;
        }

        try {
            setLoading(true);
            const comment = await eventAPI.addComment(eventId, { content: newComment });
            setComments([...comments, comment]);
            setNewComment('');
            toast.success('Comment added successfully');
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (commentId) => {
        try {
            await eventAPI.deleteComment(eventId, commentId);
            setComments(comments.filter((comment) => comment._id !== commentId));
            toast.success('Comment deleted successfully');
        } catch (err) {
            toast.error(err.message);
        }
    };

    if (error) {
        return (
            <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Error loading comments</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="relative">
                <div className="overflow-hidden rounded-lg border border-gray-300 shadow-sm focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500">
                    <textarea
                        rows={3}
                        name="comment"
                        id="comment"
                        className="block w-full resize-none border-0 py-3 focus:ring-0 sm:text-sm"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="py-2 px-3 bg-gray-50">
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !newComment.trim()}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                            >
                                {loading ? 'Posting...' : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="flow-root">
                <ul className="-mb-8">
                    {comments.map((comment, commentIdx) => (
                        <li key={comment._id}>
                            <div className="relative pb-8">
                                {commentIdx !== comments.length - 1 ? (
                                    <span
                                        className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                        aria-hidden="true"
                                    />
                                ) : null}
                                <div className="relative flex items-start space-x-3">
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            {comment.user.profileImage ? (
                                                <img
                                                    src={comment.user.profileImage}
                                                    alt={comment.user.name}
                                                    className="h-10 w-10 rounded-full"
                                                />
                                            ) : (
                                                <UserIcon className="h-6 w-6 text-purple-600" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div>
                                            <div className="text-sm">
                                                <span className="font-medium text-gray-900">
                                                    {comment.user.name}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-sm text-gray-500">
                                                {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                            </p>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700">
                                            <p>{comment.content}</p>
                                        </div>
                                        {user?._id === comment.user._id && (
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(comment._id)}
                                                    className="inline-flex items-center text-sm text-gray-500 hover:text-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4 mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                {comments.length === 0 && !loading && (
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                    </div>
                )}
                {loading && (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
                    </div>
                )}
            </div>
        </div>
    );
}

// @desc    Handle comment submission and real-time updates
const handleAddComment = async (content) => {
    // Implementation...
}; 