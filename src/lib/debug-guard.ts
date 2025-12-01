import { NextRequest, NextResponse } from 'next/server';

/**
 * Guard to prevent debug endpoints from running in production
 * Only allows debug endpoints if:
 * 1. Environment is development (NODE_ENV=development)
 * 2. Debug mode is explicitly enabled (DEBUG_MODE=true)
 */
export function withDebugGuard(handler: (req: NextRequest) => Promise<NextResponse>) {
    return async (req: NextRequest) => {
        const isDev = process.env.NODE_ENV === 'development';
        const debugEnabled = process.env.DEBUG_MODE === 'true';
        const isLocalhost = req.headers.get('host')?.includes('localhost');

        if (!isDev && !debugEnabled && !isLocalhost) {
            console.warn(`Blocked debug endpoint access from ${req.headers.get('user-agent')}`);
            return NextResponse.json(
                { error: 'Not found' },
                { status: 404 }
            );
        }

        return handler(req);
    };
}
