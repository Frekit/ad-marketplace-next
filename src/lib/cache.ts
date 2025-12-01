/**
 * Simple in-memory cache with TTL support
 * Used for caching frequently accessed data like stats, recommendations, etc.
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number;
}

class Cache {
    private store: Map<string, CacheEntry<any>> = new Map();

    /**
     * Get value from cache
     * @param key Cache key
     * @returns Cached value or null if expired/not found
     */
    get<T>(key: string): T | null {
        const entry = this.store.get(key);

        if (!entry) {
            return null;
        }

        // Check if expired
        const now = Date.now();
        if (now - entry.timestamp > entry.ttl) {
            this.store.delete(key);
            return null;
        }

        return entry.data as T;
    }

    /**
     * Set value in cache
     * @param key Cache key
     * @param data Data to cache
     * @param ttlMs Time to live in milliseconds (default: 5 minutes)
     */
    set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
        this.store.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttlMs
        });
    }

    /**
     * Delete specific cache entry
     */
    delete(key: string): void {
        this.store.delete(key);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.store.clear();
    }

    /**
     * Clear expired entries
     */
    clearExpired(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];

        this.store.forEach((entry, key) => {
            if (now - entry.timestamp > entry.ttl) {
                keysToDelete.push(key);
            }
        });

        keysToDelete.forEach(key => this.store.delete(key));
    }

    /**
     * Get cache statistics
     */
    getStats() {
        return {
            size: this.store.size,
            keys: Array.from(this.store.keys())
        };
    }
}

// Export singleton instance
export const cache = new Cache();

/**
 * Helper function for cached API calls
 * @param key Cache key
 * @param fetchFn Function that fetches the data
 * @param ttlMs Time to live in milliseconds
 */
export async function cachedFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000
): Promise<T> {
    // Try to get from cache
    const cached = cache.get<T>(key);
    if (cached) {
        return cached;
    }

    // Fetch and cache
    const data = await fetchFn();
    cache.set(key, data, ttlMs);
    return data;
}

/**
 * Cache key generators for different data types
 */
export const cacheKeys = {
    // Admin stats
    adminStats: () => 'admin:stats',
    adminStatsEnhanced: () => 'admin:stats:enhanced',

    // Freelancer stats
    freelancerCompletion: (userId: string) => `freelancer:${userId}:completion`,
    freelancerViews: (userId: string) => `freelancer:${userId}:views`,
    freelancerTasks: (userId: string) => `freelancer:${userId}:tasks`,
    freelancerMilestones: (userId: string) => `freelancer:${userId}:milestones`,

    // Client data
    clientProjects: (clientId: string) => `client:${clientId}:projects`,
    clientRecommendations: (clientId: string) => `client:${clientId}:recommendations`,

    // Search/Browse
    freelancerSearch: (query: string) => `search:freelancers:${query}`,
    projectSearch: (query: string) => `search:projects:${query}`,
};

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
    // Invalidate freelancer data when they update profile
    invalidateFreelancer: (userId: string) => {
        cache.delete(cacheKeys.freelancerCompletion(userId));
        cache.delete(cacheKeys.freelancerViews(userId));
        cache.delete(cacheKeys.freelancerTasks(userId));
        cache.delete(cacheKeys.freelancerMilestones(userId));
    },

    // Invalidate client data when they create/update project
    invalidateClient: (clientId: string) => {
        cache.delete(cacheKeys.clientProjects(clientId));
        cache.delete(cacheKeys.clientRecommendations(clientId));
    },

    // Invalidate all admin stats
    invalidateAdminStats: () => {
        cache.delete(cacheKeys.adminStats());
        cache.delete(cacheKeys.adminStatsEnhanced());
    },

    // Invalidate all caches
    invalidateAll: () => {
        cache.clear();
    }
};
