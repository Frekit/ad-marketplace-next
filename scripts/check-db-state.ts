
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDbState() {
    console.log('--- USERS ---');
    const { data: users } = await supabase.from('users').select('id, email, role');
    console.log(users);

    console.log('\n--- WALLETS ---');
    const { data: wallets } = await supabase.from('client_wallets').select('*');
    console.log(wallets);
}

checkDbState();
