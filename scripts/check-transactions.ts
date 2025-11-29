
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTransactions() {
    console.log('--- CHECKING TRANSACTIONS ---');

    // Get all transactions
    const { data: transactions, error } = await supabase
        .from('transactions')
        .select('id, user_id, amount, type, status, created_at');

    if (error) {
        console.error('Error fetching transactions:', error);
        return;
    }

    console.log(`Found ${transactions.length} transactions.`);
    console.log(JSON.stringify(transactions, null, 2));

    console.log('\n--- USERS ---');
    const { data: users } = await supabase.from('users').select('id, email');
    users?.forEach(u => console.log(`${u.id}: ${u.email}`));
}

checkTransactions();
