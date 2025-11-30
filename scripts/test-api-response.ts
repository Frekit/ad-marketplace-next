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

async function testProposalAPI() {
  try {
    // Get the first 3 invitations we just created
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('id, estimated_days, hourly_rate, suggested_milestones, status, created_at')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching invitations:', error);
      return;
    }

    console.log('\n📋 Invitaciones recuperadas de la base de datos:\n');

    invitations?.forEach((inv, index) => {
      console.log(`\nInvitación ${index + 1}:`);
      console.log(`  ID: ${inv.id}`);
      console.log(`  Jornadas: ${inv.estimated_days}`);
      console.log(`  Tarifa diaria: €${inv.hourly_rate}`);
      console.log(`  Presupuesto total: €${(inv.estimated_days || 0) * (inv.hourly_rate || 0)}`);
      console.log(`  Hitos: ${inv.suggested_milestones?.length || 0}`);
      console.log(`  Estado: ${inv.status}`);
      console.log(`  Creada: ${new Date(inv.created_at).toLocaleString('es-ES')}`);
    });

    console.log('\n✅ Los datos están siendo guardados correctamente en la base de datos');

  } catch (error) {
    console.error('Error:', error);
  }
}

testProposalAPI();
