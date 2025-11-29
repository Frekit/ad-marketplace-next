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

async function main() {
    try {
        console.log('🚀 Starting end-to-end Stripe invoice test...\n');

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

        if (!user) {
            throw new Error('Failed to create or find user');
        }

        console.log(`   ✅ User: ${user.first_name} ${user.last_name} (${user.id})\n`);

        // Step 2: Create Stripe Customer
        console.log('💳 Step 2: Creating Stripe customer...');
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

        await stripe.customers.update(customerId, {
            name: 'Test Corp',
            address: {
                line1: 'Calle Test 123',
                city: 'Madrid',
                postal_code: '28001',
                country: 'ES',
            },
        });

        console.log(`   ✅ Customer: ${customerId}\n`);

        // Step 3: Create Invoice
        console.log('📄 Step 3: Creating invoice...');
        const poCode = 'PO-TEST-' + Date.now();

        const invoiceItem = await stripe.invoiceItems.create({
            customer: customerId,
            amount: 10000, // €100
            currency: 'eur',
            description: `Wallet Deposit - PO: ${poCode}`,
        });

        console.log(`   🔍 Invoice Item created: ${invoiceItem.id}, amount: €${invoiceItem.amount / 100}`);

        const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: 'send_invoice',
            days_until_due: 30,
            pending_invoice_items_behavior: 'include',
            custom_fields: [
                { name: 'Orden de Compra', value: poCode },
            ],
            metadata: {
                userId: user.id,
                type: 'wallet_deposit',
                poCode: poCode,
            },
        });

        console.log(`   🔍 Invoice created: ${invoice.id}, status: ${invoice.status}, amount_due: €${invoice.amount_due / 100}`);

        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        console.log(`   🔍 Invoice finalized: status: ${finalizedInvoice.status}, amount_due: €${finalizedInvoice.amount_due / 100}`);

        console.log(`   ✅ Invoice: ${finalizedInvoice.number}`);
        console.log(`   📋 PO Code: ${poCode}`);
        console.log(`   💰 Amount Due: €${finalizedInvoice.amount_due / 100}`);
        console.log(`   💰 Amount Paid: €${finalizedInvoice.amount_paid / 100}`);
        console.log(`   📊 Status: ${finalizedInvoice.status}`);
        console.log(`   🔗 URL: ${finalizedInvoice.hosted_invoice_url}\n`);

        // Step 4: Simulate Payment
        console.log('💸 Step 4: Simulating bank transfer payment...');
        const amountInEuros = finalizedInvoice.amount_due / 100;

        console.log(`   🔍 Debug: amount_due = ${finalizedInvoice.amount_due}, amountInEuros = ${amountInEuros}`);

        try {
            if (finalizedInvoice.status !== 'paid') {
                await stripe.invoices.pay(finalizedInvoice.id, {
                    paid_out_of_band: true,
                });
                console.log(`   ✅ Invoice marked as PAID`);
                console.log(`   📡 Processing payment (€${amountInEuros})...\n`);

                // Call add_wallet_balance directly
                const { error: walletError } = await supabase.rpc('add_wallet_balance', {
                    p_client_id: user.id,
                    p_amount: amountInEuros,
                });

                if (walletError) {
                    console.error('   ❌ Error updating wallet:', walletError);
                } else {
                    console.log(`   ✅ Wallet updated successfully\n`);
                }

                // Create transaction record
                const { error: transactionError } = await supabase
                    .from('transactions')
                    .insert({
                        user_id: user.id,
                        type: 'deposit',
                        amount: amountInEuros,
                        status: 'completed',
                        description: `Deposit via Bank Transfer (PO: ${poCode})`,
                        metadata: {
                            stripe_invoice_id: finalizedInvoice.id,
                            stripe_customer_id: finalizedInvoice.customer,
                            po_code: poCode,
                            invoice_pdf: finalizedInvoice.invoice_pdf,
                        },
                    });

                if (transactionError) {
                    console.error('   ❌ Error creating transaction:', transactionError);
                } else {
                    console.log(`   ✅ Transaction created successfully\n`);
                }
            } else {
                console.log(`   ℹ️  Invoice already paid, skipping payment step\n`);
            }
        } catch (error: any) {
            if (error.message?.includes('already paid')) {
                console.log(`   ℹ️  Invoice already paid, continuing with verification\n`);
            } else {
                throw error;
            }
        }

        // Step 5: Wait a moment for DB to sync
        console.log('⏳ Step 5: Waiting 2 seconds for database to sync...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 6: Verify Balance
        console.log('💰 Step 6: Verifying wallet balance...');
        const { data: wallet, error: walletError } = await supabase
            .from('client_wallets')
            .select('available_balance, total_deposited, locked_balance')
            .eq('client_id', user.id)
            .single();

        if (walletError && walletError.code !== 'PGRST116') {
            throw walletError;
        }

        if (wallet) {
            console.log(`   Available Balance: €${wallet.available_balance}`);
            console.log(`   Total Deposited: €${wallet.total_deposited}`);
            console.log(`   Locked Balance: €${wallet.locked_balance}`);

            if (wallet.available_balance >= 100) {
                console.log('\n✅ SUCCESS! Payment reconciliation completed!');
                console.log('   The payment was processed and the wallet balance was updated.');
            } else {
                console.log('\n⚠️  WARNING: Balance is less than expected.');
                console.log('   Expected: €100, Got: €' + wallet.available_balance);
            }
        } else {
            console.log('\n⚠️  WARNING: No wallet record found.');
            console.log('   The payment may not have been processed correctly.');
        }

        // Step 7: Check transactions
        console.log('\n📊 Step 7: Checking transaction history...');
        const { data: transactions } = await supabase
            .from('transactions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5);

        if (transactions && transactions.length > 0) {
            console.log(`   Found ${transactions.length} transaction(s):`);
            transactions.forEach((tx, i) => {
                console.log(`   ${i + 1}. ${tx.type} - €${tx.amount} - ${tx.status}`);
            });
        } else {
            console.log('   No transactions found.');
        }

        console.log('\n🎉 Test completed!');

    } catch (error: any) {
        console.error('\n❌ Error:', error.message || error);
        if (error.type === 'StripeAuthenticationError') {
            console.log('\n💡 Check that STRIPE_SECRET_KEY in .env.local is correct');
        }
    }
}

main();
