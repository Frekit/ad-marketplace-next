import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient();

        // Get the freelancer_id from query params
        const freelancerId = req.nextUrl.searchParams.get('freelancer_id');

        if (!freelancerId) {
            return NextResponse.json({
                error: 'Missing freelancer_id parameter'
            }, { status: 400 });
        }

        // Fetch ALL invitations for this freelancer with detailed info
        const { data: invitations, error } = await supabase
            .from('project_invitations')
            .select('*')
            .eq('freelancer_id', freelancerId);

        if (error) {
            return NextResponse.json({
                error: 'Database error',
                details: error.message,
                code: error.code
            }, { status: 500 });
        }

        return NextResponse.json({
            freelancer_id: freelancerId,
            invitation_count: invitations?.length || 0,
            invitations: invitations || [],
            message: 'Debug endpoint - temporary only'
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
