import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const supabase = createClient();

        // Get the user_id from query params
        const userId = req.nextUrl.searchParams.get('user_id');

        if (!userId) {
            return NextResponse.json({
                error: 'Missing user_id parameter'
            }, { status: 400 });
        }

        // Fetch user data
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            return NextResponse.json({
                error: 'Database error',
                details: error.message,
                code: error.code
            }, { status: 500 });
        }

        return NextResponse.json({
            user: user,
            message: 'Debug endpoint - temporary only'
        });

    } catch (error: any) {
        return NextResponse.json({
            error: error.message
        }, { status: 500 });
    }
}
