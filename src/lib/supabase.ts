import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Creates a Supabase client.
 * - In client‑side code we use the anon key.
 * - In server‑side routes we prefer the service role key (bypasses RLS).
 */
export const createClient = () => {
    const key = supabaseServiceKey ?? supabaseAnonKey;
    if (!supabaseUrl || !key) {
        throw new Error('Supabase URL or key is missing');
    }
    return createSupabaseClient(supabaseUrl, key);
};