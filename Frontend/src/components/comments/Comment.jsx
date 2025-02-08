import { useState } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { HeartIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import CommentForm from './CommentForm';

// @desc    Individual comment component with reply and like functionality
export default function Comment({
    comment,
    onReply,
    onEdit,
    onDelete,
    onLike,
    isReply = false
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
    const { user } = useSelector((state) => state.auth);
    const isOwner = user?._id === comment.user._id;
    const hasLiked = comment.likes.includes(user?._id);

    // @desc    Handle comment editing and update UI
    const handleEdit = (content) => {
        onEdit(comment._id, content);
        setIsEditing(false);
    };

    // @desc    Handle reply submission and update UI
    const handleReply = (content) => {
        onReply(comment._id, content);
        setIsReplying(false);
    };

    return (
        <div className={`${isReply ? 'ml-12' : ''} mb-4`}>
            <div className="flex space-x-3">
                <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {comment.user.profileImage ? (
                            <img
                                src={comment.user.profileImage}
                                alt={comment.user.name}
                                className="h-10 w-10 rounded-full"
                            />
                        ) : (
                            <span className="text-lg font-medium text-gray-500">
                                {comment.user.name.charAt(0).toUpperCase()}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex-grow">
                    <div className="bg-gray-50 rounded-lg px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <span className="font-medium text-gray-900">{comment.user.name}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                    {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                                </span>
                            </div>
                            {isOwner && !isEditing && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="text-gray-400 hover:text-gray-500"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(comment._id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </div>
                        {isEditing ? (
                            <CommentForm
                                initialValue={comment.content}
                                onSubmit={handleEdit}
                                buttonText="Save"
                            />
                        ) : (
                            <p className="text-gray-700 mt-2">{comment.content}</p>
                        )}
                    </div>
                    <div className="mt-2 flex items-center space-x-4">
                        <button
                            onClick={() => onLike(comment._id)}
                            className={`flex items-center space-x-1 text-sm ${hasLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                                }`}
                        >
                            {hasLiked ? (
                                <HeartSolidIcon className="h-4 w-4" />
                            ) : (
                                <HeartIcon className="h-4 w-4" />
                            )}
                            <span>{comment.likes.length}</span>
                        </button>
                        {!isReply && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Reply
                            </button>
                        )}
                    </div>
                    {isReplying && (
                        <div className="mt-3">
                            <CommentForm
                                onSubmit={handleReply}
                                placeholder="Write a reply..."
                                buttonText="Reply"
                                isReply
                            />
                        </div>
                    )}
                </div>
            </div>
            {!isReply && comment.replies && comment.replies.length > 0 && (
                <div className="mt-4">
                    {comment.replies.map((reply) => (
                        <Comment
                            key={reply._id}
                            comment={reply}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onLike={onLike}
                            isReply
                        />
                    ))}
                </div>
            )}
        </div>
    );
} 