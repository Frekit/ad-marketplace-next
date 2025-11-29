import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    typescript: true,
});

async function testStripe() {
    try {
        console.log('Testing Stripe connection...');
        const email = 'test-stripe-debug@example.com';

        console.log('1. Creating customer...');
        const customer = await stripe.customers.create({
            email,
            name: 'Debug User'
        });
        console.log('   Customer created:', customer.id);

        console.log('2. Creating invoice item...');
        const item = await stripe.invoiceItems.create({
            customer: customer.id,
            amount: 5000, // 50.00
            currency: 'eur',
            description: 'Debug Deposit'
        });
        console.log('   Invoice item created:', item.id);

        console.log('3. Creating invoice...');
        const invoice = await stripe.invoices.create({
            customer: customer.id,
            collection_method: 'send_invoice',
            days_until_due: 30
        });
        console.log('   Invoice created:', invoice.id);

        console.log('4. Finalizing invoice...');
        const finalized = await stripe.invoices.finalizeInvoice(invoice.id);
        console.log('   Invoice finalized:', finalized.status);

        console.log('5. Paying invoice...');
        const paid = await stripe.invoices.pay(invoice.id, { paid_out_of_band: true });
        console.log('   Invoice paid:', paid.status);

        console.log('✅ Stripe flow success!');

    } catch (error: any) {
        console.error('❌ Stripe Error:', error.message);
        console.error('Type:', error.type);
        console.error('Code:', error.code);
        console.error('Param:', error.param);
    }
}

testStripe();
