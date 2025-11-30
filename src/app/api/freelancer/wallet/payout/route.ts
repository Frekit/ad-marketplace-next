import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { getStripeClient } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'freelancer') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { amount, iban } = await req.json();
        const supabase = createClient();
        const stripe = getStripeClient();

        // Validation
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { error: 'Invalid amount' },
                { status: 400 }
            );
        }

        if (amount < 10) {
            return NextResponse.json(
                { error: 'Minimum payout amount is €10' },
                { status: 400 }
            );
        }

        // 1. VALIDAR: ¿Tiene facturas aprobadas?
        const { data: approvedInvoices, error: invoiceError } = await supabase
            .from('invoices')
            .select('id, total_amount, status')
            .eq('freelancer_id', session.user.id)
            .eq('status', 'approved');

        if (invoiceError) {
            throw invoiceError;
        }

        const totalApproved = approvedInvoices?.reduce((sum, inv) => sum + inv.total_amount, 0) || 0;

        if (totalApproved < amount) {
            return NextResponse.json(
                {
                    error: `Insufficient approved invoice amount. You have approved invoices totaling the required amount.`
                },
                { status: 400 }
            );
        }

        // 2. Get freelancer's Stripe Connect account
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('stripe_connect_id, email')
            .eq('id', session.user.id)
            .single();

        if (userError || !user?.stripe_connect_id) {
            return NextResponse.json(
                { error: 'Stripe Connect account not configured. Please complete your setup.' },
                { status: 400 }
            );
        }

        // 3. Verify Stripe account is ready for payouts
        const stripeAccount = await stripe.accounts.retrieve(user.stripe_connect_id);

        if (!stripeAccount.payouts_enabled) {
            return NextResponse.json(
                {
                    error: 'Your Stripe account is not ready for payouts yet. Please complete your setup in Stripe Dashboard.',
                    payouts_enabled: false
                },
                { status: 400 }
            );
        }

        // 4. Create payout via Stripe Connect
        const payout = await stripe.payouts.create(
            {
                amount: Math.round(amount * 100),
                currency: 'eur',
                method: 'instant',
            },
            {
                stripeAccount: user.stripe_connect_id,
            }
        );

        // 5. Create transaction record
        await supabase
            .from('transactions')
            .insert({
                user_id: session.user.id,
                type: 'withdrawal',
                amount: amount,
                status: payout.status === 'succeeded' ? 'completed' : 'pending',
                description: 'Payout via Stripe Connect',
                reference_id: payout.id,
                metadata: {
                    stripe_payout_id: payout.id,
                    iban: iban,
                    arrival_date: payout.arrival_date
                }
            });

        // 6. Update wallet
        const { data: wallet } = await supabase
            .from('freelancer_wallets')
            .select('available_balance')
            .eq('freelancer_id', session.user.id)
            .single();

        if (wallet) {
            await supabase
                .from('freelancer_wallets')
                .update({
                    available_balance: Math.max(0, wallet.available_balance - amount)
                })
                .eq('freelancer_id', session.user.id);
        }

        return NextResponse.json({
            success: true,
            payout_id: payout.id,
            amount: amount,
            status: payout.status,
            arrival_date: payout.arrival_date,
            message: 'Payout processed successfully. Funds will arrive in 1-3 business days.'
        });

    } catch (error: any) {
        console.error('Error processing payout:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process payout' },
            { status: 500 }
        );
    }
}
