import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';
import { getStripeClient } from '@/lib/stripe';

export async function GET(req: NextRequest) {
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

        // Check if freelancer already has a Stripe Connect account
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('stripe_connect_id, email, first_name, last_name')
            .eq('id', session.user.id)
            .single();

        if (userError) {
            throw userError;
        }

        // If already connected, return their account details
        if (user.stripe_connect_id) {
            const account = await stripe.accounts.retrieve(user.stripe_connect_id);
            
            return NextResponse.json({
                connected: true,
                account_id: account.id,
                email: account.email,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                status: account.requirements?.current_deadline ? 'pending_verification' : 'verified'
            });
        }

        // Create new Stripe Connect account
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

        // Save the Stripe Connect ID
        await supabase
            .from('users')
            .update({ stripe_connect_id: account.id })
            .eq('id', session.user.id);

        return NextResponse.json({
            connected: false,
            account_id: account.id,
            status: 'created'
        });

    } catch (error: any) {
        console.error('Error with Stripe Connect:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process Stripe Connect' },
            { status: 500 }
        );
    }
}
