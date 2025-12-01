const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkInvitations() {
  console.log('Verificando tabla invitations...\n');

  try {
    const { data, error } = await supabase
      .from('invitations')
      .select('id, freelancer_id, client_id, project_id, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.log('Error:', error.message);
      return;
    }

    const count = data ? data.length : 0;
    console.log('Total de invitations: ' + count + '\n');

    if (data && data.length > 0) {
      data.forEach((inv, idx) => {
        console.log('[' + (idx + 1) + '] ID: ' + inv.id);
        console.log('    Freelancer: ' + inv.freelancer_id);
        console.log('    Client: ' + inv.client_id);
        console.log('    Project: ' + inv.project_id);
        console.log('    Status: ' + inv.status);
        console.log('    Created: ' + inv.created_at + '\n');
      });
    } else {
      console.log('No hay invitations en la tabla');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkInvitations();
