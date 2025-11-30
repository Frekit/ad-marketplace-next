import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    console.log('🔧 Creando tablas de conversación...');

    // Create conversations table
    const { error: convError } = await (supabase as any)
      .from('_temp_setup')
      .select()
      .then(async () => {
        // If this succeeds, table exists. If fails, we'll create it.
        return { error: null };
      })
      .catch(async (err: any) => {
        // Create the table using raw SQL via postgres
        const sql = `
          CREATE TABLE IF NOT EXISTS conversations (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
              participant_ids UUID[] NOT NULL,
              last_message_at TIMESTAMP DEFAULT NOW(),
              created_at TIMESTAMP DEFAULT NOW(),
              updated_at TIMESTAMP DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id);
          CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

          CREATE TABLE IF NOT EXISTS conversation_messages (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
              sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              content TEXT NOT NULL,
              created_at TIMESTAMP DEFAULT NOW(),
              read_at TIMESTAMP
          );

          CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id);
          CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender ON conversation_messages(sender_id);
          CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at);
        `;

        // Use the admin client to execute SQL
        const adminClient = createClient();
        try {
          // Try using the PostgreSQL admin API
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
            },
            body: JSON.stringify({ sql })
          });

          if (response.ok) {
            return { error: null };
          } else {
            const text = await response.text();
            return { error: new Error(`SQL execution failed: ${text}`) };
          }
        } catch (e) {
          return { error: e };
        }
      });

    // Verify tables exist
    const { error: checkError } = await supabase
      .from('conversations')
      .select('id')
      .limit(1);

    if (checkError?.message?.includes('Could not find')) {
      return NextResponse.json({
        success: false,
        error: 'Tabla conversations aún no existe. Debes ejecutar el SQL manualmente en Supabase.'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tablas creadas correctamente'
    });

  } catch (error: any) {
    console.error('Error creando tablas:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Error creando tablas'
    }, { status: 500 });
  }
}
