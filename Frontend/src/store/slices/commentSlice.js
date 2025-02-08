import { createSlice } from '@reduxjs/toolkit';

// @desc    Redux slice for managing comments state
const commentSlice = createSlice({
    name: 'comments',
    initialState: {
        comments: [],
        loading: false,
        error: null
    },
    reducers: {
        // @desc    Start comments fetch operation
        fetchCommentsStart: (state) => {
            state.loading = true;
            state.error = null;
        },

        // @desc    Handle successful comments fetch
        fetchCommentsSuccess: (state, action) => {
            state.loading = false;
            state.comments = action.payload;
        },

        // @desc    Handle comments fetch failure
        fetchCommentsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Add comment
        addCommentStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        addCommentSuccess: (state, action) => {
            state.loading = false;
            state.comments.unshift(action.payload);
        },
        addCommentFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Add reply
        addReplySuccess: (state, action) => {
            const { parentId, reply } = action.payload;
            const parentComment = state.comments.find(comment => comment._id === parentId);
            if (parentComment) {
                parentComment.replies.push(reply);
            }
        },

        // Update comment
        updateCommentStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateCommentSuccess: (state, action) => {
            state.loading = false;
            const { _id, content } = action.payload;
            const comment = state.comments.find(c => c._id === _id);
            if (comment) {
                comment.content = content;
            }
        },
        updateCommentFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Delete comment
        deleteCommentStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteCommentSuccess: (state, action) => {
            state.loading = false;
            state.comments = state.comments.filter(
                comment => comment._id !== action.payload
            );
        },
        deleteCommentFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Toggle like
        toggleLikeSuccess: (state, action) => {
            const { commentId, likes } = action.payload;
            const comment = state.comments.find(c => c._id === commentId);
            if (comment) {
                comment.likes = likes;
            }
        },

        // Handle real-time updates
        handleNewComment: (state, action) => {
            if (!action.payload.parentComment) {
                state.comments.unshift(action.payload);
            } else {
                const parentComment = state.comments.find(
                    comment => comment._id === action.payload.parentComment
                );
                if (parentComment) {
                    parentComment.replies.push(action.payload);
                }
            }
        },
        handleUpdateComment: (state, action) => {
            const { _id, content } = action.payload;
            const comment = state.comments.find(c => c._id === _id);
            if (comment) {
                comment.content = content;
            }
        },
        handleDeleteComment: (state, action) => {
            state.comments = state.comments.filter(
                comment => comment._id !== action.payload
            );
        },
        handleLikeUpdate: (state, action) => {
            const { commentId, likes } = action.payload;
            const comment = state.comments.find(c => c._id === commentId);
            if (comment) {
                comment.likes = likes;
            }
        },

        // Clear state
        clearComments: (state) => {
            state.comments = [];
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    fetchCommentsStart,
    fetchCommentsSuccess,
    fetchCommentsFailure,
    addCommentStart,
    addCommentSuccess,
    addCommentFailure,
    addReplySuccess,
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
    clearComments,
} = commentSlice.actions;

export default commentSlice.reducer; 