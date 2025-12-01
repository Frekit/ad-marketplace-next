import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface TrackViewRequest {
    freelancerId: string;
}

interface TrackViewResponse {
    success: boolean;
    message: string;
    viewId?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse<TrackViewResponse>> {
    try {
        const { freelancerId } = await req.json() as TrackViewRequest;

        if (!freelancerId) {
            return NextResponse.json(
                { success: false, message: 'freelancerId is required' },
                { status: 400 }
            );
        }

        const session = await auth();
        const supabase = createClient();

        // Determine viewer type based on session
        let viewerType = 'guest';
        let viewerId: string | null = null;

        if (session?.user) {
            viewerId = session.user.id;
            if (session.user.role === 'client') {
                viewerType = 'client';
            } else if (session.user.role === 'freelancer') {
                viewerType = 'freelancer';
            }
        }

        // Check if this user has already viewed this profile in the last hour
        // This prevents inflating view count from page reloads
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

        const { data: recentViews, error: checkError } = await supabase
            .from('profile_views')
            .select('id')
            .eq('freelancer_id', freelancerId)
            .eq('viewer_type', viewerType)
            ...(viewerId && viewerType !== 'guest'
                ? { eq: { viewer_id: viewerId } }
                : { is: { viewer_id: null } })
            .gt('viewed_at', oneHourAgo)
            .limit(1);

        if (checkError && checkError.code !== 'PGRST116') {
            throw checkError;
        }

        // If already viewed recently, don't create a duplicate entry
        if (recentViews && recentViews.length > 0) {
            return NextResponse.json({
                success: true,
                message: 'View already tracked recently',
                viewId: recentViews[0].id
            });
        }

        // Get client IP from request headers
        const viewerIp = req.headers.get('x-forwarded-for') ||
                        req.headers.get('x-real-ip') ||
                        'unknown';

        // Get user agent
        const userAgent = req.headers.get('user-agent') || 'unknown';

        // Insert the view record
        const { data: insertedView, error: insertError } = await supabase
            .from('profile_views')
            .insert({
                freelancer_id: freelancerId,
                viewer_id: viewerId,
                viewer_type: viewerType,
                viewer_ip: viewerIp,
                user_agent: userAgent,
                viewed_at: new Date().toISOString()
            })
            .select()
            .single();

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({
            success: true,
            message: 'Profile view tracked successfully',
            viewId: insertedView?.id
        });

    } catch (error: any) {
        console.error('Error tracking profile view:', error);
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to track profile view' },
            { status: 500 }
        );
    }
}
