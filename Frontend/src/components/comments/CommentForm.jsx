import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

// @desc    Reusable form component for comments and replies
export default function CommentForm({
    onSubmit,
    initialValue = '',
    placeholder = 'Write a comment...',
    buttonText = 'Post',
    loading = false,
    isReply = false
}) {
    const [content, setContent] = useState(initialValue);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // @desc    Handle form submission and validation
    const handleSubmit = (e) => {
        e.preventDefault();
        if (content.trim()) {
            onSubmit(content.trim());
            if (!initialValue) {
                setContent('');
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-600 mb-3">
                    Want to join the conversation? Please log in to comment.
                </p>
                <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Log In to Comment
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className={`space-y-3 ${isReply ? 'ml-12' : ''}`}>
            <div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    rows={isReply ? 2 : 3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    maxLength={500}
                />
                <div className="mt-1 text-sm text-gray-500 text-right">
                    {content.length}/500
                </div>
            </div>
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={loading || !content.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    {loading ? 'Posting...' : buttonText}
                </button>
            </div>
        </form>
    );
} 