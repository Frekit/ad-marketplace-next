import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialise Supabase client safely – if env vars are missing we log a warning and continue without DB writes
let supabase: SupabaseClient<any, "public"> | null = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );
} else {
    console.warn('⚠️ Supabase env vars missing – webhook will run without persisting data');
}

export async function POST(req: NextRequest) {
    // Read raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    console.log('🔔 Webhook received – body length:', body.length);

    let event: any;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature ?? '',
            process.env.STRIPE_WEBHOOK_SECRET!
        );
        console.log('✅ Signature verified – event type:', event.type);
    } catch (err: any) {
        console.error('❌ Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Process the event – wrap in try/catch to capture unexpected errors
    try {
        if (!supabase) {
            console.warn('Supabase client not available – skipping DB writes');
            return NextResponse.json({ received: true });
        }

        switch (event.type) {
            case 'invoice.payment_succeeded': {
                const invoice = event.data.object;

                // Check if this is a wallet deposit
                if (invoice.metadata?.type === 'wallet_deposit') {
                    const userId = invoice.metadata.userId;
                    const amountPaid = invoice.amount_paid / 100; // Convert cents to EUR
                    const poCode = invoice.metadata.poCode;

                    console.log(`💰 Processing deposit for user ${userId}: €${amountPaid}`);

                    // Create transaction record
                    const { error: transactionError } = await supabase
                        .from('transactions')
                        .insert({
                            user_id: userId,
                            type: 'deposit',
                            amount: amountPaid,
                            status: 'completed',
                            description: `Deposit via Bank Transfer (PO: ${poCode})`,
                            metadata: {
                                stripe_invoice_id: invoice.id,
                                stripe_customer_id: invoice.customer,
                                po_code: poCode,
                                invoice_pdf: invoice.invoice_pdf,
                            },
                        });

                    if (transactionError) {
                        console.error('Error creating transaction:', transactionError);
                        throw transactionError;
                    }

                    // Update wallet balance via stored procedure
                    const { error: walletError } = await supabase.rpc('add_wallet_balance', {
                        p_client_id: userId,
                        p_amount: amountPaid,
                    });

                    if (walletError) {
                        console.error('Error updating wallet:', walletError);
                        throw walletError;
                    }

                    console.log(`✅ Deposit completed: €${amountPaid} for user ${userId}`);
                }
                break;
            }

            case 'checkout.session.completed': {
                const session = event.data.object;
                if (session.metadata?.type === 'wallet_deposit') {
                    const userId = session.metadata.userId;
                    const amount = parseFloat(session.metadata.amount);

                    // Create transaction record
                    const { error: transactionError } = await supabase
                        .from('transactions')
                        .insert({
                            user_id: userId,
                            type: 'deposit',
                            amount,
                            status: 'completed',
                            description: `Deposit via ${session.payment_method_types?.[0] || 'card'}`,
                            metadata: {
                                stripe_session_id: session.id,
                                payment_intent: session.payment_intent,
                            },
                        });

                    if (transactionError) {
                        console.error('Error creating transaction:', transactionError);
                        throw transactionError;
                    }

                    // Update wallet balance via stored procedure
                    const { error: walletError } = await supabase.rpc('add_wallet_balance', {
                        p_client_id: userId,
                        p_amount: amount,
                    });

                    if (walletError) {
                        console.error('Error updating wallet:', walletError);
                        throw walletError;
                    }

                    console.log(`✅ Deposit completed: €${amount} for user ${userId}`);
                }
                break;
            }

            default:
                console.log(`ℹ️ Ignored event type: ${event.type}`);
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('❌ Unexpected error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
