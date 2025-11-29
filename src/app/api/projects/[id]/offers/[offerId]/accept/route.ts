import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string; offerId: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { id: projectId, offerId } = await params;
        const supabase = createClient();

        // Verify project ownership
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('client_id, status')
            .eq('id', projectId)
            .eq('client_id', session.user.id)
            .single();

        if (projectError || !project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Get offer details
        const { data: offer, error: offerError } = await supabase
            .from('freelancer_offers')
            .select('*')
            .eq('id', offerId)
            .eq('project_id', projectId)
            .single();

        if (offerError || !offer) {
            return NextResponse.json(
                { error: 'Offer not found' },
                { status: 404 }
            );
        }

        if (offer.status !== 'pending') {
            return NextResponse.json(
                { error: 'This offer has already been processed' },
                { status: 400 }
            );
        }

        // Check wallet balance
        const { data: wallet, error: walletError } = await supabase
            .from('client_wallets')
            .select('available_balance')
            .eq('client_id', session.user.id)
            .single();

        if (walletError) {
            throw walletError;
        }

        const availableBalance = wallet?.available_balance || 0;
        const requiredAmount = offer.total_amount;

        if (availableBalance < requiredAmount) {
            return NextResponse.json(
                { error: `Insufficient balance. You have €${availableBalance.toFixed(2)}, but need €${requiredAmount.toFixed(2)}` },
                { status: 400 }
            );
        }

        // Lock funds in escrow
        const { error: lockError } = await supabase.rpc('lock_project_funds', {
            p_client_id: session.user.id,
            p_project_id: projectId,
            p_amount: requiredAmount,
        });

        if (lockError) {
            console.error('Error locking funds:', lockError);
            return NextResponse.json(
                { error: 'Failed to lock funds. Please try again.' },
                { status: 500 }
            );
        }

        // Update offer status
        await supabase
            .from('freelancer_offers')
            .update({ status: 'accepted' })
            .eq('id', offerId);

        // Update project with accepted offer details
        await supabase
            .from('projects')
            .update({
                status: 'active',
                allocated_budget: requiredAmount,
                milestones: offer.milestones,
                freelancer_id: offer.freelancer_id,
            })
            .eq('id', projectId);

        // Reject other offers for this project
        await supabase
            .from('freelancer_offers')
            .update({ status: 'rejected' })
            .eq('project_id', projectId)
            .neq('id', offerId);

        return NextResponse.json({
            message: 'Offer accepted and funds locked successfully',
            lockedAmount: requiredAmount,
        });

    } catch (error: any) {
        console.error('Error accepting offer:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to accept offer' },
            { status: 500 }
        );
    }
}
