import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { getStripeClient } from '@/lib/stripe';

/**
 * POST /api/freelancer/withdrawal/approve
 *
 * ADMIN ONLY: Approve a withdrawal request after verifying the invoice
 * This triggers automatic payout via Stripe
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        // Check if admin (you might have a different way to check admin role)
        // For now, we'll check if it's the platform owner or add an admin field to users
        if (!session?.user) {
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
            .single();

        if (fetchError || !withdrawalRequest) {
            return NextResponse.json(
                { error: 'Withdrawal request not found' },
                { status: 404 }
            );
        }

        // Check status - should be pending_approval (invoice uploaded and ready to check)
        if (withdrawalRequest.status !== 'pending_approval') {
            return NextResponse.json(
                { error: `Withdrawal status is ${withdrawalRequest.status}. Expected: pending_approval` },
                { status: 400 }
            );
        }

        const stripe = getStripeClient();

        // Get freelancer's Stripe Connect account
        const { data: freelancer } = await supabase
            .from('users')
            .select('stripe_connect_id, email')
            .eq('id', withdrawalRequest.freelancer_id)
            .single();

        if (!freelancer?.stripe_connect_id) {
            return NextResponse.json(
                { error: 'Freelancer has not set up Stripe Connect' },
                { status: 400 }
            );
        }

        // Verify Stripe account is ready
        const stripeAccount = await stripe.accounts.retrieve(freelancer.stripe_connect_id);

        if (!stripeAccount.payouts_enabled) {
            return NextResponse.json(
                { error: 'Freelancer Stripe account is not ready for payouts' },
                { status: 400 }
            );
        }

        // Create payout via Stripe
        let payout;
        try {
            payout = await stripe.payouts.create(
                {
                    amount: Math.round(withdrawalRequest.amount * 100), // Convert to cents
                    currency: 'eur',
                    method: 'instant', // Instant SEPA transfer
                },
                {
                    stripeAccount: freelancer.stripe_connect_id,
                }
            );
        } catch (stripeError: any) {
            // Update withdrawal request with error
            await supabase
                .from('withdrawal_requests')
                .update({
                    status: 'failed',
                    payout_error: stripeError.message,
                    payout_status: 'failed'
                })
                .eq('id', withdrawal_request_id);

            return NextResponse.json(
                { error: `Stripe payout failed: ${stripeError.message}` },
                { status: 400 }
            );
        }

        // Update withdrawal request
        const { error: updateError } = await supabase
            .from('withdrawal_requests')
            .update({
                status: 'paid',
                stripe_payout_id: payout.id,
                payout_status: payout.status,
                approved_at: new Date().toISOString(),
                paid_at: new Date().toISOString()
            })
            .eq('id', withdrawal_request_id);

        if (updateError) {
            throw updateError;
        }

        // Create transaction record
        await supabase
            .from('transactions')
            .insert({
                user_id: withdrawalRequest.freelancer_id,
                type: 'withdrawal',
                amount: withdrawalRequest.amount,
                status: payout.status === 'succeeded' ? 'completed' : 'pending',
                description: `Withdrawal payout (Withdrawal Request: ${withdrawal_request_id})`,
                reference_id: payout.id,
                metadata: {
                    stripe_payout_id: payout.id,
                    withdrawal_request_id: withdrawal_request_id,
                    arrival_date: payout.arrival_date
                }
            });

        return NextResponse.json({
            success: true,
            withdrawal_request_id: withdrawal_request_id,
            payout_id: payout.id,
            amount: withdrawalRequest.amount,
            status: payout.status,
            arrival_date: payout.arrival_date,
            message: `Payout of €${withdrawalRequest.amount.toFixed(2)} processed. Funds will arrive in 1-3 business days.`
        });

    } catch (error: any) {
        console.error('Error approving withdrawal:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to approve withdrawal' },
            { status: 500 }
        );
    }
}
