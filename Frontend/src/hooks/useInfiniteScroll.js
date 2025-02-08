// @desc    Custom hook for infinite scrolling functionality
import { useState, useEffect, useCallback } from 'react';

export const useInfiniteScroll = (callback, options = {}) => {
    const [isFetching, setIsFetching] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const {
        threshold = 100,
        initialPage = 1
    } = options;

    // @desc    Check if user has scrolled near bottom
    const handleScroll = useCallback(() => {
        if (!hasMore || isFetching) return;

        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.scrollY;
        const clientHeight = window.innerHeight;

        if (scrollHeight - scrollTop - clientHeight < threshold) {
            setIsFetching(true);
        }
    }, [hasMore, isFetching, threshold]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        if (!isFetching) return;

        const fetchMore = async () => {
            try {
                const hasMoreData = await callback();
                setHasMore(hasMoreData);
            } finally {
                setIsFetching(false);
            }
        };

        fetchMore();
    }, [isFetching, callback]);

    return { isFetching, hasMore };
}; 