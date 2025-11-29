import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

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

        const { id: invitationId } = await params;
        const { coverLetter, milestones, totalAmount } = await req.json();

        // Validation
        if (!coverLetter || !milestones || milestones.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createClient();

        // Verify invitation exists and belongs to this freelancer
        const { data: invitation, error: invError } = await supabase
            .from('project_invitations')
            .select('id, project_id, status')
            .eq('id', invitationId)
            .eq('freelancer_id', session.user.id)
            .single();

        if (invError || !invitation) {
            return NextResponse.json(
                { error: 'Invitation not found' },
                { status: 404 }
            );
        }

        if (invitation.status !== 'pending') {
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
                status: 'pending',
            })
            .select()
            .single();

        if (offerError) {
            throw offerError;
        }

        // Update invitation status to 'offer_submitted'
        await supabase
            .from('project_invitations')
            .update({ status: 'offer_submitted' })
            .eq('id', invitationId);

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
