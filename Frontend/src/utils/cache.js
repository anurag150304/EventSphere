// @desc    Cache utility for managing local data caching
class Cache {
    constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
        this.cache = new Map();
        this.maxAge = maxAge;
    }

    // @desc    Get item from cache
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;

        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.value;
    }

    // @desc    Set item in cache with expiry
    set(key, value, maxAge = this.maxAge) {
        this.cache.set(key, {
            value,
            expiry: Date.now() + maxAge
        });
    }

    // @desc    Remove item from cache
    remove(key) {
        this.cache.delete(key);
    }

    // @desc    Clear all cached items
    clear() {
        this.cache.clear();
    }
}

export const cache = new Cache(); 