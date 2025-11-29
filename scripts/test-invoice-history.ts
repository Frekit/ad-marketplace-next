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

// Use the main user ID
const TEST_USER_ID = 'ce6ffb9c-03bf-4181-9417-154dfb653625'; // alvaroromero@fluvip.com
const TEST_EMAIL = 'alvaroromero@fluvip.com';

async function testInvoiceHistory() {
    console.log('🧪 Testing Invoice History Functionality\n');

    try {
        // Step 1: Get or create Stripe customer
        console.log('📋 Step 1: Setting up Stripe customer...');
        let customers = await stripe.customers.list({
            email: TEST_EMAIL,
            limit: 1,
        });

        let customerId = customers.data.length > 0 ? customers.data[0].id : null;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: TEST_EMAIL,
                name: 'Alvaro Romero',
                metadata: { userId: TEST_USER_ID },
            });
            customerId = customer.id;
        }

        console.log(`   ✅ Customer ID: ${customerId}\n`);

        // Step 2: Create a test invoice
        console.log('📄 Step 2: Creating test invoice...');
        const poCode = 'TEST-INVOICE-' + Date.now();

        // Create draft invoice first
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

        // Add invoice item to the draft
        const invoiceItem = await stripe.invoiceItems.create({
            customer: customerId,
            invoice: invoice.id,
            amount: 50000, // €500
            currency: 'eur',
            description: `Test Wallet Deposit - PO: ${poCode}`,
        });

        // Finalize the invoice
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        console.log(`   ✅ Invoice created: ${finalizedInvoice.number}`);
        console.log(`   📊 Status: ${finalizedInvoice.status}`);
        console.log(`   💰 Amount: €${finalizedInvoice.amount_due / 100}`);
        console.log(`   🔗 PDF: ${finalizedInvoice.invoice_pdf}`);
        console.log(`   🌐 Hosted URL: ${finalizedInvoice.hosted_invoice_url}\n`);

        // Step 3: Record transaction in Supabase
        console.log('💾 Step 3: Recording transaction in Supabase...');
        const { data: transaction, error: txError } = await supabase
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
            })
            .select()
            .single();

        if (txError) {
            console.error('   ❌ Error creating transaction:', txError);
        } else {
            console.log(`   ✅ Transaction recorded: ${transaction.id}\n`);
        }

        // Step 4: Verify invoice can be retrieved
        console.log('🔍 Step 4: Verifying invoice retrieval...');
        const retrievedInvoice = await stripe.invoices.retrieve(finalizedInvoice.id);
        console.log(`   ✅ Invoice retrieved successfully`);
        console.log(`   📋 Number: ${retrievedInvoice.number}`);
        console.log(`   📊 Status: ${retrievedInvoice.status}\n`);

        // Step 5: Test invoice cancellation
        console.log('❌ Step 5: Testing invoice cancellation...');
        const voidedInvoice = await stripe.invoices.voidInvoice(finalizedInvoice.id);
        console.log(`   ✅ Invoice voided successfully`);
        console.log(`   📊 New status: ${voidedInvoice.status}\n`);

        // Step 6: Verify all invoices for user
        console.log('📊 Step 6: Fetching all invoices for user...');
        const { data: allTransactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', TEST_USER_ID)
            .eq('type', 'deposit')
            .order('created_at', { ascending: false });

        console.log(`   ✅ Found ${allTransactions?.length || 0} deposit transactions\n`);

        if (allTransactions && allTransactions.length > 0) {
            console.log('📋 Invoice Summary:');
            for (const tx of allTransactions.slice(0, 5)) {
                if (tx.metadata?.stripe_invoice_id) {
                    try {
                        const inv = await stripe.invoices.retrieve(tx.metadata.stripe_invoice_id);
                        console.log(`   • ${inv.number || inv.id.slice(-8)}: €${inv.amount_due / 100} - ${inv.status}`);
                    } catch (e) {
                        console.log(`   • ${tx.metadata.stripe_invoice_id}: Error retrieving`);
                    }
                }
            }
        }

        console.log('\n✅ All tests completed successfully!');
        console.log('\n📝 Next Steps:');
        console.log('   1. Navigate to http://localhost:3000/wallet');
        console.log('   2. Verify the invoice appears in the history');
        console.log('   3. Test PDF download button');
        console.log('   4. Test "View Invoice" button');
        console.log('   5. Create a new invoice and test cancel button');

    } catch (error: any) {
        console.error('\n❌ Test failed:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testInvoiceHistory();
