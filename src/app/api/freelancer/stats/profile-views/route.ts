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
    period: 'last_30_days';
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

        const supabase = createClient();

        // Fetch current period (last 30 days)
        const { data: currentPeriod, error: currentError } = await supabase
            .from('profile_views_30_days')
            .select('*')
            .eq('freelancer_id', session.user.id)
            .single();

        if (currentError && currentError.code !== 'PGRST116') {
            throw currentError;
        }

        // Fetch trend data
        const { data: trendData, error: trendError } = await supabase
            .from('profile_views_trend')
            .select('*')
            .eq('freelancer_id', session.user.id)
            .single();

        if (trendError && trendError.code !== 'PGRST116') {
            throw trendError;
        }

        // Determine trend direction
        let trendDirection: 'up' | 'down' | 'stable' = 'stable';
        let trendPercentage = 0;

        if (trendData) {
            trendPercentage = trendData.trend_percentage || 0;
            if (trendPercentage > 5) {
                trendDirection = 'up';
            } else if (trendPercentage < -5) {
                trendDirection = 'down';
            }
        }

        const stats: ProfileViewStats = {
            totalViews: currentPeriod?.total_views || 0,
            uniqueClients: currentPeriod?.unique_clients || 0,
            clientViews: currentPeriod?.client_views || 0,
            guestViews: currentPeriod?.guest_views || 0,
            freelancerViews: currentPeriod?.freelancer_views || 0,
            lastViewedAt: currentPeriod?.last_viewed_at || null,
            trend: Math.round(trendPercentage),
            trendDirection
        };

        return NextResponse.json({
            stats,
            period: 'last_30_days'
        });

    } catch (error: any) {
        console.error('Error fetching profile view stats:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch profile view statistics' },
            { status: 500 }
        );
    }
}
