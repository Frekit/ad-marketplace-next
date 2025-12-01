import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

interface ProfileViewStats {
    totalViews: number;
    uniqueClients: number;
    clientViews: number;
    guestViews: number;
    freelancerViews: number;
    lastViewedAt: string | null;
    trend: number; // Percentage change from previous period
    trendDirection: 'up' | 'down' | 'stable';
}

interface ProfileViewsResponse {
    stats: ProfileViewStats;
    period: 'last_7_days' | 'last_30_days' | 'last_90_days';
}

export async function GET(req: NextRequest): Promise<NextResponse<ProfileViewsResponse | { error: string }>> {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get period from query parameter (default: 30)
        const searchParams = req.nextUrl.searchParams;
        const periodParam = searchParams.get('period') || '30';
        const period = parseInt(periodParam) as 7 | 30 | 90;

        const supabase = createClient();

        // Calculate date range
        const now = new Date();
        const startDate = new Date(now.getTime() - period * 24 * 60 * 60 * 1000);
        const startDateString = startDate.toISOString();

        // Fetch current period views
        const { data: currentViews, error: currentError } = await supabase
            .from('profile_views')
            .select('viewer_type, viewer_id, viewed_at')
            .eq('freelancer_id', session.user.id)
            .gte('viewed_at', startDateString)
            .order('viewed_at', { ascending: false });

        if (currentError && currentError.code !== 'PGRST116') {
            throw currentError;
        }

        const views = currentViews || [];

        // Calculate stats
        let clientViews = 0;
        let guestViews = 0;
        let freelancerViews = 0;

        views.forEach((view: any) => {
            if (view.viewer_type === 'client') clientViews++;
            else if (view.viewer_type === 'guest') guestViews++;
            else if (view.viewer_type === 'freelancer') freelancerViews++;
        });

        const totalViews = views.length;
        const uniqueClients = new Set(views.map((v: any) => v.viewer_id)).size;

        // Fetch previous period for trend calculation
        const previousStartDate = new Date(startDate.getTime() - period * 24 * 60 * 60 * 1000);
        const previousEndDate = startDate;
        const previousDateString = previousStartDate.toISOString();
        const previousEndDateString = previousEndDate.toISOString();

        const { data: previousViews, error: previousError } = await supabase
            .from('profile_views')
            .select('viewer_type, viewer_id')
            .eq('freelancer_id', session.user.id)
            .gte('viewed_at', previousDateString)
            .lt('viewed_at', previousEndDateString);

        if (previousError && previousError.code !== 'PGRST116') {
            throw previousError;
        }

        const previousTotalViews = (previousViews || []).length;
        let trendPercentage = 0;
        let trendDirection: 'up' | 'down' | 'stable' = 'stable';

        if (previousTotalViews > 0) {
            trendPercentage = ((totalViews - previousTotalViews) / previousTotalViews) * 100;
            if (trendPercentage > 5) {
                trendDirection = 'up';
            } else if (trendPercentage < -5) {
                trendDirection = 'down';
            }
        } else if (totalViews > 0) {
            trendDirection = 'up';
            trendPercentage = 100;
        }

        const periodLabel = period === 7 ? 'last_7_days' : period === 30 ? 'last_30_days' : 'last_90_days';

        const stats: ProfileViewStats = {
            totalViews,
            uniqueClients,
            clientViews,
            guestViews,
            freelancerViews,
            lastViewedAt: views.length > 0 ? views[0].viewed_at : null,
            trend: Math.round(trendPercentage * 10) / 10,
            trendDirection
        };

        return NextResponse.json({
            stats,
            period: periodLabel
        });

    } catch (error: any) {
        console.error('Error fetching profile view stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch profile view statistics' },
            { status: 500 }
        );
    }
}
