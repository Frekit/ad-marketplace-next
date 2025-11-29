import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getRequestLogs } from '@/lib/api-middleware';
import { rateLimitConfig } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        // Get query parameters for filtering
        const searchParams = req.nextUrl.searchParams;
        const status = searchParams.get('status') ? parseInt(searchParams.get('status')!) : undefined;
        const method = searchParams.get('method') || undefined;

        // Get filtered logs
        const logs = getRequestLogs({ status, method });

        return NextResponse.json({
            logs,
            totalLogs: logs.length,
            rateLimitConfig,
            timestamp: new Date().toISOString(),
        });

    } catch (error: any) {
        console.error('Error fetching monitoring data:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch monitoring data' },
            { status: 500 }
        );
    }
}
