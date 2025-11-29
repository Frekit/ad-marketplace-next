import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

// Create Stripe instance directly with env var
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
    try {
        console.log('🔍 Finding latest open invoice...');
        const invoices = await stripe.invoices.list({
            status: 'open',
            limit: 1,
        });

        if (invoices.data.length === 0) {
            console.log('❌ No open invoices found.');
            console.log('💡 First, generate an invoice from http://localhost:3000/wallet');
            return;
        }

        const invoice = invoices.data[0];
        console.log(`\n📄 Found Invoice: ${invoice.number} (${invoice.id})`);
        console.log(`👤 Customer: ${invoice.customer_name || 'N/A'} (${invoice.customer_email})`);
        console.log(`💰 Amount: €${invoice.amount_remaining / 100}`);
        console.log(`📋 PO Code: ${invoice.metadata?.poCode || 'N/A'}`);

        console.log('\n💸 Simulating Bank Transfer (Marking as Paid out of band)...');

        const paidInvoice = await stripe.invoices.pay(invoice.id, {
            paid_out_of_band: true, // Simulates external payment (like bank transfer)
        });

        console.log(`✅ Invoice ${paidInvoice.number} marked as PAID.`);
        console.log('⏳ Waiting 5 seconds for webhook to process...');

        await new Promise(resolve => setTimeout(resolve, 5000));

        // Verify Balance
        const userId = invoice.metadata?.userId;
        if (userId) {
            const { data: wallet, error } = await supabase
                .from('client_wallets')
                .select('available_balance, total_deposited')
                .eq('client_id', userId)
                .single();

            if (error) {
                console.log(`\n⚠️ Could not fetch wallet: ${error.message}`);
            } else {
                console.log(`\n💰 Wallet Status for user ${userId}:`);
                console.log(`   Available Balance: €${wallet?.available_balance || 0}`);
                console.log(`   Total Deposited: €${wallet?.total_deposited || 0}`);

                if (wallet?.available_balance && wallet.available_balance > 0) {
                    console.log('\n✅ SUCCESS! Reconciliation completed - balance updated!');
                } else {
                    console.log('\n⚠️ Balance is still 0.');
                    console.log('   Make sure webhook is running: stripe listen --forward-to localhost:3000/api/stripe/webhook');
                }
            }
        } else {
            console.log('\n⚠️ Could not verify balance: No userId in invoice metadata.');
        }

    } catch (error: any) {
        console.error('\n❌ Error:', error.message || error);
        if (error.type === 'StripeAuthenticationError') {
            console.log('\n💡 Check that STRIPE_SECRET_KEY in .env.local is correct');
        }
    }
}

main();
