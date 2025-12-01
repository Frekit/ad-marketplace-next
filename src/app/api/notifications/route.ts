import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { applyRateLimit, addRateLimitHeaders, logRequest } from '@/lib/api-middleware';
import { rateLimitConfig } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
    const startTime = Date.now();

    // Apply rate limiting
    const rateLimit = applyRateLimit(req, '/api/notifications', rateLimitConfig.api);
    if (rateLimit instanceof NextResponse) {
        logRequest('GET', '/api/notifications', 429, Date.now() - startTime, req);
        return rateLimit;
    }

    try {
        const session = await auth();

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();
        const { searchParams } = new URL(req.url);

        // Get pagination parameters
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
        const offset = parseInt(searchParams.get('offset') || '0');

        // Get unread filter
        const unreadOnly = searchParams.get('unread_only') === 'true';

        // Build query
        let query = supabase
            .from('notifications')
            .select('*', { count: 'exact' })
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (unreadOnly) {
            query = query.eq('read', false);
        }

        // Apply pagination
        query = query.range(offset, offset + limit - 1);

        const { data: notifications, count, error } = await query;

        // If notifications table doesn't exist, return empty list instead of error
        if (error?.code === 'PGRST205') {
            console.warn('Notifications table not yet created. Migration needs to be applied in Supabase.');
            const response = NextResponse.json({
                notifications: [],
                total: 0,
                limit,
                offset,
                _warning: 'Notifications table not yet created. Please apply the migration.'
            });

            const responseWithHeaders = addRateLimitHeaders(response, rateLimit.headers);
            logRequest('GET', '/api/notifications', 200, Date.now() - startTime, req, session?.user?.id);
            return responseWithHeaders;
        }

        if (error) {
            throw error;
        }

        const response = NextResponse.json({
            notifications: notifications || [],
            total: count || 0,
            limit,
            offset
        });

        const responseWithHeaders = addRateLimitHeaders(response, rateLimit.headers);
        logRequest('GET', '/api/notifications', 200, Date.now() - startTime, req, session?.user?.id);
        return responseWithHeaders;

    } catch (error: any) {
        console.error('Error fetching notifications:', error);
        logRequest('GET', '/api/notifications', 500, Date.now() - startTime, req);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}
