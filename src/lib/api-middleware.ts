import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitKey, getClientIp, rateLimitConfig } from './rate-limit';
import { ApiResponse, ApiErrors } from './api-error';

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(
    request: NextRequest,
    endpoint: string,
    config: { windowMs: number; maxRequests: number } = rateLimitConfig.general
) {
    const clientIp = getClientIp(request.headers);
    const key = getRateLimitKey(clientIp, endpoint);
    const limit = checkRateLimit(key, config);

    if (!limit.allowed) {
        const resetDate = new Date(limit.resetTime);
        return NextResponse.json(
            {
                error: 'Too many requests, please try again later',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.ceil((limit.resetTime - Date.now()) / 1000),
                resetTime: resetDate.toISOString(),
            },
            {
                status: 429,
                headers: {
                    'Retry-After': Math.ceil((limit.resetTime - Date.now()) / 1000).toString(),
                    'X-RateLimit-Limit': config.maxRequests.toString(),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': resetDate.toISOString(),
                },
            }
        );
    }

    return {
        allowed: true,
        headers: {
            'X-RateLimit-Limit': config.maxRequests.toString(),
            'X-RateLimit-Remaining': limit.remaining.toString(),
            'X-RateLimit-Reset': new Date(limit.resetTime).toISOString(),
        },
    };
}

/**
 * Middleware to add rate limiting headers to response
 */
export function addRateLimitHeaders(
    response: NextResponse,
    headers: Record<string, string>
): NextResponse {
    Object.entries(headers).forEach(([key, value]) => {
        response.headers.set(key, value);
    });
    return response;
}

/**
 * Request logging and analytics
 */
interface RequestLog {
    timestamp: string;
    method: string;
    path: string;
    status: number;
    duration: number;
    ip: string;
    userId?: string;
}

const requestLogs: RequestLog[] = [];

/**
 * Log API request
 */
export function logRequest(
    method: string,
    path: string,
    status: number,
    duration: number,
    request: NextRequest,
    userId?: string
): void {
    const log: RequestLog = {
        timestamp: new Date().toISOString(),
        method,
        path,
        status,
        duration,
        ip: getClientIp(request.headers),
        userId,
    };

    requestLogs.push(log);

    // Keep only last 1000 logs in memory
    if (requestLogs.length > 1000) {
        requestLogs.shift();
    }

    // Log errors to console
    if (status >= 400) {
        console.error(`[${log.timestamp}] ${method} ${path} - ${status} (${duration}ms from ${log.ip})`);
    }
}

/**
 * Get request logs
 */
export function getRequestLogs(filters?: { status?: number; method?: string }): RequestLog[] {
    let logs = [...requestLogs];

    if (filters?.status) {
        logs = logs.filter(log => log.status === filters.status);
    }

    if (filters?.method) {
        logs = logs.filter(log => log.method === filters.method);
    }

    return logs.slice(-100); // Return last 100 logs
}

/**
 * Validate request origin
 */
export function validateOrigin(request: NextRequest): boolean {
    const origin = request.headers.get('origin');
    if (!origin) return true; // Allow requests without origin header

    const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        'http://localhost:3000',
        'http://localhost:3001',
    ].filter(Boolean);

    return allowedOrigins.includes(origin);
}

/**
 * Get user ID from session (if available)
 */
export function getUserIdFromHeaders(headers: Headers | HeadersInit): string | undefined {
    // This is a placeholder - in production, you'd decode the JWT from cookies
    // For now, just return undefined
    return undefined;
}
