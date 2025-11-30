import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import * as bcrypt from 'bcryptjs';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
    const adminEmail = 'admin@admarket.com';
    const adminPassword = 'Admin123!'; // Cambia esto después del primer login

    console.log('🔐 Creating admin user...');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login\n');

    try {
        // Check if admin already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id, email, role')
            .eq('email', adminEmail)
            .single();

        if (existingUser) {
            console.log('✅ Admin user already exists!');
            console.log(`   Email: ${existingUser.email}`);
            console.log(`   Role: ${existingUser.role}`);

            if (existingUser.role !== 'admin') {
                console.log('\n🔄 Updating role to admin...');
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ role: 'admin' })
                    .eq('id', existingUser.id);

                if (updateError) {
                    console.error('❌ Error updating role:', updateError.message);
                } else {
                    console.log('✅ Role updated to admin!');
                }
            }
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(adminPassword, 10);

        // Create admin user
        const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
                email: adminEmail,
                password_hash: passwordHash,
                first_name: 'Admin',
                last_name: 'User',
                role: 'admin',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (createError) {
            console.error('❌ Error creating admin user:', createError.message);
            return;
        }

        console.log('✅ Admin user created successfully!');
        console.log(`   ID: ${newUser.id}`);
        console.log(`   Email: ${newUser.email}`);
        console.log(`   Role: ${newUser.role}`);
        console.log('\n📝 Credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('\n🌐 Access admin panel at: /admin/dashboard');

    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
    }
}

createAdminUser().catch(console.error);
