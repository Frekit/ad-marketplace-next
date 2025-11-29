import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        // Check if user is admin (you may need to adjust based on your user schema)
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const supabase = createClient();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        let query = supabase
            .from('invoices')
            .select(`
                *,
                freelancer:freelancer_id (
                    id,
                    first_name,
                    last_name,
                    email
                ),
                projects:project_id (
                    title,
                    client_id
                )
            `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        query = query.range(offset, offset + limit - 1);

        const { data: invoices, error, count } = await query;

        if (error) {
            throw error;
        }

        return NextResponse.json({
            invoices: invoices || [],
            total: count || 0,
            limit,
            offset,
        });

    } catch (error: any) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}
