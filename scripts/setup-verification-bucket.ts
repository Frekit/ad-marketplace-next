import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupBucket() {
    console.log('🪣 Setting up verification-docs bucket...');

    const { data, error } = await supabase.storage.createBucket('verification-docs', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['application/pdf']
    });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log('✅ Bucket "verification-docs" already exists.');
        } else {
            console.error('❌ Failed to create bucket:', error.message);
        }
    } else {
        console.log('✅ Bucket "verification-docs" created successfully.');
    }
}

setupBucket().catch(console.error);
