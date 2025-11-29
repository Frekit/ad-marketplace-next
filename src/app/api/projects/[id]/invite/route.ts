import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: projectId } = await params;
        const { freelancerId, message } = await req.json();

        if (!freelancerId) {
            return NextResponse.json({ error: 'Freelancer ID is required' }, { status: 400 });
        }

        const supabase = createClient();

        // Verify project ownership
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('client_id, status')
            .eq('id', projectId)
            .single();

        if (projectError || !project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.client_id !== session.user.id) {
            return NextResponse.json({ error: 'You do not own this project' }, { status: 403 });
        }

        // Verify freelancer exists and is actually a freelancer
        const { data: freelancer, error: freelancerError } = await supabase
            .from('users')
            .select('id, role')
            .eq('id', freelancerId)
            .single();

        if (freelancerError || !freelancer) {
            return NextResponse.json(
                { error: 'Freelancer not found' },
                { status: 404 }
            );
        }

        if (freelancer.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'User is not a freelancer' },
                { status: 400 }
            );
        }

        // Check if invitation already exists
        const { data: existing } = await supabase
            .from('project_invitations')
            .select('id, status')
            .eq('project_id', projectId)
            .eq('freelancer_id', freelancerId)
            .single();

        if (existing) {
            return NextResponse.json(
                { error: `An invitation already exists with status: ${existing.status}` },
                { status: 400 }
            );
        }

        // Create invitation
        const { data: invitation, error: invitationError } = await supabase
            .from('project_invitations')
            .insert({
                project_id: projectId,
                freelancer_id: freelancerId,
                client_id: session.user.id,
                message: message || '',
                status: 'pending',
            })
            .select()
            .single();

        if (invitationError) {
            throw invitationError;
        }

        // TODO: Send notification to freelancer (email/in-app)

        return NextResponse.json({
            invitationId: invitation.id,
            message: 'Invitation sent successfully',
        });
    } catch (error: any) {
        console.error('Error creating invitation:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to send invitation' },
            { status: 500 }
        );
    }
}
