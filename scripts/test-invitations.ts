import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL or SERVICE_ROLE_KEY not found in environment');
  console.error('supabaseUrl:', supabaseUrl);
  console.error('supabaseKey:', supabaseKey?.slice(0, 20) + '...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  try {
    console.log('🔍 Buscando usuarios...');

    // Get freelancer user
    const { data: freelancerData, error: freelancerError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', 'alvarovi24@gmail.com')
      .single();

    if (freelancerError) {
      console.error('Error finding freelancer:', freelancerError);
      return;
    }

    console.log('✅ Freelancer encontrado:', {
      id: freelancerData.id,
      email: freelancerData.email,
      role: freelancerData.role
    });

    // Get client user
    const { data: clientData, error: clientError } = await supabase
      .from('users')
      .select('id, email, role')
      .eq('email', 'alvaroromero@fluvip.com')
      .single();

    if (clientError) {
      console.error('Error finding client:', clientError);
      return;
    }

    console.log('✅ Cliente encontrado:', {
      id: clientData.id,
      email: clientData.email,
      role: clientData.role
    });

    const freelancerId = freelancerData.id;
    const clientId = clientData.id;

    // Get a project from this client
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('id, title, client_id')
      .eq('client_id', clientId)
      .limit(1);

    if (projectsError || !projectsData || projectsData.length === 0) {
      console.error('No projects found for this client');
      return;
    }

    const projectId = projectsData[0].id;
    console.log('✅ Proyecto encontrado:', projectId, projectsData[0].title);

    // Delete all existing invitations
    console.log('\n🗑️ Borrando todas las invitaciones existentes...');
    const { error: deleteError } = await supabase
      .from('invitations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('Error deleting invitations:', deleteError);
      return;
    }

    const { count } = await supabase
      .from('invitations')
      .select('id', { count: 'exact', head: true });

    console.log('✅ Invitaciones borradas. Conteo actual:', count);

    // Create 3 new invitations
    console.log('\n➕ Creando 3 nuevas invitaciones...\n');

    const invitations = [
      {
        project_id: projectId,
        freelancer_id: freelancerId,
        client_id: clientId,
        message: 'Invitación 1: Proyecto pequeño',
        status: 'pending',
        estimated_days: 5,
        hourly_rate: 50,
        suggested_milestones: [
          { name: 'Hito 1', description: 'Primer entregable', amount: 125, due_date: '2025-01-15' },
          { name: 'Hito 2', description: 'Segundo entregable', amount: 125, due_date: '2025-01-30' }
        ]
      },
      {
        project_id: projectId,
        freelancer_id: freelancerId,
        client_id: clientId,
        message: 'Invitación 2: Proyecto mediano',
        status: 'pending',
        estimated_days: 10,
        hourly_rate: 60,
        suggested_milestones: [
          { name: 'Fase 1', description: 'Análisis y diseño', amount: 300, due_date: '2025-01-20' },
          { name: 'Fase 2', description: 'Desarrollo', amount: 300, due_date: '2025-02-10' },
          { name: 'Fase 3', description: 'Testing y deployment', amount: 300, due_date: '2025-02-28' }
        ]
      },
      {
        project_id: projectId,
        freelancer_id: freelancerId,
        client_id: clientId,
        message: 'Invitación 3: Proyecto grande',
        status: 'pending',
        estimated_days: 20,
        hourly_rate: 75,
        suggested_milestones: [
          { name: 'Requisitos', description: 'Definición de requisitos', amount: 375, due_date: '2025-01-25' },
          { name: 'Arquitectura', description: 'Diseño arquitectónico', amount: 375, due_date: '2025-02-10' },
          { name: 'Implementación', description: 'Desarrollo completo', amount: 375, due_date: '2025-03-10' },
          { name: 'Deployment', description: 'Despliegue a producción', amount: 375, due_date: '2025-03-20' }
        ]
      }
    ];

    for (let i = 0; i < invitations.length; i++) {
      const { data, error } = await supabase
        .from('invitations')
        .insert(invitations[i])
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creando invitación ${i + 1}:`, error);
      } else {
        const totalBudget = invitations[i].estimated_days * invitations[i].hourly_rate;
        console.log(`✅ Invitación ${i + 1} creada:`);
        console.log(`   - ID: ${data.id}`);
        console.log(`   - Jornadas: ${invitations[i].estimated_days}`);
        console.log(`   - Tarifa: €${invitations[i].hourly_rate}/día`);
        console.log(`   - Presupuesto total: €${totalBudget}`);
        console.log(`   - Hitos: ${invitations[i].suggested_milestones.length}`);
        console.log();
      }
    }

    console.log('✅ ¡Proceso completado!');
    console.log('\n📝 Ahora puedes acceder a las invitaciones en:');
    console.log('   http://localhost:3001/freelancer/proposals');

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
