// @desc    URL utility functions for handling URL operations
import { stringify } from 'query-string';

export const urlUtils = {
    // @desc    Build URL with query parameters
    buildUrl: (baseUrl, params = {}) => {
        const cleanParams = Object.entries(params)
            .reduce((acc, [key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    acc[key] = value;
                }
                return acc;
            }, {});

        const queryString = stringify(cleanParams);
        return queryString ? `${baseUrl}?${queryString}` : baseUrl;
    },

    // @desc    Extract query parameters from URL
    getQueryParams: () => {
        const searchParams = new URLSearchParams(window.location.search);
        const params = {};

        for (const [key, value] of searchParams.entries()) {
            params[key] = value;
        }

        return params;
    },

    // @desc    Update URL query parameters without page reload
    updateQueryParams: (params) => {
        const newUrl = urlUtils.buildUrl(window.location.pathname, {
            ...urlUtils.getQueryParams(),
            ...params
        });
        window.history.pushState({}, '', newUrl);
    }
}; 