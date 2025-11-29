/**
 * In-memory rate limiting implementation
 * For production, consider using Redis
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Rate limit configuration
 */
export const rateLimitConfig = {
    // API endpoints - 100 requests per minute
    api: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 100,
    },
    // Authentication endpoints - 5 attempts per 15 minutes
    auth: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 5,
    },
    // Payment endpoints - 10 requests per minute
    payment: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 10,
    },
    // General endpoints - 50 requests per minute
    general: {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 50,
    },
};

/**
 * Check if request is rate limited
 */
export function checkRateLimit(
    key: string,
    config: { windowMs: number; maxRequests: number }
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = store.get(key);

    // Create new entry if doesn't exist or window expired
    if (!entry || now > entry.resetTime) {
        const newEntry: RateLimitEntry = {
            count: 1,
            resetTime: now + config.windowMs,
        };
        store.set(key, newEntry);
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            resetTime: newEntry.resetTime,
        };
    }

    // Check if limit exceeded
    if (entry.count >= config.maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
        };
    }

    // Increment counter
    entry.count++;
    return {
        allowed: true,
        remaining: config.maxRequests - entry.count,
        resetTime: entry.resetTime,
    };
}

/**
 * Get rate limit key from request
 */
export function getRateLimitKey(
    identifier: string,
    endpoint: string
): string {
    return `${identifier}:${endpoint}`;
}

/**
 * Clean up expired entries (run periodically)
 */
export function cleanupExpiredEntries(): void {
    const now = Date.now();
    const entriesToDelete = [];

    for (const [key, entry] of store.entries()) {
        if (now > entry.resetTime) {
            entriesToDelete.push(key);
        }
    }

    entriesToDelete.forEach(key => store.delete(key));
}

// Run cleanup every 5 minutes
if (typeof global !== 'undefined') {
    setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

/**
 * Helper to get client IP from request
 */
export function getClientIp(headers: HeadersInit | Headers): string {
    let forwardedFor: string | null = null;
    let realIp: string | null = null;

    if (headers instanceof Headers) {
        forwardedFor = headers.get('x-forwarded-for');
        realIp = headers.get('x-real-ip');
    } else if (headers && typeof headers === 'object') {
        const headersObj = headers as Record<string, any>;
        forwardedFor = headersObj['x-forwarded-for'] || headersObj['X-Forwarded-For'];
        realIp = headersObj['x-real-ip'] || headersObj['X-Real-IP'];

        if (typeof forwardedFor !== 'string') {
            forwardedFor = null;
        }
        if (typeof realIp !== 'string') {
            realIp = null;
        }
    }

    return (forwardedFor?.split(',')[0].trim()) || realIp || 'unknown';
}
