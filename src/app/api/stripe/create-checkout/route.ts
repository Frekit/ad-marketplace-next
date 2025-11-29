import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getStripeClient } from '@/lib/stripe';
import { applyRateLimit, addRateLimitHeaders, logRequest } from '@/lib/api-middleware';
import { rateLimitConfig } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
    const startTime = Date.now();

    // Apply rate limiting (10 requests per minute for payment endpoints)
    const rateLimit = applyRateLimit(req, '/api/stripe/create-checkout', rateLimitConfig.payment);
    if (rateLimit instanceof NextResponse) {
        logRequest('POST', '/api/stripe/create-checkout', 429, Date.now() - startTime, req);
        return rateLimit;
    }

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

        const response = NextResponse.json({
            sessionId: checkoutSession.id,
            url: checkoutSession.url
        });

        const responseWithHeaders = addRateLimitHeaders(response, rateLimit.headers);
        logRequest('POST', '/api/stripe/create-checkout', 200, Date.now() - startTime, req, session?.user?.id);
        return responseWithHeaders;

    } catch (error) {
        console.error('Error creating checkout session:', error);
        logRequest('POST', '/api/stripe/create-checkout', 500, Date.now() - startTime, req);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
