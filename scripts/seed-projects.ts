import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables:');
    if (!supabaseUrl) console.error('   - NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseServiceKey) console.error('   - SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedProjects() {
    console.log('🌱 Seeding projects...\n');

    try {
        // First, get a client user to assign projects to
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('role', 'client')
            .limit(1);

        if (userError) throw userError;

        if (!users || users.length === 0) {
            console.log('❌ No client users found. Please create a client user first.');
            console.log('You can register at: http://localhost:3000/sign-up/client');
            return;
        }

        const clientId = users[0].id;
        console.log(`✅ Found client user: ${users[0].email} (${clientId})\n`);

        // Check client's wallet balance
        const { data: wallet } = await supabase
            .from('wallets')
            .select('balance')
            .eq('user_id', clientId)
            .single();

        const currentBalance = wallet?.balance || 0;
        console.log(`💰 Current wallet balance: €${currentBalance}\n`);

        // Sample projects
        const projects = [
            {
                client_id: clientId,
                title: 'Facebook Ads Campaign Q4 2024',
                description: 'Need an experienced Facebook Ads specialist to run our Q4 holiday campaign. Focus on e-commerce conversions and ROAS optimization.',
                skills_required: ['Facebook Ads', 'Instagram Ads', 'Social Media Marketing', 'E-commerce'],
                allocated_budget: 500,
                status: 'draft',
                milestones: [
                    {
                        name: 'Campaign Strategy & Setup',
                        description: 'Create campaign strategy, audience research, and initial ad setup',
                        amount: 150,
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
                        order_index: 1,
                        status: 'pending'
                    },
                    {
                        name: 'Campaign Launch & Optimization',
                        description: 'Launch campaigns and optimize based on performance data',
                        amount: 200,
                        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
                        order_index: 2,
                        status: 'pending'
                    },
                    {
                        name: 'Reporting & Analysis',
                        description: 'Comprehensive campaign report with insights and recommendations',
                        amount: 150,
                        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
                        order_index: 3,
                        status: 'pending'
                    }
                ]
            },
            {
                client_id: clientId,
                title: 'Google Ads PPC Optimization',
                description: 'Looking for a Google Ads expert to optimize our existing PPC campaigns and improve conversion rates.',
                skills_required: ['Google Ads', 'PPC', 'SEM', 'Analytics'],
                allocated_budget: 400,
                status: 'draft',
                milestones: [
                    {
                        name: 'Account Audit',
                        description: 'Complete audit of existing Google Ads account and campaigns',
                        amount: 100,
                        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        order_index: 1,
                        status: 'pending'
                    },
                    {
                        name: 'Campaign Restructuring',
                        description: 'Restructure campaigns based on audit findings',
                        amount: 150,
                        due_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        order_index: 2,
                        status: 'pending'
                    },
                    {
                        name: 'Ongoing Optimization',
                        description: 'Two weeks of daily optimization and monitoring',
                        amount: 150,
                        due_date: new Date(Date.now() + 26 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        order_index: 3,
                        status: 'pending'
                    }
                ]
            },
            {
                client_id: clientId,
                title: 'LinkedIn B2B Lead Generation',
                description: 'Need help setting up and managing LinkedIn ad campaigns for B2B lead generation.',
                skills_required: ['LinkedIn Ads', 'B2B Marketing', 'Lead Generation'],
                allocated_budget: 350,
                status: 'draft',
                milestones: [
                    {
                        name: 'Strategy Development',
                        description: 'Develop LinkedIn ad strategy and targeting plan',
                        amount: 100,
                        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        order_index: 1,
                        status: 'pending'
                    },
                    {
                        name: 'Campaign Setup & Launch',
                        description: 'Create and launch LinkedIn ad campaigns',
                        amount: 150,
                        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        order_index: 2,
                        status: 'pending'
                    },
                    {
                        name: 'Lead Nurturing Setup',
                        description: 'Set up lead nurturing workflows and reporting',
                        amount: 100,
                        due_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        order_index: 3,
                        status: 'pending'
                    }
                ]
            }
        ];

        // Check if we have enough balance
        const totalBudget = projects.reduce((sum, p) => sum + p.allocated_budget, 0);
        if (currentBalance < totalBudget) {
            console.log(`⚠️  Warning: Wallet balance (€${currentBalance}) is less than total project budgets (€${totalBudget})`);
            console.log(`You may need to add funds to your wallet to create all projects.\n`);
        }

        // Insert projects
        for (const project of projects) {
            console.log(`📝 Creating project: "${project.title}"...`);

            const { milestones, ...projectData } = project;

            const { data: createdProject, error: projectError } = await supabase
                .from('projects')
                .insert(projectData)
                .select()
                .single();

            if (projectError) {
                console.error(`❌ Error creating project: ${projectError.message}`);
                continue;
            }

            console.log(`   ✅ Project created with ID: ${createdProject.id}`);

            // Insert milestones
            const milestonesWithProjectId = milestones.map(m => ({
                ...m,
                project_id: createdProject.id
            }));

            const { error: milestonesError } = await supabase
                .from('milestones')
                .insert(milestonesWithProjectId);

            if (milestonesError) {
                console.error(`   ❌ Error creating milestones: ${milestonesError.message}`);
            } else {
                console.log(`   ✅ Created ${milestones.length} milestones`);
            }

            console.log('');
        }

        console.log('✨ Seeding complete!\n');
        console.log('You can now:');
        console.log('1. View projects at: http://localhost:3000/dashboard/client');
        console.log('2. Browse freelancers at: http://localhost:3000/freelancers');
        console.log('3. Send invitations to freelancers for these projects\n');

    } catch (error: any) {
        console.error('❌ Error seeding projects:', error.message);
        process.exit(1);
    }
}

seedProjects();
