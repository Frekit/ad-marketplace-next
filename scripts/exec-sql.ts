import * as fs from 'fs';
import * as path from 'path';

// Read the SQL file
const sqlPath = path.resolve(process.cwd(), 'database/conversations-schema.sql');
const sql = fs.readFileSync(sqlPath, 'utf-8');

console.log('📋 SQL a ejecutar en Supabase SQL Editor:\n');
console.log('=' .repeat(80));
console.log(sql);
console.log('=' .repeat(80));

console.log('\n📝 Instrucciones:');
console.log('1. Ve a https://app.supabase.com');
console.log('2. Selecciona tu proyecto');
console.log('3. Ve a "SQL Editor" en el panel izquierdo');
console.log('4. Haz click en "+ New Query"');
console.log('5. Copia y pega el SQL anterior');
console.log('6. Haz click en "Run"');
console.log('\nO ejecuta este comando:');
console.log('npx supabase db execute-sql --file database/conversations-schema.sql');
