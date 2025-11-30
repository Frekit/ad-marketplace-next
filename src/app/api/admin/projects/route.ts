import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const supabase = createClient();

        // Get all projects with related data
        const { data: projects, error } = await supabase
            .from('projects')
            .select(`
                *,
                client:client_id (
                    id,
                    email,
                    first_name,
                    last_name,
                    company_name
                ),
                freelancer:freelancer_id (
                    id,
                    email,
                    first_name,
                    last_name
                )
            `)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({ projects: projects || [] });

    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch projects' },
            { status: 500 }
        );
    }
}
