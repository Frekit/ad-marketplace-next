import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const supabase = createClient();

        // Get all projects for this client
        const { data: projects, error } = await supabase
            .from('projects')
            .select('id, title, description, allocated_budget, status, skills_required, created_at, updated_at')
            .eq('client_id', session.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            projects: projects || [],
        });

    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
