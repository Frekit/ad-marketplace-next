import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { notifyUser } from '@/lib/notifications';

export async function POST(
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

        let supabase = createClient();

        // Check freelancer verification status
        const { data: freelancerData, error: freelancerError } = await supabase
            .from('users')
            .select('verification_status')
            .eq('id', session.user.id)
            .single();

        if (freelancerError) {
            throw freelancerError;
        }

        if (freelancerData?.verification_status !== 'approved') {
            return NextResponse.json(
                { error: 'You must be verified to submit offers. Please complete your verification first.' },
                { status: 403 }
            );
        }

        const { id: invitationId } = await params;
        const {
            coverLetter,
            milestones,
            totalAmount,
            based_on_proposal_id // Nueva opción: basada en una propuesta específica
        } = await req.json();

        // Validation
        if (!coverLetter || !milestones || milestones.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify invitation exists and belongs to this freelancer
        const { data: invitation, error: invError } = await supabase
            .from('invitations')
            .select(`
                id,
                project_id,
                client_id,
                status,
                projects(
                    id,
                    title,
                    client_id
                )
            `)
            .eq('id', invitationId)
            .eq('freelancer_id', session.user.id)
            .single();

        if (invError || !invitation) {
            return NextResponse.json(
                { error: 'Invitation not found' },
                { status: 404 }
            );
        }

        if (invitation.status !== 'pending' && invitation.status !== 'offer_submitted') {
            return NextResponse.json(
                { error: 'This invitation is no longer available' },
                { status: 400 }
            );
        }

        // Create freelancer offer
        const { data: offer, error: offerError } = await supabase
            .from('freelancer_offers')
            .insert({
                invitation_id: invitationId,
                project_id: invitation.project_id,
                freelancer_id: session.user.id,
                cover_letter: coverLetter,
                milestones: milestones,
                total_amount: totalAmount,
                status: 'pending'
            })
            .select()
            .single();

        if (offerError) {
            throw offerError;
        }

        // Update invitation status to 'offer_submitted'
        await supabase
            .from('invitations')
            .update({ status: 'offer_submitted' })
            .eq('id', invitationId);

        // Update project_proposal status if it exists
        if (based_on_proposal_id) {
            await supabase
                .from('project_proposals')
                .update({
                    status: 'agreed',
                    freelancer_status: 'accepted'
                })
                .eq('id', based_on_proposal_id);
        }

        // Get client info for notification
        const { data: client } = await supabase
            .from('users')
            .select('email, first_name, last_name')
            .eq('id', invitation.client_id)
            .single();

        const { data: freelancerInfo } = await supabase
            .from('users')
            .select('first_name, last_name')
            .eq('id', session.user.id)
            .single();

        // Notify client that freelancer submitted offer
        if (client) {
            await notifyUser(
                invitation.client_id,
                client.email,
                'proposal_response',
                `${freelancerInfo?.first_name} respondió a tu propuesta`,
                `${freelancerInfo?.first_name} ha enviado una oferta formal para "${(invitation.projects as any).title}"`,
                {
                    companyName: `${client.first_name} ${client.last_name}`.trim(),
                    freelancerName: `${freelancerInfo?.first_name} ${freelancerInfo?.last_name}`.trim(),
                    projectTitle: (invitation.projects as any).title,
                    projectId: invitation.project_id,
                }
            );
        }

        return NextResponse.json({
            offerId: offer.id,
            message: 'Offer submitted successfully',
        });

    } catch (error: any) {
        console.error('Error submitting offer:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to submit offer' },
            { status: 500 }
        );
    }
}
