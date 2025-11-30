import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { getStripeClient } from '@/lib/stripe';

async function processSepaTransfer(invoice: any) {
    // Test mode: Just log and mark as completed
    console.log('SEPA Transfer (TEST MODE)', {
        amount: invoice.total_amount,
        iban: invoice.iban,
        reference: invoice.invoice_number,
        freelancer_name: invoice.freelancer_legal_name,
    });

    // In production:
    // const transfer = await stripe.transfers.create({
    //   amount: invoice.total_amount * 100,
    //   currency: 'eur',
    //   destination: freelancerStripeAccountId,
    //   transfer_group: invoice.invoice_number,
    // });

    return {
        id: 'test_transfer_' + Date.now(),
        status: 'completed',
    };
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const { id: invoiceId } = await params;
        const supabase = createClient();

        // Get invoice
        const { data: invoice, error: fetchError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', invoiceId)
            .single();

        if (fetchError || !invoice) {
            return NextResponse.json(
                { error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // Verify invoice is approved
        if (invoice.status !== 'approved') {
            return NextResponse.json(
                { error: `Invoice must be approved before processing payment. Current status: ${invoice.status}` },
                { status: 400 }
            );
        }

        // Process SEPA transfer
        const transfer = await processSepaTransfer(invoice);

        // Update invoice with payment info
        const now = new Date().toISOString();
        const { error: updateError } = await supabase
            .from('invoices')
            .update({
                status: 'paid',
                stripe_transfer_id: transfer.id,
                stripe_transfer_status: transfer.status,
                paid_at: now,
                updated_at: now,
            })
            .eq('id', invoiceId);

        if (updateError) {
            throw updateError;
        }

        // Add funds to freelancer wallet
        const { error: walletError } = await supabase.rpc('add_wallet_balance', {
            p_freelancer_id: invoice.freelancer_id,
            p_amount: invoice.total_amount,
        });

        if (walletError) {
            console.error('Error updating freelancer wallet:', walletError);
            // Continue anyway - the payment is marked as completed
        }

        // Update milestone status to paid
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('milestones')
            .eq('id', invoice.project_id)
            .single();

        if (!projectError && project?.milestones) {
            const milestones = project.milestones;
            if (milestones[invoice.milestone_index]) {
                milestones[invoice.milestone_index].status = 'paid';

                const { error: updateMilestoneError } = await supabase
                    .from('projects')
                    .update({ milestones })
                    .eq('id', invoice.project_id);

                if (updateMilestoneError) {
                    console.error('Error updating milestone status:', updateMilestoneError);
                }
            }
        }

        // Create transaction record
        await supabase
            .from('transactions')
            .insert({
                user_id: invoice.freelancer_id,
                type: 'invoice_payment',
                amount: invoice.total_amount,
                status: 'completed',
                description: `Invoice Payment - ${invoice.invoice_number}`,
                reference_id: invoiceId,
                metadata: {
                    invoice_number: invoice.invoice_number,
                    transfer_id: transfer.id,
                    tax_scenario: invoice.tax_scenario,
                    base_amount: invoice.base_amount,
                    vat_amount: invoice.vat_amount,
                    irpf_amount: invoice.irpf_amount,
                },
            });

        // Check if there's a linked withdrawal request and trigger payout
        const { data: withdrawalRequest, error: withdrawalFetchError } = await supabase
            .from('withdrawal_requests')
            .select('*')
            .eq('invoice_id', invoiceId)
            .eq('status', 'pending_approval')
            .single();

        if (withdrawalRequest && !withdrawalFetchError) {
            try {
                // Get freelancer's Stripe Connect account
                const { data: freelancer } = await supabase
                    .from('users')
                    .select('stripe_connect_id')
                    .eq('id', withdrawalRequest.freelancer_id)
                    .single();

                if (freelancer?.stripe_connect_id) {
                    const stripe = getStripeClient();

                    // Create payout via Stripe
                    const payout = await stripe.payouts.create(
                        {
                            amount: Math.round(withdrawalRequest.amount * 100), // Convert to cents
                            currency: 'eur',
                            method: 'instant', // Instant SEPA transfer
                        },
                        {
                            stripeAccount: freelancer.stripe_connect_id,
                        }
                    );

                    // Update withdrawal request with payout details
                    await supabase
                        .from('withdrawal_requests')
                        .update({
                            status: 'paid',
                            stripe_payout_id: payout.id,
                            payout_status: payout.status,
                            approved_at: now,
                            paid_at: now,
                            updated_at: now,
                        })
                        .eq('id', withdrawalRequest.id);

                    // Create transaction record for withdrawal
                    await supabase
                        .from('transactions')
                        .insert({
                            user_id: withdrawalRequest.freelancer_id,
                            type: 'withdrawal',
                            amount: withdrawalRequest.amount,
                            status: payout.status === 'succeeded' ? 'completed' : 'pending',
                            description: `Withdrawal payout (Withdrawal Request: ${withdrawalRequest.id})`,
                            reference_id: payout.id,
                            metadata: {
                                stripe_payout_id: payout.id,
                                withdrawal_request_id: withdrawalRequest.id,
                                arrival_date: payout.arrival_date,
                                invoice_id: invoiceId,
                            }
                        });
                }
            } catch (withdrawalError: any) {
                console.error('Error triggering withdrawal payout:', withdrawalError);
                // Continue anyway - the invoice payment is successful
            }
        }

        // TODO: Send notification to freelancer that payment was processed

        return NextResponse.json({
            message: 'Payment processed successfully',
            invoice_id: invoiceId,
            transfer_id: transfer.id,
            amount: invoice.total_amount,
            paid_at: now,
            withdrawal_payout_triggered: !!withdrawalRequest,
        });

    } catch (error: any) {
        console.error('Error processing payment:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process payment' },
            { status: 500 }
        );
    }
}
