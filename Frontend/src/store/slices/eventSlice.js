import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    events: [],
    event: null,
    loading: false,
    error: null,
    filters: {
        category: '',
        search: '',
    },
};

// @desc    Redux slice for managing events state
const eventSlice = createSlice({
    name: 'events',
    initialState,
    reducers: {
        // Fetch events
        fetchEventsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchEventsSuccess: (state, action) => {
            state.loading = false;
            state.events = action.payload;
        },
        fetchEventsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // @desc    Start event fetch operation
        fetchEventStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        // @desc    Handle successful event fetch
        fetchEventSuccess: (state, action) => {
            state.loading = false;
            state.event = action.payload;
        },
        fetchEventFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Create event
        createEventStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        createEventSuccess: (state, action) => {
            state.loading = false;
            state.events.unshift(action.payload);
        },
        createEventFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Update event
        updateEventStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        updateEventSuccess: (state, action) => {
            state.loading = false;
            state.event = action.payload;
            state.events = state.events.map((event) =>
                event._id === action.payload._id ? action.payload : event
            );
        },
        updateEventFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Delete event
        deleteEventStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        deleteEventSuccess: (state, action) => {
            state.loading = false;
            state.events = state.events.filter((event) => event._id !== action.payload);
            state.event = null;
        },
        deleteEventFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },

        // Update filters
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };
        },

        // Clear event
        clearEvent: (state) => {
            state.event = null;
            state.error = null;
        },

        // Clear errors
        clearError: (state) => {
            state.error = null;
        },
    },
});

export const {
    fetchEventsStart,
    fetchEventsSuccess,
    fetchEventsFailure,
    fetchEventStart,
    fetchEventSuccess,
    fetchEventFailure,
    createEventStart,
    createEventSuccess,
    createEventFailure,
    updateEventStart,
    updateEventSuccess,
    updateEventFailure,
    deleteEventStart,
    deleteEventSuccess,
    deleteEventFailure,
    setFilters,
    clearEvent,
    clearError,
} = eventSlice.actions;

export default eventSlice.reducer; 