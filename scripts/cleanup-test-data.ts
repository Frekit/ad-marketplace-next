import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function cleanup() {
    try {
        console.log('🧹 Cleaning up test data...\n');

        const testEmail = 'test-client@example.com';

        // Step 1: Find test user
        console.log('👤 Finding test user...');
        const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('email', testEmail)
            .single();

        if (!user) {
            console.log('   ℹ️  No test user found\n');
            return;
        }

        console.log(`   ✅ Found user: ${user.id}\n`);

        // Step 2: Delete transactions
        console.log('📊 Deleting transactions...');
        const { error: txError } = await supabase
            .from('transactions')
            .delete()
            .eq('user_id', user.id);

        if (txError) {
            console.error('   ❌ Error:', txError);
        } else {
            console.log('   ✅ Transactions deleted\n');
        }

        // Step 3: Delete wallet
        console.log('💰 Deleting wallet...');
        const { error: walletError } = await supabase
            .from('client_wallets')
            .delete()
            .eq('client_id', user.id);

        if (walletError) {
            console.error('   ❌ Error:', walletError);
        } else {
            console.log('   ✅ Wallet deleted\n');
        }

        // Step 4: Delete Stripe invoices
        console.log('📄 Deleting Stripe invoices...');
        const invoices = await stripe.invoices.list({
            customer: (await stripe.customers.list({ email: testEmail, limit: 1 })).data[0]?.id,
            limit: 100,
        });

        for (const invoice of invoices.data) {
            if (invoice.status === 'draft') {
                await stripe.invoices.del(invoice.id);
                console.log(`   ✅ Deleted draft invoice: ${invoice.id}`);
            } else {
                console.log(`   ℹ️  Skipped ${invoice.status} invoice: ${invoice.id}`);
            }
        }

        console.log('\n✅ Cleanup completed!');
        console.log('\n💡 Note: Paid invoices cannot be deleted from Stripe.');
        console.log('   They will remain in your Stripe dashboard but won\'t affect new tests.\n');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message || error);
    }
}

cleanup();
