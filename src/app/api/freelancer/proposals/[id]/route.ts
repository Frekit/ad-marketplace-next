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

        // Get the ID from params
        const { id } = await params;

        // Debug: log what we received
        console.log('Received proposal ID:', { id, idType: typeof id });

        // Validate the ID
        if (!id || id === 'undefined') {
            console.error('Invalid proposal ID:', id);
            return NextResponse.json(
                { error: 'Invalid proposal ID' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        console.log('Fetching proposal for freelancer:', session.user.id, 'with invitation id:', id);

        // Fetch specific proposal with all related data using Supabase relations
        const { data: invitation, error } = await supabase
            .from('invitations')
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
                    allocated_budget,
                    created_at
                ),
                client:users!invitations_client_id_fkey (
                    id,
                    first_name,
                    last_name,
                    email,
                    company_name
                )
            `)
            .eq('id', id)
            .eq('freelancer_id', session.user.id)
            .single();

        if (error) {
            console.error('Database error:', error);
            console.error('Request params - id:', id, 'freelancer_id:', session.user.id);
        }

        if (!invitation) {
            console.error('Invitation not found for id:', id, 'freelancer_id:', session.user.id);

            // Try to fetch the invitation regardless of freelancer_id to see if it exists
            const { data: anyInvitation } = await supabase
                .from('invitations')
                .select('*')
                .eq('id', id)
                .single();

            if (!anyInvitation) {
                console.error('Invitation does not exist at all with id:', id);
            } else {
                console.error('Invitation exists but belongs to different freelancer. Invitation freelancer_id:', anyInvitation.freelancer_id);
            }

            return NextResponse.json(
                { error: 'Proposal not found', details: error?.message || 'Invitation not found' },
                { status: 404 }
            );
        }

        console.log('Invitation with relations fetched successfully');

        // Handle client data (could be array from relation)
        const clientData = Array.isArray(invitation.client) ? invitation.client[0] : invitation.client;
        const clientName = clientData?.company_name ||
                         `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim() ||
                         'Cliente';

        // Construct the response
        const proposal = {
            id: invitation.id,
            project: invitation.project || {
                id: undefined,
                title: 'Sin título',
                description: '',
                skills_required: [],
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
