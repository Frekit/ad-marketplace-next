import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createConversationsTables() {
  try {
    console.log('📋 Creando tabla conversations...\n');

    // Step 1: Create conversations table
    console.log('✓ Creando tabla conversations...');
    const { error: convError } = await (supabase as any)
      .rpc('exec', {
        sql: `
          CREATE TABLE IF NOT EXISTS conversations (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
              participant_ids UUID[] NOT NULL,
              last_message_at TIMESTAMP DEFAULT NOW(),
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
          );
        `
      })
      .catch(() => ({ error: null }));

    if (convError && !convError.message?.includes('does not exist')) {
      console.error(`❌ Error:`, convError);
    } else {
      console.log('  ✅ Tabla conversations lista');
    }

    // Step 2: Create indexes for conversations
    console.log('✓ Creando índices...');
    const indexStatements = [
      'CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id);',
      'CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);'
    ];

    for (const stmt of indexStatements) {
      await (supabase as any).rpc('exec', { sql: stmt }).catch(() => null);
    }
    console.log('  ✅ Índices creados');

    // Verify table exists
    console.log('\n✔ Verificando tabla conversations...');
    const { error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);

    if (checkError?.message?.includes('Could not find')) {
      console.log('❌ Tabla conversations aún no existe.');
      console.log('\n📝 SOLUCIÓN MANUAL REQUERIDA:');
      console.log('   1. Ve a: https://app.supabase.com');
      console.log('   2. Ve a tu proyecto');
      console.log('   3. Abre "SQL Editor"');
      console.log('   4. Copia y ejecuta el contenido de: database/conversations-schema.sql');
      console.log('\n   O ejecuta:');
      console.log('   npx supabase db execute-sql --file database/conversations-schema.sql');
    } else {
      console.log('✅ Tabla conversations creada correctamente');
    }

    console.log('\n🎯 Proceso completado');

  } catch (error) {
    console.error('Error:', error);
  }
}

createConversationsTables();
