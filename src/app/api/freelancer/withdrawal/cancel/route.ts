import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

/**
 * POST /api/freelancer/withdrawal/cancel
 *
 * Cancel a pending withdrawal request and unblock the funds
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { withdrawal_request_id } = await req.json();
        const supabase = createClient();

        // Get withdrawal request
        const { data: withdrawalRequest, error: fetchError } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('id', withdrawal_request_id)
            .eq('freelancer_id', session.user.id)
            .single();

        if (fetchError || !withdrawalRequest) {
            return NextResponse.json(
                { error: 'Withdrawal request not found' },
                { status: 404 }
            );
        }

        // Can only cancel if pending_invoice or pending_approval
        if (!['pending_invoice', 'pending_approval'].includes(withdrawalRequest.status)) {
            return NextResponse.json(
                { error: `Cannot cancel withdrawal with status: ${withdrawalRequest.status}` },
                { status: 400 }
            );
        }

        // Update withdrawal request status
        const { error: updateError } = await supabase
            .from('withdrawal_requests')
            .update({ status: 'cancelled' })
            .eq('id', withdrawal_request_id);

        if (updateError) {
            throw updateError;
        }

        // Unblock the money (return to available_balance)
        const { data: wallet } = await supabase
            .from('freelancer_wallets')
            .select('available_balance')
            .eq('freelancer_id', session.user.id)
            .single();

        if (wallet) {
            await supabase
                .from('freelancer_wallets')
                .update({
                    available_balance: wallet.available_balance + withdrawalRequest.amount_blocked
                })
                .eq('freelancer_id', session.user.id);
        }

        return NextResponse.json({
            success: true,
            message: `Withdrawal request cancelled. €${withdrawalRequest.amount_blocked.toFixed(2)} returned to available balance.`,
            refunded_amount: withdrawalRequest.amount_blocked,
            new_available_balance: (wallet?.available_balance || 0) + withdrawalRequest.amount_blocked
        });

    } catch (error: any) {
        console.error('Error cancelling withdrawal:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to cancel withdrawal' },
            { status: 500 }
        );
    }
}
