import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized. Only freelancers can accept invitations.' },
                { status: 401 }
            );
        }

        const { id: invitationId } = await params;
        const { action } = await req.json(); // 'accept' or 'reject'

        if (!action || !['accept', 'reject'].includes(action)) {
            return NextResponse.json(
                { error: 'Invalid action. Must be "accept" or "reject"' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Get invitation details
        const { data: invitation, error: invitationError } = await supabase
            .from('invitations')
            .select(`
                *,
                projects (
                    id,
                    client_id,
                    title,
                    allocated_budget,
                    milestones,
                    status
                )
            `)
            .eq('id', invitationId)
            .single();

        if (invitationError || !invitation) {
            return NextResponse.json(
                { error: 'Invitation not found' },
                { status: 404 }
            );
        }

        if (invitation.freelancer_id !== session.user.id) {
            return NextResponse.json(
                { error: 'This invitation is not for you' },
                { status: 403 }
            );
        }

        if (invitation.status !== 'pending') {
            return NextResponse.json(
                { error: `Invitation already ${invitation.status}` },
                { status: 400 }
            );
        }

        if (action === 'reject') {
            // Simply update invitation status
            await supabase
                .from('invitations')
                .update({ status: 'rejected', updated_at: new Date().toISOString() })
                .eq('id', invitationId);

            return NextResponse.json({
                message: 'Invitation rejected',
            });
        }

        // Accept invitation - create contract
        const project = invitation.projects as any;

        if (!project) {
            throw new Error('Project not found');
        }

        // Update invitation status
        const { error: updateError } = await supabase
            .from('invitations')
            .update({ status: 'accepted', updated_at: new Date().toISOString() })
            .eq('id', invitationId);

        if (updateError) {
            throw updateError;
        }

        // Create contract
        const { data: contract, error: contractError } = await supabase
            .from('contracts')
            .insert({
                project_id: project.id,
                freelancer_id: session.user.id,
                client_id: project.client_id,
                total_amount: project.allocated_budget,
                paid_amount: 0,
                status: 'active',
                milestones: project.milestones || [],
            })
            .select()
            .single();

        if (contractError) {
            // Rollback invitation status
            await supabase
                .from('invitations')
                .update({ status: 'pending' })
                .eq('id', invitationId);
            throw contractError;
        }

        // Update project status and assign freelancer
        await supabase
            .from('projects')
            .update({
                status: 'active',
                freelancer_id: session.user.id,
                updated_at: new Date().toISOString(),
            })
            .eq('id', project.id);

        return NextResponse.json({
            contractId: contract.id,
            message: 'Invitation accepted. Contract created successfully.',
        });

    } catch (error: any) {
        console.error('Error processing invitation:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process invitation' },
            { status: 500 }
        );
    }
}
