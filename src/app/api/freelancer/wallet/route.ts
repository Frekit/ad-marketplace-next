import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

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

        // Get or create freelancer wallet
        let { data: wallet, error } = await supabase
            .from('freelancer_wallets')
            .select('*')
            .eq('freelancer_id', session.user.id)
            .single();

        if (error && error.code === 'PGRST116') {
            // Wallet doesn't exist, create it
            const { data: newWallet, error: createError } = await supabase
                .from('freelancer_wallets')
                .insert({
                    freelancer_id: session.user.id,
                    available_balance: 0,
                    total_earned: 0,
                })
                .select()
                .single();

            if (createError) {
                throw createError;
            }

            wallet = newWallet;
        } else if (error) {
            throw error;
        }

        return NextResponse.json({ wallet });

    } catch (error: any) {
        console.error('Error fetching wallet:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch wallet' },
            { status: 500 }
        );
    }
}
