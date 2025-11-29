import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get all invoices for this freelancer
        const { data: invoices, error } = await supabase
            .from('invoices')
            .select(`
                *,
                projects:project_id (
                    title,
                    client_id
                )
            `)
            .eq('freelancer_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            invoices: invoices || [],
        });

    } catch (error: any) {
        console.error('Error fetching invoices:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch invoices' },
            { status: 500 }
        );
    }
}
