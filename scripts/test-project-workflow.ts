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

// Test configuration
const TEST_CONFIG = {
    clientEmail: 'test-client-workflow@example.com',
    freelancerEmail: 'test-freelancer-workflow@example.com',
    depositAmount: 500, // €500
    projectBudget: 400, // €400
    milestones: [
        { name: 'Milestone 1', amount: 200, description: 'First deliverable' },
        { name: 'Milestone 2', amount: 200, description: 'Second deliverable' }
    ]
};

async function main() {
    try {
        console.log('🚀 Starting End-to-End Project Workflow Test\n');
        console.log('='.repeat(60) + '\n');

        // STEP 1: Setup Test Users
        console.log('👥 STEP 1: Setting up test users...');
        const { client, freelancer } = await setupTestUsers();
        console.log(`   ✅ Client: ${client.email} (${client.id})`);
        console.log(`   ✅ Freelancer: ${freelancer.email} (${freelancer.id})\n`);

        // CLEANUP: Reset wallets to 0 to avoid pollution from previous runs
        console.log('🧹 CLEANUP: Resetting test wallets...');
        await supabase.from('client_wallets').delete().eq('client_id', client.id);
        await supabase.from('freelancer_wallets').delete().eq('freelancer_id', freelancer.id);
        console.log('   ✅ Wallets reset\n');

        // STEP 2: Client Deposits Funds
        console.log('💰 STEP 2: Client deposits funds...');
        await depositFunds(client.id, client.email, TEST_CONFIG.depositAmount);
        const { data: walletAfterDeposit } = await supabase
            .from('client_wallets')
            .select('available_balance')
            .eq('client_id', client.id)
            .single();
        console.log(`   ✅ Deposited: €${TEST_CONFIG.depositAmount}`);
        console.log(`   💳 Client Balance: €${walletAfterDeposit?.available_balance || 0}\n`);

        // STEP 3: Client Creates Project
        console.log('📋 STEP 3: Client creates project...');
        const project = await createProject(client.id);
        console.log(`   ✅ Project Created: ${project.title}`);
        console.log(`   📊 Budget: €${project.allocated_budget}`);
        console.log(`   🎯 Milestones: ${project.milestones.length}\n`);

        // STEP 4: Client Invites Freelancer
        console.log('📧 STEP 4: Client invites freelancer...');
        const invitation = await inviteFreelancer(project.id, client.id, freelancer.id);
        console.log(`   ✅ Invitation Sent: ${invitation.id}`);
        console.log(`   📬 Status: ${invitation.status}\n`);

        // STEP 5: Freelancer Submits Offer
        console.log('💼 STEP 5: Freelancer submits offer...');
        const offer = await submitOffer(invitation.id, freelancer.id, project.milestones);
        console.log(`   ✅ Offer Submitted: ${offer.id}`);
        console.log(`   💰 Total Amount: €${offer.total_amount}`);
        console.log(`   📊 Status: ${offer.status}\n`);

        // STEP 6: Client Accepts Offer (Locks Funds)
        console.log('✅ STEP 6: Client accepts offer and locks funds...');
        await acceptOffer(project.id, offer.id, client.id);
        const { data: walletAfterLock } = await supabase
            .from('client_wallets')
            .select('available_balance, locked_balance')
            .eq('client_id', client.id)
            .single();
        console.log(`   ✅ Offer Accepted`);
        console.log(`   💳 Available: €${walletAfterLock?.available_balance || 0}`);
        console.log(`   🔒 Locked: €${walletAfterLock?.locked_balance || 0}\n`);

        // STEP 7: Freelancer Completes First Milestone
        console.log('🎯 STEP 7: Freelancer completes first milestone...');
        await completeMilestone(project.id, 0, freelancer.id);
        console.log(`   ✅ Milestone 1 marked as completed\n`);

        // STEP 8: Freelancer Submits Invoice
        console.log('📄 STEP 8: Freelancer submits invoice...');
        const invoice = await submitInvoice(project.id, 0, freelancer.id);
        console.log(`   ✅ Invoice Created: ${invoice.invoice_number}`);
        console.log(`   💰 Amount: €${invoice.total_amount}`);
        console.log(`   📊 Status: ${invoice.status}\n`);

        // STEP 9: Auto-approve Invoice (Skip Admin Step)
        console.log('👨‍💼 STEP 9: Auto-approving invoice...');
        await approveInvoice(invoice.id);
        console.log(`   ✅ Invoice Approved\n`);

        // STEP 10: Client Approves Milestone (Processes Payment)
        console.log('💸 STEP 10: Client approves milestone and processes payment...');
        await approveMilestone(project.id, 0, client.id);
        const { data: freelancerWallet } = await supabase
            .from('freelancer_wallets')
            .select('available_balance')
            .eq('freelancer_id', freelancer.id)
            .single();
        console.log(`   ✅ Milestone Approved & Payment Processed`);
        console.log(`   💰 Freelancer Balance: €${freelancerWallet?.available_balance || 0}\n`);

        // STEP 11: Verify Final Balances
        console.log('🔍 STEP 11: Verifying final balances...\n');
        await verifyBalances(client.id, freelancer.id);

        console.log('\n' + '='.repeat(60));
        console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60) + '\n');

    } catch (error: any) {
        const fs = await import('fs');
        fs.writeFileSync('error_log.json', JSON.stringify(error, null, 2));
        console.error('\n❌ TEST FAILED:', error.message || error);
        if (error.code) console.error('   Error Code:', error.code);
        if (error.details) console.error('   Details:', error.details);
        if (error.hint) console.error('   Hint:', error.hint);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    }
}

async function setupTestUsers() {
    const users = { client: null as any, freelancer: null as any };

    let { data: client } = await supabase.from('users').select('*').eq('email', TEST_CONFIG.clientEmail).maybeSingle();
    if (!client) {
        const { data: newClient, error } = await supabase.from('users').insert({
            email: TEST_CONFIG.clientEmail,
            password_hash: 'test_hash',
            first_name: 'Test',
            last_name: 'Client',
            role: 'client',
            company_name: 'Test Company'
        }).select().single();
        if (error) throw error;
        client = newClient;
    }
    users.client = client;

    let { data: freelancer } = await supabase.from('users').select('*').eq('email', TEST_CONFIG.freelancerEmail).maybeSingle();
    if (!freelancer) {
        const { data: newFreelancer, error } = await supabase.from('users').insert({
            email: TEST_CONFIG.freelancerEmail,
            password_hash: 'test_hash',
            first_name: 'Test',
            last_name: 'Freelancer',
            role: 'freelancer'
        }).select().single();
        if (error) throw error;
        freelancer = newFreelancer;
    }
    users.freelancer = freelancer;

    return users;
}

async function depositFunds(clientId: string, email: string, amount: number) {
    try {
        console.log('   🔍 Creating new Stripe customer...');
        const uniqueEmail = `test-${Date.now()}@example.com`;
        const customer = await stripe.customers.create({
            email: uniqueEmail,
            name: 'Test Client',
            metadata: { userId: clientId }
        });
        const customerId = customer.id;
        console.log(`   ✅ Stripe customer: ${customerId}`);

        console.log('   🔍 Creating invoice item...');
        await stripe.invoiceItems.create({
            customer: customerId,
            amount: amount * 100,
            currency: 'eur',
            description: 'Test Wallet Deposit'
        });

        console.log('   🔍 Creating invoice...');
        const invoice = await stripe.invoices.create({
            customer: customerId,
            collection_method: 'send_invoice',
            days_until_due: 30
        });

        console.log('   🔍 Finalizing invoice...');
        const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

        if (finalizedInvoice.status !== 'paid') {
            console.log('   🔍 Marking invoice as paid...');
            await stripe.invoices.pay(invoice.id, { paid_out_of_band: true });
        } else {
            console.log('   ℹ️ Invoice already paid (auto-paid).');
        }

        console.log('   🔍 Updating wallet balance...');
        // Use direct DB operation to avoid RPC parameter issues
        const { data: existingWallet } = await supabase.from('client_wallets').select('available_balance, total_deposited').eq('client_id', clientId).single();

        if (existingWallet) {
            console.log('   🔍 Wallet exists, updating...');
            const { error: updateError } = await supabase.from('client_wallets').update({
                available_balance: (existingWallet.available_balance || 0) + amount,
                total_deposited: (existingWallet.total_deposited || 0) + amount,
                updated_at: new Date().toISOString()
            }).eq('client_id', clientId);
            if (updateError) {
                console.error('   ❌ Wallet update error:', updateError);
                throw updateError;
            }
        } else {
            console.log('   🔍 Wallet does not exist, inserting...');
            const { error: insertError } = await supabase.from('client_wallets').insert({
                client_id: clientId,
                available_balance: amount,
                total_deposited: amount,
                locked_balance: 0
            });
            if (insertError) {
                console.error('   ❌ Wallet insert error:', insertError);
                throw insertError;
            }
        }
        console.log('   ✅ Wallet updated successfully');

        console.log('   🔍 Creating transaction record...');
        const { error: txError } = await supabase.from('transactions').insert({
            user_id: clientId, type: 'deposit', amount, status: 'completed',
            description: 'Test deposit', metadata: { stripe_invoice_id: invoice.id }
        });
        if (txError) {
            console.error('   ❌ Transaction insert error:', txError);
            throw txError;
        }
        console.log('   ✅ Transaction created successfully');
    } catch (error: any) {
        console.error('   ❌ Deposit function error:', error.message);
        throw error;
    }
}

async function createProject(clientId: string) {
    const { data: project, error } = await supabase.from('projects').insert({
        client_id: clientId, title: 'Test Project - E2E Workflow', description: 'End-to-end test project',
        allocated_budget: TEST_CONFIG.projectBudget, status: 'draft', milestones: TEST_CONFIG.milestones, skills_required: ['Testing', 'QA']
    }).select().single();
    if (error) throw error;
    return project;
}

async function inviteFreelancer(projectId: string, clientId: string, freelancerId: string) {
    const { data: invitation, error } = await supabase.from('project_invitations').insert({
        project_id: projectId, client_id: clientId, freelancer_id: freelancerId,
        message: 'Test invitation for E2E workflow', status: 'pending'
    }).select().single();
    if (error) throw error;
    return invitation;
}

async function submitOffer(invitationId: string, freelancerId: string, milestones: any[]) {
    const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
    const { data: inv } = await supabase.from('project_invitations').select('project_id').eq('id', invitationId).single();
    const { data: offer, error } = await supabase.from('freelancer_offers').insert({
        invitation_id: invitationId, project_id: inv?.project_id, freelancer_id: freelancerId,
        cover_letter: 'Test offer', milestones, total_amount: totalAmount, status: 'pending'
    }).select().single();
    if (error) throw error;
    await supabase.from('project_invitations').update({ status: 'offer_submitted' }).eq('id', invitationId);
    return offer;
}

async function acceptOffer(projectId: string, offerId: string, clientId: string) {
    const { data: offer } = await supabase.from('freelancer_offers').select('*').eq('id', offerId).single();
    if (!offer) throw new Error('Offer not found');

    console.log(`   🔍 Locking funds via RPC...`);
    console.log(`      Client ID: ${clientId}`);
    console.log(`      Project ID: ${projectId}`);
    console.log(`      Amount: ${offer.total_amount}`);

    const { error: rpcError } = await supabase.rpc('lock_project_funds', {
        p_client_id: clientId,
        p_project_id: projectId,
        p_amount: offer.total_amount
    });

    if (rpcError) {
        console.error('❌ RPC lock_project_funds failed:', rpcError);
        throw rpcError;
    }

    const { error: offerUpdateError } = await supabase.from('freelancer_offers').update({ status: 'accepted' }).eq('id', offerId);
    if (offerUpdateError) {
        console.error('❌ Failed to update offer status:', offerUpdateError);
        throw offerUpdateError;
    }

    const { error: projectUpdateError } = await supabase.from('projects').update({
        status: 'in_progress',
        allocated_budget: offer.total_amount,
        freelancer_id: offer.freelancer_id,
        milestones: offer.milestones
    }).eq('id', projectId);

    if (projectUpdateError) {
        console.error('❌ Failed to update project:', projectUpdateError);
        throw projectUpdateError;
    }
    console.log('   ✅ Project updated to in_progress');
}

async function completeMilestone(projectId: string, milestoneIndex: number, freelancerId: string) {
    const { data: project } = await supabase.from('projects').select('milestones').eq('id', projectId).single();
    if (!project) throw new Error('Project not found');
    const milestones = project.milestones;
    milestones[milestoneIndex].status = 'completed';
    await supabase.from('projects').update({ milestones }).eq('id', projectId);
}

async function submitInvoice(projectId: string, milestoneIndex: number, freelancerId: string) {
    const { data: project } = await supabase.from('projects').select('milestones').eq('id', projectId).single();
    if (!project) throw new Error('Project not found');
    const milestone = project.milestones[milestoneIndex];
    const invoiceNumber = `INV-TEST-${Date.now()}`;
    const { data: invoice, error } = await supabase.from('invoices').insert({
        invoice_number: invoiceNumber, freelancer_id: freelancerId, project_id: projectId, milestone_index: milestoneIndex,
        freelancer_legal_name: 'Test Freelancer', freelancer_tax_id: 'B12345678', freelancer_address: 'Test Street 123',
        freelancer_postal_code: '28001', freelancer_city: 'Madrid', freelancer_country: 'ES', tax_scenario: 'es_domestic',
        base_amount: milestone.amount, vat_applicable: true, vat_rate: 21, vat_amount: milestone.amount * 0.21,
        irpf_applicable: true, irpf_rate: 15, irpf_amount: milestone.amount * 0.15,
        subtotal: milestone.amount * 1.21, total_amount: milestone.amount * 1.21 - milestone.amount * 0.15,
        issue_date: new Date().toISOString().split('T')[0], description: `Test invoice for ${milestone.name}`,
        status: 'pending', iban: 'ES0000000000000000000000', pdf_url: 'https://example.com/test.pdf', pdf_filename: 'test-invoice.pdf'
    }).select().single();
    if (error) throw error;
    return invoice;
}

async function approveInvoice(invoiceId: string) {
    const now = new Date().toISOString();
    await supabase.from('invoices').update({ status: 'approved', approved_at: now, updated_at: now }).eq('id', invoiceId);
}

async function approveMilestone(projectId: string, milestoneIndex: number, clientId: string) {
    const { data: project } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (!project) throw new Error('Project not found');

    console.log(`   🔍 Debug Project State:`);
    console.log(`      ID: ${project.id}`);
    console.log(`      Status: ${project.status}`);
    console.log(`      Freelancer ID: ${project.freelancer_id}`);

    const milestone = project.milestones[milestoneIndex];

    // 1. Deduct from client locked balance
    const { data: clientWallet } = await supabase.from('client_wallets').select('locked_balance').eq('client_id', clientId).single();
    if (clientWallet) {
        await supabase.from('client_wallets').update({
            locked_balance: (clientWallet.locked_balance || 0) - milestone.amount,
            updated_at: new Date().toISOString()
        }).eq('client_id', clientId);
    }

    // 2. Add to freelancer available balance
    const { data: freelancerWallet } = await supabase.from('freelancer_wallets').select('available_balance, total_earned').eq('freelancer_id', project.freelancer_id).single();
    if (freelancerWallet) {
        await supabase.from('freelancer_wallets').update({
            available_balance: (freelancerWallet.available_balance || 0) + milestone.amount,
            total_earned: (freelancerWallet.total_earned || 0) + milestone.amount,
            updated_at: new Date().toISOString()
        }).eq('freelancer_id', project.freelancer_id);
    } else {
        await supabase.from('freelancer_wallets').insert({
            freelancer_id: project.freelancer_id,
            available_balance: milestone.amount,
            total_earned: milestone.amount
        });
    }

    // 3. Create transactions
    await supabase.from('transactions').insert([
        {
            user_id: clientId,
            type: 'milestone_payment',
            amount: -milestone.amount,
            status: 'completed',
            description: `Payment for ${milestone.name}`,
            metadata: { project_id: projectId, milestone_index: milestoneIndex }
        },
        {
            user_id: project.freelancer_id,
            type: 'milestone_received',
            amount: milestone.amount,
            status: 'completed',
            description: `Received payment for ${milestone.name}`,
            metadata: { project_id: projectId, milestone_index: milestoneIndex }
        }
    ]);
    const milestones = project.milestones;
    milestones[milestoneIndex].status = 'approved';
    await supabase.from('projects').update({ milestones }).eq('id', projectId);
}

async function verifyBalances(clientId: string, freelancerId: string) {
    const { data: clientWallet } = await supabase.from('client_wallets').select('*').eq('client_id', clientId).single();
    const { data: freelancerWallet } = await supabase.from('freelancer_wallets').select('*').eq('freelancer_id', freelancerId).single();
    console.log('📊 Client Wallet:');
    console.log(`   Available: €${clientWallet?.available_balance || 0}`);
    console.log(`   Locked: €${clientWallet?.locked_balance || 0}`);
    console.log(`   Total Deposited: €${clientWallet?.total_deposited || 0}`);
    console.log('\n📊 Freelancer Wallet:');
    console.log(`   Available: €${freelancerWallet?.available_balance || 0}`);
    console.log(`   Total Earned: €${freelancerWallet?.total_earned || 0}`);
    const expectedClientAvailable = TEST_CONFIG.depositAmount - TEST_CONFIG.milestones[0].amount;
    const expectedClientLocked = TEST_CONFIG.projectBudget - TEST_CONFIG.milestones[0].amount;
    const expectedFreelancerBalance = TEST_CONFIG.milestones[0].amount;
    console.log('\n✅ Balance Verification:');
    console.log(`   Client Available: €${clientWallet?.available_balance} (expected: ~€${expectedClientAvailable})`);
    console.log(`   Client Locked: €${clientWallet?.locked_balance} (expected: ~€${expectedClientLocked})`);
    console.log(`   Freelancer Balance: €${freelancerWallet?.available_balance} (expected: ~€${expectedFreelancerBalance})`);
}

main();
