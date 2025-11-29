import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log('🔍 Inspecting client_wallets table...');

    const { error } = await supabase
        .from('client_wallets')
        .insert({ client_id: '00000000-0000-0000-0000-000000000000' }) // Dummy insert to see constraints
        .select();

    if (error) {
        console.log('❌ Insert Error:', error.message);
        console.log('   Details:', error.details);
        console.log('   Hint:', error.hint);
    }
}

inspect();
