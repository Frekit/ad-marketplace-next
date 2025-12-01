
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    console.log('Listing tables...');
    // We can't easily list tables with supabase-js without using rpc or specific query if we don't have direct SQL access.
    // But we can try to select from 'messages' to see if it exists.

    const { error: messagesError } = await supabase
        .from('messages')
        .select('id')
        .limit(1);

    if (messagesError) {
        console.error('Error accessing messages table:', messagesError);
    } else {
        console.log('Messages table exists.');
    }

    const { error: conversationsError } = await supabase
        .from('conversations')
        .select('id')
        .limit(1);

    if (conversationsError) {
        console.error('Error accessing conversations table:', conversationsError);
    } else {
        console.log('Conversations table exists.');
    }
}

main();
