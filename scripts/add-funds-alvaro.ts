import { config } from 'dotenv';
config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addFunds() {
    const targetEmail = 'alvarovi24@gmail.com';
    console.log(`🔍 Searching for user ${targetEmail}...`);

    // 1. Find User
    const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('email', targetEmail)
        .single();

    if (userError) {
        console.error('❌ Error searching user:', userError);
        return;
    }

    if (!user) {
        console.error(`❌ User "${targetEmail}" not found.`);
        return;
    }

    processUser(user);
}

async function processUser(user: any) {
    console.log(`✅ Found user: ${user.first_name} ${user.last_name} (${user.email})`);
    const userId = user.id;
    const AMOUNT_TO_ADD = 200.00;

    // 2. Check/Create Wallet
    console.log(`💰 Adding €${AMOUNT_TO_ADD} to wallet...`);

    // First check if wallet exists
    const { data: wallet, error: walletError } = await supabase
        .from('client_wallets')
        .select('*')
        .eq('client_id', userId)
        .single();

    if (walletError && walletError.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('❌ Error checking wallet:', walletError);
        return;
    }

    if (wallet) {
        // Update existing wallet
        const { error: updateError } = await supabase
            .from('client_wallets')
            .update({
                available_balance: wallet.available_balance + AMOUNT_TO_ADD,
                total_deposited: wallet.total_deposited + AMOUNT_TO_ADD,
                updated_at: new Date().toISOString()
            })
            .eq('client_id', userId);

        if (updateError) {
            console.error('❌ Error updating wallet:', updateError);
        } else {
            console.log(`✅ Successfully added funds. New balance: €${wallet.available_balance + AMOUNT_TO_ADD}`);
        }
    } else {
        // Create new wallet
        const { error: insertError } = await supabase
            .from('client_wallets')
            .insert({
                client_id: userId,
                total_deposited: AMOUNT_TO_ADD,
                available_balance: AMOUNT_TO_ADD,
                locked_balance: 0
            });

        if (insertError) {
            console.error('❌ Error creating wallet:', insertError);
        } else {
            console.log(`✅ Successfully created wallet with funds. Balance: €${AMOUNT_TO_ADD}`);
        }
    }

    // 3. Record Transaction
    const { error: txnError } = await supabase
        .from('transactions')
        .insert({
            user_id: userId,
            type: 'deposit',
            amount: AMOUNT_TO_ADD,
            status: 'completed',
            description: 'Manual deposit via admin script',
            metadata: { source: 'admin_script' }
        });

    if (txnError) {
        console.error('⚠️ Error recording transaction:', txnError);
    } else {
        console.log('✅ Transaction recorded.');
    }
}

addFunds().catch(console.error);
