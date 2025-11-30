import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized. Only clients can view invitations.' },
                { status: 401 }
            );
        }

        const { id: projectId } = await params;
        const supabase = createClient();

        // Verify project ownership
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('client_id')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.client_id !== session.user.id) {
            return NextResponse.json(
                { error: 'You do not own this project' },
                { status: 403 }
            );
        }

        // Fetch invitations for this project
        const { data: invitations, error } = await supabase
            .from('invitations')
            .select(`
                id,
                status,
                created_at,
                message,
                freelancer:users!invitations_freelancer_id_fkey (
                    id,
                    first_name,
                    last_name,
                    email
                )
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return NextResponse.json({
            invitations: invitations || [],
            total: invitations?.length || 0,
        });
    } catch (error: any) {
        console.error('Error fetching invitations:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch invitations' },
            { status: 500 }
        );
    }
}
