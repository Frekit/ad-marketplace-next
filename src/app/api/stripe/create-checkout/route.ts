import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStripeClient } from '@/lib/stripe';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'client') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { amount } = await req.json();

        // Validate amount
        if (!amount || amount < 10) {
            return NextResponse.json(
                { error: 'Minimum deposit is €10' },
                { status: 400 }
            );
        }

        // Create Stripe Checkout Session
        const stripe = getStripeClient();
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card', 'sepa_debit'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Wallet Deposit',
                            description: 'Add funds to your AdMarket wallet',
                        },
                        unit_amount: Math.round(amount * 100), // Convert to cents
                    },
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXTAUTH_URL}/wallet?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXTAUTH_URL}/wallet?canceled=true`,
            metadata: {
                userId: session.user.id!,
                type: 'wallet_deposit',
                amount: amount.toString(),
            },
            customer_email: session.user.email!,
        });

        return NextResponse.json({
            sessionId: checkoutSession.id,
            url: checkoutSession.url
        });

    } catch (error) {
        console.error('Error creating checkout session:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
