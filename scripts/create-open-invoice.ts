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

const TEST_USER_ID = 'ce6ffb9c-03bf-4181-9417-154dfb653625';
const TEST_EMAIL = 'alvaroromero@fluvip.com';

async function createOpenInvoice() {
    console.log('📄 Creating an OPEN invoice for testing cancel button...\n');

    try {
        // Get customer
        let customers = await stripe.customers.list({
            email: TEST_EMAIL,
            limit: 1,
        });

        let customerId = customers.data[0]?.id;

        if (!customerId) {
            console.error('Customer not found');
            return;
        }

        const poCode = 'OPEN-TEST-' + Date.now();

        // Create draft invoice
        const invoice = await stripe.invoices.create({
            customer: customerId,
            auto_advance: false,
            collection_method: 'send_invoice',
            days_until_due: 30,
            metadata: {
                userId: TEST_USER_ID,
                poCode: poCode,
            },
        });

        // Add item
        await stripe.invoiceItems.create({
            customer: customerId,
            invoice: invoice.id,
            amount: 25000, // €250
            currency: 'eur',
            description: `Test Deposit - ${poCode}`,
        });

        // Finalize to make it OPEN
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        // Record in Supabase
        await supabase
            .from('transactions')
            .insert({
                user_id: TEST_USER_ID,
                type: 'deposit',
                amount: finalizedInvoice.amount_due / 100,
                status: 'pending',
                description: `Wallet Deposit - ${poCode}`,
                metadata: {
                    stripe_invoice_id: finalizedInvoice.id,
                    stripe_customer_id: customerId,
                    po_code: poCode,
                },
            });

        console.log('✅ Open invoice created successfully!');
        console.log(`   Invoice Number: ${finalizedInvoice.number}`);
        console.log(`   Status: ${finalizedInvoice.status}`);
        console.log(`   Amount: €${finalizedInvoice.amount_due / 100}`);
        console.log(`\n🔗 Now navigate to http://localhost:3000/wallet to see the cancel button!`);

    } catch (error: any) {
        console.error('❌ Error:', error.message);
    }
}

createOpenInvoice();
