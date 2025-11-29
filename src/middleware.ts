import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Security middleware that adds security headers and handles CORS
 */
export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Security Headers
    // Prevent clickjacking attacks
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');

    // Prevent MIME type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Enable XSS protection in browsers
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Referrer policy for privacy
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions policy (formerly Feature Policy)
    response.headers.set(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=(self), payment=()'
    );

    // Content Security Policy
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://js.stripe.com; " +
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' https://fonts.gstatic.com; " +
        "connect-src 'self' https: wss:; " +
        "frame-src https://js.stripe.com https://checkout.stripe.com; " +
        "object-src 'none'"
    );

    // CORS headers
    const origin = request.headers.get('origin');
    const allowedOrigins = [
        process.env.NEXT_PUBLIC_APP_URL,
        'http://localhost:3000',
        'http://localhost:3001',
    ];

    if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set(
            'Access-Control-Allow-Methods',
            'GET, POST, PUT, DELETE, PATCH, OPTIONS'
        );
        response.headers.set(
            'Access-Control-Allow-Headers',
            'Content-Type, Authorization, X-CSRF-Token'
        );
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: response.headers,
        });
    }

    return response;
}

// Configure which routes to apply middleware to
export const config = {
    matcher: [
        // Apply to all routes except static files and Next.js internals
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
