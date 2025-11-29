import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const testUsers = [
    {
        email: 'sarah.johnson@example.com',
        password_hash: 'test_hash_sarah',
        first_name: 'Sarah',
        last_name: 'Johnson',
        role: 'freelancer',
        profile: {
            bio: 'Experienced social media manager specializing in Instagram and TikTok growth strategies. 5+ years helping brands increase engagement.',
            skills: ['Social Media Marketing', 'Instagram', 'TikTok', 'Content Strategy', 'Analytics'],
            hourly_rate: 45,
            availability: 'available',
            rating: 4.8,
            total_jobs: 23
        }
    },
    {
        email: 'mike.chen@example.com',
        password_hash: 'test_hash_mike',
        first_name: 'Mike',
        last_name: 'Chen',
        role: 'freelancer',
        profile: {
            bio: 'Google Ads certified specialist with proven track record of reducing CPA by 40% on average. Expert in search and display campaigns.',
            skills: ['Google Ads', 'PPC', 'SEM', 'Analytics', 'Campaign Optimization'],
            hourly_rate: 60,
            availability: 'available',
            rating: 4.9,
            total_jobs: 45
        }
    },
    {
        email: 'emma.davis@example.com',
        password_hash: 'test_hash_emma',
        first_name: 'Emma',
        last_name: 'Davis',
        role: 'freelancer',
        profile: {
            bio: 'Creative content writer and SEO specialist. Helping businesses rank higher and convert better through strategic content.',
            skills: ['SEO', 'Content Writing', 'Copywriting', 'Blog Writing', 'Keyword Research'],
            hourly_rate: 40,
            availability: 'busy',
            rating: 4.7,
            total_jobs: 31
        }
    }
];

async function seedTestUsers() {
    console.log('🌱 Seeding test users...\n');

    for (const user of testUsers) {
        try {
            // Check if user already exists
            const { data: existing } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', user.email)
                .single();

            if (existing) {
                console.log(`✅ User already exists: ${user.email} (${existing.id})`);
                continue;
            }

            // Create user
            const { data: newUser, error: userError } = await supabase
                .from('users')
                .insert({
                    email: user.email,
                    password_hash: user.password_hash,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role
                })
                .select()
                .single();

            if (userError) {
                console.error(`❌ Error creating user ${user.email}:`, userError.message);
                continue;
            }

            console.log(`✅ Created user: ${user.email} (${newUser.id})`);

            // Create freelancer profile if role is freelancer
            if (user.role === 'freelancer' && user.profile) {
                const { error: profileError } = await supabase
                    .from('freelancer_profiles')
                    .insert({
                        user_id: newUser.id,
                        bio: user.profile.bio,
                        skills: user.profile.skills,
                        hourly_rate: user.profile.hourly_rate,
                        availability: user.profile.availability,
                        rating: user.profile.rating,
                        total_jobs: user.profile.total_jobs
                    });

                if (profileError) {
                    console.error(`❌ Error creating profile for ${user.email}:`, profileError.message);
                } else {
                    console.log(`   ✅ Created freelancer profile for ${user.email}`);
                }
            }

            console.log('');
        } catch (error: any) {
            console.error(`❌ Unexpected error for ${user.email}:`, error.message);
        }
    }

    console.log('\n🎉 Seeding complete!\n');
}

seedTestUsers().catch(console.error);
