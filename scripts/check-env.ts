import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('🔍 Checking environment variables...\n');

const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
];

let allPresent = true;

requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        // Show first and last 4 characters for security
        const masked = value.length > 8
            ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
            : '***';
        console.log(`✅ ${varName}: ${masked} (length: ${value.length})`);
    } else {
        console.log(`❌ ${varName}: NOT SET`);
        allPresent = false;
    }
});

console.log('\n' + '='.repeat(50));

if (allPresent) {
    console.log('✅ All required environment variables are set!');
} else {
    console.log('❌ Some environment variables are missing!');
    console.log('\nPlease check your .env.local file.');
}

// Additional checks
console.log('\n🔍 Additional checks:');

// Check Supabase URL format
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (supabaseUrl) {
    if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co')) {
        console.log('✅ Supabase URL format looks correct');
    } else {
        console.log('⚠️  Supabase URL format might be incorrect');
        console.log(`   Expected: https://[project-id].supabase.co`);
    }
}

// Check Stripe key format
const stripeKey = process.env.STRIPE_SECRET_KEY;
if (stripeKey) {
    if (stripeKey.startsWith('sk_test_') || stripeKey.startsWith('sk_live_')) {
        console.log('✅ Stripe secret key format looks correct');
    } else {
        console.log('⚠️  Stripe secret key format might be incorrect');
        console.log(`   Expected: sk_test_... or sk_live_...`);
    }
}

// Check Supabase service role key format
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (serviceRoleKey) {
    if (serviceRoleKey.startsWith('eyJ')) {
        console.log('✅ Supabase service role key format looks correct (JWT)');
    } else {
        console.log('⚠️  Supabase service role key format might be incorrect');
        console.log(`   Expected: JWT token starting with 'eyJ'`);
    }
}
