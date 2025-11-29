import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function executeSQLFile(filePath: string) {
    console.log(`\n📄 Executing ${path.basename(filePath)}...`);

    try {
        const sql = fs.readFileSync(filePath, 'utf-8');

        // Split by semicolons and execute each statement
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--'));

        for (const statement of statements) {
            if (statement.trim()) {
                const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

                if (error) {
                    // Try direct execution if RPC fails
                    console.log('   Trying direct execution...');
                    const response = await fetch(
                        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
                                'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`
                            },
                            body: JSON.stringify({ sql_query: statement })
                        }
                    );

                    if (!response.ok) {
                        console.log(`   ⚠️  Warning: ${error.message}`);
                    }
                }
            }
        }

        console.log(`   ✅ Completed ${path.basename(filePath)}`);
    } catch (error: any) {
        console.error(`   ❌ Error in ${path.basename(filePath)}:`, error.message);
    }
}

async function setupDatabase() {
    console.log('🚀 Setting up database schema...\n');
    console.log('⚠️  NOTE: This script requires direct SQL execution.');
    console.log('   Please run the SQL files manually in Supabase SQL Editor:\n');
    console.log('   1. Go to https://app.supabase.com');
    console.log('   2. Select your project');
    console.log('   3. Go to SQL Editor');
    console.log('   4. Create a new query and paste the contents of each file:\n');

    const schemaFiles = [
        'database/schema.sql',
        'database/wallet-schema.sql',
        'database/projects-schema.sql',
        'database/freelancer-schema.sql',
        'database/billing-schema.sql',
        'supabase/migrations/005_create_invoices_table.sql'
    ];

    for (const file of schemaFiles) {
        const filePath = path.join(process.cwd(), file);
        if (fs.existsSync(filePath)) {
            console.log(`   📄 ${file}`);
        }
    }

    console.log('\n💡 TIP: You can copy and paste all SQL files at once in the SQL Editor.');
    console.log('   Make sure to run them in the order listed above.');
    console.log('   ⭐ IMPORTANT: Run the invoice migration (005_create_invoices_table.sql) last!\n');
}

setupDatabase();
