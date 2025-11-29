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

async function seedWallet() {
    try {
        console.log('🚀 Starting wallet seeding (1000 EUR)...\n');

        // Step 1: Get or create a test user
        console.log('👤 Step 1: Finding test user...');
        const testEmail = 'test-client@example.com';

        let { data: user } = await supabase
            .from('users')
            .select('id, email, first_name, last_name')
            .eq('email', testEmail)
            .eq('role', 'client')
            .single();

        if (!user) {
            console.log('   Creating test user...');
            const { data: newUser, error } = await supabase
                .from('users')
                .insert({
                    email: testEmail,
                    password_hash: 'dummy_hash',
                    first_name: 'Test',
                    last_name: 'Client',
                    role: 'client',
                    company_name: 'Test Corp',
                })
                .select()
                .single();

            if (error) throw error;
            user = newUser;
        }

        console.log(`   ✅ User: ${user.first_name} ${user.last_name} (${user.id})\n`);

        // Step 2: Create Stripe Customer
        console.log('💳 Step 2: Getting Stripe customer...');
        const customers = await stripe.customers.list({
            email: testEmail,
            limit: 1,
        });

        let customerId = customers.data.length > 0 ? customers.data[0].id : null;

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: testEmail,
                name: 'Test Corp',
                metadata: { userId: user.id },
            });
            customerId = customer.id;
        }

        console.log(`   ✅ Customer: ${customerId}\n`);

        // Step 3: Create Invoice for 1000 EUR
        console.log('📄 Step 3: Creating invoice for €1,000...');
        const poCode = 'PO-SEED-' + Date.now();
        const amountEur = 1000;
        const amountCents = amountEur * 100;

        await stripe.invoiceItems.create({
            customer: customerId,
            amount: amountCents,
            currency: 'eur',
            description: `Wallet Seed Deposit - PO: ${poCode}`,
        });

        const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: 'send_invoice',
            days_until_due: 30,
            pending_invoice_items_behavior: 'include', // IMPORTANT: Include the item we just created
            custom_fields: [
                { name: 'Orden de Compra', value: poCode },
            ],
            metadata: {
                userId: user.id,
                type: 'wallet_deposit',
                poCode: poCode,
            },
        });

        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        console.log(`   ✅ Invoice: ${finalizedInvoice.number}`);
        console.log(`   💰 Amount: €${finalizedInvoice.amount_due / 100}`);
        console.log(`   🔗 URL: ${finalizedInvoice.hosted_invoice_url}\n`);

        // Step 4: Pay Invoice
        console.log('💸 Step 4: Processing payment...');

        if (finalizedInvoice.status !== 'paid') {
            const paidInvoice = await stripe.invoices.pay(finalizedInvoice.id, {
                paid_out_of_band: true,
            });
            console.log(`   ✅ Invoice marked as PAID in Stripe`);

            // Manually update DB since we are using paid_out_of_band
            console.log(`   📡 Updating database wallet...\n`);

            // Call add_wallet_balance directly
            const { error: walletError } = await supabase.rpc('add_wallet_balance', {
                p_client_id: user.id,
                p_amount: amountEur,
            });

            if (walletError) {
                console.error('   ❌ Error updating wallet:', walletError);
                throw walletError;
            } else {
                console.log(`   ✅ Wallet updated successfully\n`);
            }

            // Create transaction record
            const { error: transactionError } = await supabase
                .from('transactions')
                .insert({
                    user_id: user.id,
                    type: 'deposit',
                    amount: amountEur,
                    status: 'completed',
                    description: `Seed Deposit (PO: ${poCode})`,
                    metadata: {
                        stripe_invoice_id: paidInvoice.id,
                        stripe_customer_id: paidInvoice.customer,
                        po_code: poCode,
                        invoice_pdf: paidInvoice.invoice_pdf,
                    },
                });

            if (transactionError) {
                console.error('   ❌ Error creating transaction:', transactionError);
            } else {
                console.log(`   ✅ Transaction created successfully\n`);
            }
        } else {
            console.log(`   ℹ️  Invoice already paid\n`);
        }

        // Step 5: Verify Final Balance
        console.log('💰 Step 5: Verifying final wallet balance...');
        const { data: wallet } = await supabase
            .from('client_wallets')
            .select('available_balance, total_deposited')
            .eq('client_id', user.id)
            .single();

        if (wallet) {
            console.log(`   ✨ Current Available Balance: €${wallet.available_balance}`);
            console.log(`   ✨ Total Deposited: €${wallet.total_deposited}`);
        }

        console.log('\n🎉 Wallet seeded successfully!');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message || error);
    }
}

seedWallet();
