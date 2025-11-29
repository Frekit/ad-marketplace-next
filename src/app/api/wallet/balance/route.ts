import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient();

    const { data: wallet, error } = await supabase
        .from('client_wallets')
        .select('available_balance, locked_balance')
        .eq('client_id', session.user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error fetching wallet:', error);
        return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
    }

    return NextResponse.json({
        available_balance: wallet?.available_balance || 0,
        locked_balance: wallet?.locked_balance || 0
    });
}
