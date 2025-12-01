# 💬 Sistema de Negociación por Conversación

## Resumen de Implementación

Se ha implementado completamente el sistema de conversaciones para permitir que freelancers y clientes negocien sobre propuestas de manera fluida y en tiempo real.

---

## 🎯 Flujo Completo

### 1. Desde Propuesta a Conversación
```
Freelancer ve propuesta → Clic en "Negociar"
  → Se crea una conversación (o reutiliza existente)
  → Se redirige a /conversations/[id]
  → Se muestra mini resumen del proyecto
  → Puede enviar mensajes de negociación
```

### 2. Aceptar Propuesta
```
Freelancer en propuesta → Clic en "Aceptar"
  → Se crea una oferta formal (freelancer_offers)
  → Se actualiza estado de invitación a "offer_submitted"
  → Se notifica al cliente
  → Éxito ✅
```

---

## 📊 Base de Datos

### Tabla: `conversations`
Almacena las conversaciones entre participantes sobre un proyecto.

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id),
    participant_ids UUID[],  -- Array de [freelancer_id, client_id]
    last_message_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabla: `conversation_messages`
Almacena los mensajes individuales dentro de una conversación.

```sql
CREATE TABLE conversation_messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    sender_id UUID REFERENCES users(id),
    content TEXT,
    read_at TIMESTAMP,
    created_at TIMESTAMP
);
```

---

## 📱 Frontend

### Página: `/conversations/[id]`
- **Ubicación**: `src/app/conversations/[id]/page.tsx`
- **Características**:
  - ✅ Carga detalles de la conversación
  - ✅ Muestra mini resumen del proyecto (título, descripción, skills)
  - ✅ Lista de mensajes con timestamps
  - ✅ Input para escribir nuevos mensajes
  - ✅ Actualización automática de mensajes (polling cada 2 segundos)
  - ✅ Autenticación verificada

---

## 🔌 API Endpoints

### `GET /api/conversations/[id]`
Obtiene detalles de una conversación.

**Response**:
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "participant_ids": ["uuid1", "uuid2"],
  "last_message_at": "2025-12-01T00:00:00Z",
  "created_at": "2025-12-01T00:00:00Z"
}
```

### `GET /api/conversations/[id]/messages`
Obtiene todos los mensajes de una conversación.

**Response**:
```json
[
  {
    "id": "uuid",
    "sender_id": "uuid",
    "content": "Mensaje de ejemplo",
    "read_at": null,
    "created_at": "2025-12-01T00:00:00Z"
  }
]
```

### `POST /api/conversations/[id]/messages`
Envía un nuevo mensaje.

**Body**:
```json
{
  "content": "Mi respuesta a tu propuesta..."
}
```

**Response**:
```json
{
  "id": "uuid",
  "sender_id": "uuid",
  "content": "...",
  "created_at": "2025-12-01T00:00:00Z"
}
```

---

## 🔄 Negociación Workflow

### POST `/api/freelancer/proposals/[id]/negotiate`
Inicia o recupera una conversación para negociar.

**Lógica**:
1. Obtiene la invitación
2. Verifica si ya existe conversación entre los participantes
3. Si no existe → **Crea una nueva**
4. Si existe → **Reutiliza la existente**
5. Retorna `conversation_id`

**Response**:
```json
{
  "conversation_id": "uuid",
  "message": "Conversation created/retrieved successfully"
}
```

### POST `/api/freelancer/proposals/[id]/offer`
Submite una oferta formal (aceptación de propuesta).

**Body**:
```json
{
  "coverLetter": "Acepto...",
  "milestones": [...],
  "totalAmount": 1500
}
```

**Cambios realizados**:
- ✅ Removida referencia a columna no existente `based_on_proposal_id`
- ✅ Crea registro en `freelancer_offers`
- ✅ Actualiza estado de invitación a `offer_submitted`
- ✅ Notifica al cliente

---

## 🚀 Flujo de Negociación Detallado

```
┌─────────────────────────────────────────────────────────┐
│ Freelancer hace clic en "Negociar" en propuesta         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ POST /negotiate      │
        └──────────┬───────────┘
                   │
        ┌──────────┴──────────┐
        │ ¿Conversación       │
        │  existente?         │
        └──┬──────────────┬───┘
           │              │
        SÍ │              │ NO
           │              │
           ▼              ▼
    Reutilizar    Crear nueva
    existente      conversación
           │              │
           └──────┬───────┘
                  │
                  ▼
    ┌──────────────────────────────┐
    │ Redirect a /conversations/id │
    └──────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────────────┐
    │ Página de conversación       │
    │ - Mini resumen del proyecto  │
    │ - Historial de mensajes      │
    │ - Input para escribir        │
    └──────────────────────────────┘
```

---

## ✅ Checklist de Implementación

- [x] Tablas de base de datos creadas
- [x] Endpoint de negociación funcionando
- [x] Página de conversación creada
- [x] Endpoints de mensajes (GET/POST)
- [x] Mini resumen del proyecto en conversación
- [x] Autenticación en todos los endpoints
- [x] Validación de permisos (solo participantes)
- [x] Actualización automática de mensajes (polling)
- [x] Notificaciones al cliente
- [x] Endpoint de aceptación de propuesta (sin errores de columna)

---

## 🔍 Testing

### Pasos para probar:
1. Inicia sesión como freelancer
2. Ve a `/freelancer/proposals`
3. Haz clic en "Negociar" en una propuesta
4. Deberías ser redirigido a `/conversations/[id]`
5. Verifica que se muestre el resumen del proyecto
6. Escribe un mensaje y envía
7. El mensaje debería aparecer en la lista

### Para probar aceptación:
1. En la página de propuesta, haz clic en "Aceptar"
2. Debería enviarse la oferta sin errores
3. El estado debería cambiar a "offer_submitted"

---

## 📝 Archivos Modificados/Creados

**Nuevos archivos**:
- `src/app/conversations/[id]/page.tsx` - Página de conversación
- `src/app/api/conversations/[id]/route.ts` - Endpoint GET conversación
- `src/app/api/conversations/[id]/messages/route.ts` - Endpoints de mensajes
- `database/conversations-schema.sql` - Schema de tablas
- `CONVERSATION_FEATURE.md` - Este documento

**Archivos modificados**:
- `src/app/api/freelancer/proposals/[id]/negotiate/route.ts` - Añadido logging
- `src/app/api/freelancer/proposals/[id]/offer/route.ts` - Removida columna no existente
- `src/app/api/freelancer/proposals/[id]/proposal/route.ts` - Queries separadas

---

## 🎉 Estado Final

✅ **El sistema de negociación por conversación está completamente implementado y funcionando**

- Conversaciones se crean automáticamente al hacer clic en "Negociar"
- Se reutilizan conversaciones existentes
- Los mensajes se sincronizan en tiempo real
- Se muestra el resumen del proyecto
- La aceptación de propuestas funciona correctamente
- Todas las notificaciones se envían apropiadamente
