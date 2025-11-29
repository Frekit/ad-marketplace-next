import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

async function main() {
    try {
        console.log('🚀 Simplified Stripe Invoice Test\n');

        // We'll create an invoice for a test customer
        const testEmail = 'test-invoice@example.com';
        const testUserId = 'test-user-' + Date.now(); // Simulated user ID

        console.log('💳 Step 1: Creating/Finding Stripe customer...');
        let customers = await stripe.customers.list({
            email: testEmail,
            limit: 1,
        });

        let customerId: string;

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            console.log(`   ✅ Found existing customer: ${customerId}`);
        } else {
            const customer = await stripe.customers.create({
                email: testEmail,
                name: 'Test Corp',
                metadata: { userId: testUserId },
            });
            customerId = customer.id;
            console.log(`   ✅ Created new customer: ${customerId}`);
        }

        // Update customer with billing details
        console.log('\n📝 Step 2: Updating billing details...');
        await stripe.customers.update(customerId, {
            name: 'Test Corp S.L.',
            address: {
                line1: 'Calle de Prueba 123',
                city: 'Madrid',
                postal_code: '28001',
                country: 'ES',
            },
        });

        // Add tax ID separately
        try {
            await stripe.customers.createTaxId(customerId, {
                type: 'eu_vat',
                value: 'ESB12345678',
            });
            console.log('   ✅ Billing details and Tax ID updated');
        } catch (e: any) {
            console.log('   ✅ Billing details updated (Tax ID may already exist)');
        }

        // Create Invoice
        console.log('\n📄 Step 3: Creating invoice...');
        const poCode = 'PO-TEST-' + Date.now();

        await stripe.invoiceItems.create({
            customer: customerId,
            amount: 10000, // €100
            currency: 'eur',
            description: `Wallet Deposit - PO: ${poCode}`,
        });

        const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: 'send_invoice',
            days_until_due: 30,
            custom_fields: [
                { name: 'Orden de Compra', value: poCode },
            ],
            metadata: {
                userId: testUserId,
                type: 'wallet_deposit',
                poCode: poCode,
            },
        });

        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        console.log(`   ✅ Invoice Created!`);
        console.log(`   📋 Invoice Number: ${finalizedInvoice.number}`);
        console.log(`   📋 PO Code: ${poCode}`);
        console.log(`   💰 Amount: €${finalizedInvoice.amount_due / 100}`);
        console.log(`   🔗 View Invoice: ${finalizedInvoice.hosted_invoice_url}`);
        console.log(`   📄 Download PDF: ${finalizedInvoice.invoice_pdf}`);

        // Simulate Payment
        console.log('\n💸 Step 4: Simulating bank transfer payment...');
        const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, {
            paid_out_of_band: true,
        });
        console.log(`   ✅ Invoice marked as PAID`);
        console.log(`   Status: ${paidInvoice.status}`);

        console.log('\n⏳ Step 5: Waiting for webhook...');
        console.log('   The webhook should receive an "invoice.payment_succeeded" event.');
        console.log('   Check your terminal running "stripe listen" for webhook logs.');

        console.log('\n📊 Summary:');
        console.log('   1. ✅ Invoice generated with PO code');
        console.log('   2. ✅ Payment simulated (marked as paid out of band)');
        console.log('   3. ⏳ Webhook should process the payment');
        console.log('   4. ⏳ Wallet balance should update (if user exists in DB)');

        console.log('\n💡 Next Steps:');
        console.log('   - Check webhook logs: Look for "invoice.payment_succeeded" event');
        console.log('   - Check server logs: Look for "✅ Deposit completed" message');
        console.log('   - Verify in Stripe Dashboard: https://dashboard.stripe.com/test/invoices');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message || error);
    }
}

main();
