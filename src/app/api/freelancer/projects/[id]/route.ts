import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId } = await params;
        const supabase = createClient();

        // Fetch project assigned to this freelancer
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select(`
                *,
                client:users!projects_client_id_fkey (
                    id,
                    name,
                    email
                )
            `)
            .eq('id', projectId)
            .eq('freelancer_id', session.user.id)
            .single();

        if (projectError || !project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ project });

    } catch (error: any) {
        console.error('Error fetching project:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch project' },
            { status: 500 }
        );
    }
}
