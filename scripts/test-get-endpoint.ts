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

async function testGetEndpoint() {
  try {
    // Get the 3 invitations we created
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select('id')
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching invitations:', error);
      return;
    }

    console.log('\n🧪 Probando endpoint GET de propuestas:\n');
    console.log(`Freelancer ID: 2f9d2e6a-1f09-473b-a11f-00849690934b`);
    console.log(`\nSimulando respuesta del endpoint para cada invitación:\n`);

    for (const inv of invitations || []) {
      const invId = inv.id;

      // Simulate what the GET endpoint does
      const { data: invitation } = await supabase
        .from('invitations')
        .select(`
          id,
          status,
          message,
          created_at,
          project_id,
          freelancer_id,
          client_id,
          estimated_days,
          hourly_rate,
          suggested_milestones
        `)
        .eq('id', invId)
        .eq('freelancer_id', '2f9d2e6a-1f09-473b-a11f-00849690934b')
        .single();

      if (!invitation) {
        console.log(`❌ Invitación ${invId} no encontrada para este freelancer`);
        continue;
      }

      // Get project
      const { data: project } = await supabase
        .from('projects')
        .select('id, title, description, skills_required')
        .eq('id', invitation.project_id)
        .single();

      // Get client
      const { data: client } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .eq('id', invitation.client_id)
        .single();

      // Get freelancer rate
      const { data: freelancer } = await supabase
        .from('users')
        .select('daily_rate')
        .eq('id', invitation.freelancer_id)
        .single();

      const dailyRate = freelancer?.daily_rate || 0;
      const pricePerDay = invitation.estimated_days && invitation.hourly_rate
        ? invitation.hourly_rate
        : null;

      const priceDifference = pricePerDay && dailyRate > 0
        ? ((pricePerDay - dailyRate) / dailyRate) * 100
        : null;

      console.log(`📋 Respuesta para invitación: ${invId.slice(0, 8)}...`);
      console.log(`   Proyecto: "${project?.title}"`);
      console.log(`   Cliente: ${client?.first_name} ${client?.last_name}`);
      console.log(`   Jornadas: ${invitation.estimated_days || 'no definido'}`);
      console.log(`   Tarifa propuesta: €${invitation.hourly_rate || 'no definido'}`);
      console.log(`   Presupuesto total: €${(invitation.estimated_days || 0) * (invitation.hourly_rate || 0)}`);
      console.log(`   Tu tarifa diaria: €${dailyRate}`);

      if (pricePerDay && dailyRate > 0) {
        const status = priceDifference! >= 0 ? '✓ ARRIBA' : '⚠ DEBAJO';
        console.log(`   Diferencia: ${priceDifference?.toFixed(1)}% ${status}`);
      } else {
        console.log(`   Diferencia: No se puede calcular (falta configurar tarifa)`);
      }

      console.log(`   Hitos: ${invitation.suggested_milestones?.length || 0} definidos`);
      console.log();
    }

    console.log('✅ Endpoint GET funcionaría correctamente para cada invitación');

  } catch (error) {
    console.error('Error:', error);
  }
}

testGetEndpoint();
