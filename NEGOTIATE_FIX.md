# 🐛 Problema: "Failed to create conversation" al Negociar

## Problema Identificado

Al hacer clic en **"Negociar"** en una propuesta, se obtiene el error:
```
Failed to create conversation
```

## Causa Raíz

La tabla **`conversations`** no existe en la base de datos de Supabase.

El endpoint `/api/freelancer/proposals/[id]/negotiate/route.ts` intenta crear una conversación para la negociación, pero la tabla no está en el schema de la base de datos.

```
Error: Could not find the table 'public.conversations' in the schema cache
Code: PGRST205
```

---

## 🔧 Solución

### Paso 1: Ejecutar el SQL en Supabase

Ve a **SQL Editor** en tu proyecto Supabase y ejecuta este SQL:

```sql
-- Create conversations table for project negotiations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    participant_ids UUID[] NOT NULL,  -- Array of two user IDs
    last_message_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create index on project_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Create messages table for conversation messages
CREATE TABLE IF NOT EXISTS conversation_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    read_at TIMESTAMP
);

-- Create index on conversation_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id);

-- Create index on sender_id for user messages
CREATE INDEX IF NOT EXISTS idx_conversation_messages_sender ON conversation_messages(sender_id);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_conversation_messages_created_at ON conversation_messages(created_at);
```

### Paso 2: Verificar que se creó correctamente

Ejecuta:
```bash
npx tsx scripts/check-conversations-table.ts
```

Deberías ver:
```
✅ Tabla conversations existe y es accesible
   Registros encontrados: 0
```

### Paso 3: Probar nuevamente

Ahora cuando hagas clic en "Negociar", debería:
1. ✅ Crear una conversación automáticamente
2. ✅ Redirigirte a la página de conversación
3. ✅ Permitir enviar mensajes al cliente

---

## 📊 Qué se creó

### Tabla `conversations`
- `id`: UUID, clave primaria
- `project_id`: Referencia al proyecto siendo negociado
- `participant_ids`: Array de 2 UUIDs (freelancer y cliente)
- `last_message_at`: Timestamp del último mensaje
- `created_at`: Timestamp de creación
- `updated_at`: Timestamp de última actualización

### Tabla `conversation_messages`
- `id`: UUID, clave primaria
- `conversation_id`: Referencia a la conversación
- `sender_id`: Quién envió el mensaje
- `content`: El contenido del mensaje
- `created_at`: Cuándo fue enviado
- `read_at`: Cuándo fue leído (null si no ha sido leído)

---

## ✅ Checklist Después de la Solución

- [ ] Ejecuté el SQL en el SQL Editor de Supabase
- [ ] Verifiqué con el script que las tablas existen
- [ ] Probé hacer clic en "Negociar" en una propuesta
- [ ] Se redirigió correctamente a la conversación
- [ ] Puedo enviar mensajes en la conversación

---

## 🔍 Archivos Relacionados

- `src/app/api/freelancer/proposals/[id]/negotiate/route.ts` - Endpoint que crea la conversación
- `database/conversations-schema.sql` - El schema SQL a ejecutar
- `scripts/check-conversations-table.ts` - Script para verificar las tablas

---

## 📝 Notas Técnicas

El endpoint de negociación funciona así:

1. Obtiene la invitación por ID
2. Verifica si ya existe una conversación entre los participantes
3. Si no existe, crea una nueva conversación
4. Retorna el ID de la conversación
5. El frontend redirige a `/conversations/{conversation_id}`

Sin la tabla `conversations`, falla en el paso 3.
