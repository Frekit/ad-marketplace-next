import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

async function diagnose() {
    try {
        console.log('🔍 Diagnosing Stripe Invoice Issue...\n');

        const testEmail = 'test-client@example.com';

        // Step 1: Find or create customer
        console.log('👤 Step 1: Getting customer...');
        const customers = await stripe.customers.list({
            email: testEmail,
            limit: 1,
        });

        let customerId = customers.data[0]?.id;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: testEmail,
                name: 'Test Corp',
            });
            customerId = customer.id;
        }
        console.log(`   Customer ID: ${customerId}\n`);

        // Step 2: List existing invoices
        console.log('📄 Step 2: Checking existing invoices...');
        const existingInvoices = await stripe.invoices.list({
            customer: customerId,
            limit: 5,
        });

        console.log(`   Found ${existingInvoices.data.length} existing invoice(s):`);
        existingInvoices.data.forEach((inv, i) => {
            console.log(`   ${i + 1}. ${inv.id} - Status: ${inv.status}, Amount Due: €${inv.amount_due / 100}, Amount Paid: €${inv.amount_paid / 100}`);
        });
        console.log('');

        // Step 3: Create a new invoice item
        console.log('📝 Step 3: Creating invoice item...');
        const invoiceItem = await stripe.invoiceItems.create({
            customer: customerId,
            amount: 10000, // €100
            currency: 'eur',
            description: 'Test Deposit - ' + Date.now(),
        });

        console.log(`   ✅ Invoice Item ID: ${invoiceItem.id}`);
        console.log(`   Amount: €${invoiceItem.amount / 100}`);
        console.log(`   Currency: ${invoiceItem.currency}`);
        console.log(`   Customer: ${invoiceItem.customer}`);
        console.log(`   Invoice: ${invoiceItem.invoice || 'Not attached yet'}\n`);

        // Step 4: Create invoice
        console.log('📋 Step 4: Creating invoice...');
        const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: 'send_invoice',
            days_until_due: 30,
            pending_invoice_items_behavior: 'include',
        });

        console.log(`   ✅ Invoice ID: ${invoice.id}`);
        console.log(`   Status: ${invoice.status}`);
        console.log(`   Amount Due: €${invoice.amount_due / 100}`);
        console.log(`   Amount Paid: €${invoice.amount_paid / 100}`);
        console.log(`   Total: €${invoice.total / 100}`);
        console.log(`   Subtotal: €${invoice.subtotal / 100}`);

        // Check line items
        console.log(`\n   Line Items (${invoice.lines.data.length}):`);
        invoice.lines.data.forEach((line, i) => {
            console.log(`   ${i + 1}. ${line.description} - €${line.amount / 100}`);
        });
        console.log('');

        // Step 5: Finalize invoice
        console.log('✅ Step 5: Finalizing invoice...');
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        console.log(`   Status: ${finalizedInvoice.status}`);
        console.log(`   Amount Due: €${finalizedInvoice.amount_due / 100}`);
        console.log(`   Amount Paid: €${finalizedInvoice.amount_paid / 100}`);
        console.log(`   Total: €${finalizedInvoice.total / 100}`);
        console.log(`   Subtotal: €${finalizedInvoice.subtotal / 100}`);

        console.log(`\n   Line Items (${finalizedInvoice.lines.data.length}):`);
        finalizedInvoice.lines.data.forEach((line, i) => {
            console.log(`   ${i + 1}. ${line.description} - €${line.amount / 100}`);
        });

        console.log('\n🎉 Diagnosis complete!');
        console.log(`\n📊 Summary:`);
        console.log(`   Invoice Item Amount: €${invoiceItem.amount / 100}`);
        console.log(`   Invoice Amount Due: €${finalizedInvoice.amount_due / 100}`);
        console.log(`   Invoice Status: ${finalizedInvoice.status}`);

        if (finalizedInvoice.amount_due === 0) {
            console.log('\n⚠️  WARNING: Invoice amount_due is €0!');
            console.log('   Possible causes:');
            console.log('   1. Invoice item was not attached to the invoice');
            console.log('   2. Customer has a credit balance that covered the invoice');
            console.log('   3. Stripe test mode has auto-payment enabled');
        }

        // Check customer balance
        const customer = await stripe.customers.retrieve(customerId);
        console.log(`\n💰 Customer Balance: €${customer.balance / 100}`);

    } catch (error: any) {
        console.error('\n❌ Error:', error.message || error);
        if (error.raw) {
            console.error('   Raw error:', JSON.stringify(error.raw, null, 2));
        }
    }
}

diagnose();
