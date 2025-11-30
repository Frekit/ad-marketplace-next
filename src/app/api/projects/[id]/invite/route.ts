import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { notifyUser, notificationTemplates } from '@/lib/notifications';
import { ApiResponse, ApiErrors } from '@/lib/api-error';

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
        const { freelancerId, message, estimated_days, hourly_rate, suggested_milestones } = await req.json();

        if (!freelancerId) {
            return NextResponse.json({ error: 'Freelancer ID is required' }, { status: 400 });
        }

        if (estimated_days && estimated_days <= 0) {
            return NextResponse.json({ error: 'Estimated days must be greater than 0' }, { status: 400 });
        }

        if (hourly_rate && hourly_rate <= 0) {
            return NextResponse.json({ error: 'Hourly rate must be greater than 0' }, { status: 400 });
        }

        const supabase = createClient();

        // Verify project ownership
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('client_id, status, title')
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
            .select('id, role, email')
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
        const { data: existing, error: existingError } = await supabase
            .from('project_invitations')
            .select('id, status')
            .eq('project_id', projectId)
            .eq('freelancer_id', freelancerId);

        if (existing && existing.length > 0) {
            return NextResponse.json(
                { error: `An invitation already exists with status: ${existing[0].status}` },
                { status: 400 }
            );
        }

        // Create invitation with proposal terms
        const { data: invitation, error: invitationError } = await supabase
            .from('project_invitations')
            .insert({
                project_id: projectId,
                freelancer_id: freelancerId,
                client_id: session.user.id,
                message: message || '',
                status: 'pending',
                estimated_days: estimated_days || null,
                hourly_rate: hourly_rate || null,
                suggested_milestones: suggested_milestones || [],
            })
            .select()
            .single();

        if (invitationError) {
            throw invitationError;
        }

        // Send notification to freelancer
        const { data: client, error: clientError } = await supabase
            .from('users')
            .select('id, first_name')
            .eq('id', session.user.id)
            .single();

        if (freelancer.email) {
            const clientName = client?.first_name || 'A client';
            const template = notificationTemplates.PROJECT_INVITATION(
                clientName,
                project.title || 'a project'
            );

            await notifyUser(
                freelancerId,
                freelancer.email,
                template.type,
                template.title,
                template.message,
                { projectId, invitationId: invitation.id, clientName, message }
            );
        }

        return NextResponse.json({
            invitationId: invitation.id,
            message: 'Invitation sent successfully',
        });
    } catch (error: any) {
        console.error('Error creating invitation:', error);
        return ApiResponse.error(error);
    }
}
