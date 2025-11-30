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

async function checkConversationsTable() {
  try {
    console.log('\n🔍 Verificando tabla "conversations"...\n');

    // Try to query the conversations table
    const { data, error, status } = await supabase
      .from('conversations')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Error al acceder a la tabla conversations:');
      console.log('   Error:', error.message);
      console.log('   Code:', error.code);
      console.log('\n📋 Esto significa que la tabla "conversations" probablemente no existe o tiene permiso de acceso denegado.');
      return;
    }

    console.log('✅ Tabla conversations existe y es accesible');
    console.log(`   Registros encontrados: ${data?.length || 0}`);

    if (data && data.length > 0) {
      console.log('\n📊 Estructura del primer registro:');
      const firstRecord = data[0];
      Object.keys(firstRecord).forEach(key => {
        console.log(`   - ${key}: ${typeof firstRecord[key]}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkConversationsTable();
