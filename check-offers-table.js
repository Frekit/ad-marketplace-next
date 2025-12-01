const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTable() {
  console.log('Verificando tabla freelancer_offers...\n');

  try {
    // Try to get schema info
    const { data, error } = await supabase
      .from('freelancer_offers')
      .select('*')
      .limit(1);

    if (error) {
      console.log('Error:', error.message);
      console.log('\nProbemos con una tabla vacía...');
      
      const { data: empty, error: emptyError } = await supabase
        .from('freelancer_offers')
        .select('count', { count: 'exact', head: true });

      console.log('Count result:', { empty, emptyError });
    } else {
      console.log('Tabla accesible');
      console.log('Registros encontrados:', data?.length || 0);
      if (data && data.length > 0) {
        console.log('Columnas:', Object.keys(data[0]));
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkTable();
