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

        // Fetch specific proposal
        const { data: invitation, error } = await supabase
            .from('project_invitations')
            .select(`
                id,
                status,
                message,
                created_at,
                project:projects (
                    id,
                    title,
                    description,
                    skills_required,
                    created_at
                ),
                client:users!project_invitations_client_id_fkey (
                    id,
                    name,
                    email
                )
            `)
            .eq('id', id)
            .eq('freelancer_id', session.user.id)
            .single();

        if (error || !invitation) {
            return NextResponse.json(
                { error: 'Proposal not found' },
                { status: 404 }
            );
        }

        const proposal = {
            id: invitation.id,
            project: invitation.project,
            client: {
                name: (invitation.client as any)?.[0]?.name || 'Cliente',
                company: (invitation.client as any)?.[0]?.email || '',
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
