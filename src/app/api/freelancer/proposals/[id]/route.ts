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

        const { id } = await params;
        const supabase = createClient();

        // Fetch specific proposal with project details
        const { data: invitation, error } = await supabase
            .from('project_invitations')
            .select(`
                id,
                status,
                message,
                created_at,
                client_id,
                project_id
            `)
            .eq('id', id)
            .eq('freelancer_id', session.user.id)
            .single();

        if (error || !invitation) {
            console.error('Database error (invitation):', error);
            return NextResponse.json(
                { error: 'Proposal not found' },
                { status: 404 }
            );
        }

        // Fetch project details separately
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, title, description, skills_required, allocated_budget, created_at')
            .eq('id', invitation.project_id)
            .single();

        if (projectError) {
            console.error('Database error (project):', projectError);
        }

        // Fetch client details separately
        const { data: client, error: clientError } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, company_name')
            .eq('id', invitation.client_id)
            .single();

        if (clientError) {
            console.error('Database error (client):', clientError);
        }

        const clientData = client;
        const clientName = clientData?.company_name ||
                         `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim() ||
                         'Cliente';

        const proposal = {
            id: invitation.id,
            project: {
                id: project?.id,
                title: project?.title || 'Sin título',
                description: project?.description || '',
                skills_required: project?.skills_required || [],
                allocated_budget: project?.allocated_budget,
                created_at: project?.created_at,
            },
            client: {
                name: clientName,
                email: clientData?.email || '',
            },
            status: invitation.status,
            message: invitation.message,
            created_at: invitation.created_at,
        };

        return NextResponse.json({ proposal });

    } catch (error: any) {
        console.error('Error fetching proposal details:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch proposal' },
            { status: 500 }
        );
    }
}
