const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTables() {
  console.log('📋 Creando tablas de conversación...\n');

  try {
    // Create conversations table
    console.log('1. Creando tabla conversations...');
    const { error: err1 } = await supabase.from('conversations').select('id').limit(1).catch(() => ({error: {message: 'table not found'}}));
    
    if (err1?.message?.includes('Could not find')) {
      // Table doesn't exist, create it
      const createConvSql = `
        CREATE TABLE conversations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
            participant_ids UUID[] NOT NULL,
            last_message_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
        CREATE INDEX idx_conversations_project ON conversations(project_id);
        CREATE INDEX idx_conversations_created_at ON conversations(created_at);
      `;

      console.log('   Tabla no existe. Necesita ser creada manualmente.');
    } else {
      console.log('   ✅ Tabla conversations existe');
    }

    // Check conversation_messages table
    console.log('\n2. Creando tabla conversation_messages...');
    const { error: err2 } = await supabase.from('conversation_messages').select('id').limit(1).catch(() => ({error: {message: 'table not found'}}));
    
    if (err2?.message?.includes('Could not find')) {
      console.log('   Tabla no existe. Necesita ser creada manualmente.');
    } else {
      console.log('   ✅ Tabla conversation_messages existe');
    }

    console.log('\n⚠️ Las tablas necesitan crearse manualmente en Supabase SQL Editor.');
    console.log('\nSQL a ejecutar:\n');
    const sql = fs.readFileSync(path.join(__dirname, 'database/conversations-schema.sql'), 'utf-8');
    console.log('='.repeat(80));
    console.log(sql);
    console.log('='.repeat(80));

  } catch (error) {
    console.error('Error:', error);
  }
}

createTables();
