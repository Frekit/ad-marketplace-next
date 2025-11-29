
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SOURCE_USER_ID = 'f8e2799c-221c-49f7-87b8-db5cdc117793'; // test-client
const TARGET_USER_ID = 'ce6ffb9c-03bf-4181-9417-154dfb653625'; // alvaroromero

async function transferFunds() {
    console.log('Starting transfer...');

    // 1. Get source wallet balance
    const { data: sourceWallet } = await supabase
        .from('client_wallets')
        .select('*')
        .eq('client_id', SOURCE_USER_ID)
        .single();

    if (!sourceWallet || sourceWallet.available_balance === 0) {
        console.log('Source wallet has no funds or does not exist.');
        return;
    }

    console.log(`Transferring €${sourceWallet.available_balance} from source to target...`);

    // 2. Update target wallet
    const { error: updateTargetError } = await supabase
        .from('client_wallets')
        .update({
            available_balance: sourceWallet.available_balance,
            total_deposited: sourceWallet.total_deposited,
            locked_balance: sourceWallet.locked_balance
        })
        .eq('client_id', TARGET_USER_ID);

    if (updateTargetError) {
        console.error('Error updating target wallet:', updateTargetError);
        return;
    }
    console.log('Target wallet updated.');

    // 3. Update source wallet to 0
    const { error: updateSourceError } = await supabase
        .from('client_wallets')
        .update({
            available_balance: 0,
            total_deposited: 0,
            locked_balance: 0
        })
        .eq('client_id', SOURCE_USER_ID);

    if (updateSourceError) {
        console.error('Error clearing source wallet:', updateSourceError);
    }
    console.log('Source wallet cleared.');

    // 4. Move transactions
    console.log('Moving transactions...');
    const { error: txError } = await supabase
        .from('transactions')
        .update({ user_id: TARGET_USER_ID })
        .eq('user_id', SOURCE_USER_ID);

    if (txError) {
        console.error('Error moving transactions:', txError);
    } else {
        console.log('Transactions moved successfully.');
    }

    console.log('Transfer complete!');
}

transferFunds();
