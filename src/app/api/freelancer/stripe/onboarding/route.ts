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

        const supabase = createClient();
        const stripe = getStripeClient();

        // 1. VALIDAR: ¿Tiene facturas aprobadas?
        const { data: invoices, error: invoiceError } = await supabase
            .from('invoices')
            .select('id, status')
            .eq('freelancer_id', session.user.id)
            .eq('status', 'approved')
            .limit(1);

        if (invoiceError) {
            throw invoiceError;
        }

        if (!invoices || invoices.length === 0) {
            return NextResponse.json(
                { error: 'You must have an approved invoice before setting up payments. Please create and get an invoice approved first.' },
                { status: 400 }
            );
        }

        // 2. Get or create Stripe Connect account
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('stripe_connect_id, email, first_name, last_name')
            .eq('id', session.user.id)
            .single();

        if (userError) {
            throw userError;
        }

        let stripeAccountId = user.stripe_connect_id;

        // Create new Stripe Connect account if doesn't exist
        if (!stripeAccountId) {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'ES',
                email: user.email,
                capabilities: {
                    transfers: { requested: true },
                },
                business_profile: {
                    name: `${user.first_name} ${user.last_name}`,
                    url: process.env.NEXT_PUBLIC_APP_URL,
                },
                settings: {
                    payouts: {
                        debit_negative_balances: true,
                        schedule: {
                            interval: 'daily',
                        },
                    },
                },
            });

            stripeAccountId = account.id;

            // Save the Stripe Connect ID
            await supabase
                .from('users')
                .update({ stripe_connect_id: stripeAccountId })
                .eq('id', session.user.id);
        }

        // 3. Create onboarding link
        const onboardingLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            type: 'account_onboarding',
            refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/freelancer/wallet?setup=failed`,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/freelancer/wallet?setup=success`,
        });

        return NextResponse.json({
            onboarding_url: onboardingLink.url,
            message: 'Complete your Stripe Connect setup to enable payouts'
        });

    } catch (error: any) {
        console.error('Error creating Stripe onboarding:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create onboarding' },
            { status: 500 }
        );
    }
}
