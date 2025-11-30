# Plan de Implementación - Flujo de Negociación + Mejoras

## RESUMEN EJECUTIVO
Implementaremos en paralelo 3 áreas:
1. **SendGrid + Emails reales**
2. **WebSocket para notificaciones**
3. **Flujo completo de negociación**

Timeline estimado: ~2 semanas (trabajando en paralelo)

---

## FASE 1: CONFIGURACIÓN EXTERNA (SendGrid + Variables de Entorno)

### Paso 1.1: Crear cuenta SendGrid

```bash
1. Ir a https://sendgrid.com
2. Crear cuenta free (100 emails/día)
3. Obtener API Key
4. Verificar dominio de sender (si es producción)
```

### Paso 1.2: Actualizar `.env.local`

```bash
# Añadir a .env.local
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@tudominio.com
SENDGRID_FROM_NAME="malt - Ad Marketplace"
```

### Paso 1.3: Instalar cliente SendGrid

```bash
npm install @sendgrid/mail
```

---

## FASE 2: IMPLEMENTACIÓN SENDGRID

### Paso 2.1: Crear servicio de email (`src/lib/email.ts`)

**Archivo nuevo: `src/lib/email.ts`**

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const msg = {
      to: options.to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@malt.com',
      replyTo: options.replyTo,
      subject: options.subject,
      html: options.html,
    };

    const [response] = await sgMail.send(msg);
    console.log('[SendGrid] Email enviado:', {
      to: options.to,
      messageId: response.headers['x-message-id'],
    });
    return true;
  } catch (error) {
    console.error('[SendGrid] Error enviando email:', error);
    return false;
  }
}

// Templates de email
export const emailTemplates = {
  projectInvitation: (data: {
    freelancerName: string;
    companyName: string;
    projectTitle: string;
    duration: number;
    rate: number;
    total: number;
    linkToProposal: string;
  }) => `
    <h2>¡Nueva invitación a proyecto!</h2>
    <p>Hola ${data.freelancerName},</p>
    <p>${data.companyName} te ha invitado a participar en:</p>
    <h3>${data.projectTitle}</h3>
    <p><strong>Términos propuestos:</strong></p>
    <ul>
      <li>Duración: ${data.duration} jornadas</li>
      <li>Tarifa: €${data.rate}/jornada</li>
      <li>Total: €${data.total}</li>
    </ul>
    <a href="${data.linkToProposal}" style="
      display: inline-block;
      padding: 12px 24px;
      background-color: #0F4C5C;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    ">Ver propuesta y responder</a>
    <p style="color: #999; font-size: 12px; margin-top: 30px;">
      No responda a este email. Responda en la plataforma.
    </p>
  `,

  proposalResponse: (data: {
    companyName: string;
    freelancerName: string;
    projectTitle: string;
    linkToOffers: string;
  }) => `
    <h2>Freelancer respondió a tu propuesta</h2>
    <p>Hola ${data.companyName},</p>
    <p>${data.freelancerName} ha respondido a tu invitación para:</p>
    <h3>${data.projectTitle}</h3>
    <a href="${data.linkToOffers}" style="
      display: inline-block;
      padding: 12px 24px;
      background-color: #0F4C5C;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    ">Ver respuesta</a>
  `,

  offerAccepted: (data: {
    freelancerName: string;
    projectTitle: string;
    total: number;
    linkToProject: string;
  }) => `
    <h2>¡Tu oferta fue aceptada!</h2>
    <p>Felicidades ${data.freelancerName},</p>
    <p>Tu oferta para <strong>${data.projectTitle}</strong> fue aceptada.</p>
    <p><strong>Presupuesto bloqueado: €${data.total}</strong></p>
    <a href="${data.linkToProject}" style="
      display: inline-block;
      padding: 12px 24px;
      background-color: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin-top: 20px;
    ">Ver proyecto activo</a>
  `,
};
```

### Paso 2.2: Actualizar `src/lib/notifications.ts`

**Modificar la función `notifyUser`:**

```typescript
import { sendEmail, emailTemplates } from './email';

export async function notifyUser(
  userId: string,
  userEmail: string,
  type: NotificationType,
  title: string,
  message: string,
  data?: Record<string, any>
) {
  // 1. Guardar notificación in-app
  await supabase.from('notifications').insert({
    user_id: userId,
    type,
    title,
    message,
    data,
    read_at: null,
    created_at: new Date(),
  });

  // 2. Enviar email según tipo
  switch (type) {
    case 'project_invitation':
      await sendEmail({
        to: userEmail,
        subject: `Invitación a proyecto: ${data?.projectTitle}`,
        html: emailTemplates.projectInvitation({
          freelancerName: data?.freelancerName,
          companyName: data?.companyName,
          projectTitle: data?.projectTitle,
          duration: data?.duration,
          rate: data?.rate,
          total: data?.total,
          linkToProposal: `${process.env.NEXT_PUBLIC_APP_URL}/freelancer/proposals/${data?.invitationId}`,
        }),
      });
      break;

    case 'proposal_response':
      await sendEmail({
        to: userEmail,
        subject: `${data?.freelancerName} respondió a tu propuesta`,
        html: emailTemplates.proposalResponse({
          companyName: data?.companyName,
          freelancerName: data?.freelancerName,
          projectTitle: data?.projectTitle,
          linkToOffers: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${data?.projectId}/proposals`,
        }),
      });
      break;

    case 'offer_accepted':
      await sendEmail({
        to: userEmail,
        subject: `¡Tu oferta fue aceptada! - ${data?.projectTitle}`,
        html: emailTemplates.offerAccepted({
          freelancerName: data?.freelancerName,
          projectTitle: data?.projectTitle,
          total: data?.total,
          linkToProject: `${process.env.NEXT_PUBLIC_APP_URL}/freelancer/projects/${data?.projectId}`,
        }),
      });
      break;

    // ... otros tipos
  }
}
```

---

## FASE 3: MIGRACIÓN A WEBSOCKET PARA NOTIFICACIONES

### Paso 3.1: Crear hook `useNotificationsRealtime`

**Archivo nuevo: `src/hooks/useNotificationsRealtime.ts`**

```typescript
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Notification } from '@/types';

export function useNotificationsRealtime(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();

    // 1. Cargar notificaciones iniciales
    const loadNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read_at).length);
      }
      setLoading(false);
    };

    loadNotifications();

    // 2. Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Notification;
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updated = payload.new as Notification;
          setNotifications((prev) =>
            prev.map((n) => (n.id === updated.id ? updated : n))
          );
          if (updated.read_at && !payload.old.read_at) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId]);

  return { notifications, unreadCount, loading };
}
```

### Paso 3.2: Actualizar `notification-bell.tsx`

**Reemplazar polling con WebSocket:**

```typescript
'use client';

import { useSession } from 'next-auth/react';
import { useNotificationsRealtime } from '@/hooks/useNotificationsRealtime';
import { Bell } from 'lucide-react';
import NotificationItem from './notification-item';
import { useState } from 'react';

export default function NotificationBell() {
  const { data: session } = useSession();
  const { notifications, unreadCount, loading } = useNotificationsRealtime(
    session?.user?.id
  );
  const [isOpen, setIsOpen] = useState(false);

  if (!session?.user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-full transition relative"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white
                         text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg
                       shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notificaciones</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Cargando...</div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No hay notificaciones
              </div>
            ) : (
              notifications.slice(0, 5).map((notif) => (
                <NotificationItem
                  key={notif.id}
                  notification={notif}
                  onRead={() => {
                    // Marcar como leída
                  }}
                />
              ))
            )}
          </div>

          <div className="p-4 border-t text-center">
            <a href="/notifications" className="text-blue-600 hover:underline text-sm">
              Ver todas
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## FASE 4: BASE DE DATOS - NUEVAS TABLAS

### Paso 4.1: Crear migration SQL

**Archivo: `supabase/migrations/016_project_proposals.sql`**

```sql
-- Tabla de propuestas de proyectos
CREATE TABLE IF NOT EXISTS project_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES project_invitations(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Propuesta original (empresa)
  original_estimated_days INTEGER NOT NULL,
  original_hourly_rate DECIMAL(10, 2) NOT NULL,
  original_total_budget DECIMAL(12, 2) NOT NULL,
  original_suggested_milestones JSONB,
  message TEXT,

  -- Historial de cambios en negociación
  negotiation_history JSONB DEFAULT '[]',

  -- Términos finales acordados
  final_estimated_days INTEGER,
  final_hourly_rate DECIMAL(10, 2),
  final_total_budget DECIMAL(12, 2),
  final_suggested_milestones JSONB,

  -- Estado
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'negotiating', 'agreed', 'rejected')),
  freelancer_status TEXT DEFAULT 'pending' CHECK (freelancer_status IN ('pending', 'accepted', 'negotiating', 'rejected')),

  -- Conversación vinculada
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(invitation_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_project_proposals_invitation_id
  ON project_proposals(invitation_id);
CREATE INDEX IF NOT EXISTS idx_project_proposals_project_id
  ON project_proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_project_proposals_status
  ON project_proposals(status);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_project_proposal_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_proposal_updated_at
  BEFORE UPDATE ON project_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_project_proposal_updated_at();

-- Alteraciones a tabla projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS (
  estimated_days INTEGER,
  hourly_rate DECIMAL(10, 2),
  suggested_milestones JSONB
);
```

---

## FASE 5: IMPLEMENTACIÓN DEL FLUJO DE NEGOCIACIÓN

### Paso 5.1: Crear/Mejorar página invite (`/projects/[id]/invite`)

**Ubicación:** `src/app/projects/[id]/invite/page.tsx` (si no existe)

**Características:**
1. Listar freelancers con skills requeridas
2. Ver tarifa de cada freelancer
3. Panel para crear propuesta (con milestones sugeridos)
4. Enviar propuesta (crear proyecto_proposal + conversación automática)

### Paso 5.2: Crear página proposals (`/projects/[id]/proposals`)

**Nueva página:** `src/app/projects/[id]/proposals/page.tsx`

**Características:**
1. Listar todas las propuestas enviadas
2. Ver estado de cada una (Aceptada, En negociación, Rechazada)
3. Botones para:
   - Ver chat
   - Ver oferta formal
   - Aceptar/Rechazar

### Paso 5.3: Mejorar página de propuesta freelancer (`/freelancer/proposals/[id]`)

**Actualizar:** `src/app/freelancer/proposals/[id]/page.tsx`

**Cambios:**
1. Cargar datos de project_proposal
2. Mostrar 3 opciones: Aceptar / Negociar en chat / Rechazar
3. Si hay acuerdo en chat, pre-rellenar formulario

### Paso 5.4: Crear página submit-offer (`/freelancer/proposals/[id]/submit-offer`)

**Nueva página:** `src/app/freelancer/proposals/[id]/submit-offer/page.tsx`

**Características:**
1. Recibir términos acordados (desde params o BD)
2. Mostrar formulario con milestones pre-rellenados
3. Permitir ajustar descripción de hitos
4. Campo de carta de presentación
5. Enviar oferta formal

---

## FASE 6: APIS

### Paso 6.1: API para crear propuesta

**Endpoint:** `POST /api/projects/[id]/proposals`

```typescript
// Request body:
{
  freelancer_id: string,
  estimated_days: number,
  hourly_rate: number,
  suggested_milestones: Milestone[],
  message?: string
}

// Response:
{
  proposal_id: string,
  conversation_id: string,
  success: boolean
}
```

**Acciones:**
1. Crear registro en project_proposals
2. Crear conversación automática
3. Enviar email de invitación
4. Generar notificación in-app

### Paso 6.2: API para actualizar propuesta durante negociación

**Endpoint:** `PATCH /api/project-proposals/[id]`

```typescript
// Request body:
{
  final_estimated_days?: number,
  final_hourly_rate?: number,
  negotiation_entry: {
    actor: 'company' | 'freelancer',
    action: string,
    message: string,
    timestamp: ISO string
  }
}

// Response:
{
  success: boolean,
  updated_proposal: ProjectProposal
}
```

### Paso 6.3: API para crear oferta formal

**Endpoint:** `POST /api/freelancer-offers` (existente, mejorar)

```typescript
// Ahora vinculará a project_proposal
{
  based_on_proposal_id: string,
  cover_letter: string,
  milestones: Milestone[],
  total_amount: number
}
```

---

## FASE 7: INTEGRACIONES

### Paso 7.1: Crear conversación automática al invitar

**En endpoint POST `/api/projects/[id]/proposals`:**

```typescript
// Después de crear project_proposal, crear conversación:
const { data: conversation } = await supabase
  .from('conversations')
  .insert({
    participant_ids: [company_id, freelancer_id],
    project_id: project_id,
    proposal_id: proposal_id, // Nueva columna de referencia
    last_message_at: new Date(),
  })
  .select()
  .single();

// Luego actualizar project_proposal con conversation_id
await supabase
  .from('project_proposals')
  .update({ conversation_id: conversation.id })
  .eq('id', proposal_id);
```

### Paso 7.2: Link a chat en página de propuesta

**En `/freelancer/proposals/[id]`:**

```typescript
{proposal.conversation_id && (
  <a href={`/freelancer/messages?conversation=${proposal.conversation_id}`}>
    💬 Ver chat sobre esta propuesta
  </a>
)}
```

---

## FASE 8: COMPONENTES UI COMPARTIDOS

Crear componentes reutilizables:

1. **`ProposalCard`** - Tarjeta de propuesta
2. **`MilestonesList`** - Lista de hitos
3. **`TariffComparison`** - Mostrador de tarifa estándar vs oferta
4. **`ProposalStatus`** - Badge de estado
5. **`NegotiationHistory`** - Timeline de cambios

---

## ORDEN DE EJECUCIÓN RECOMENDADO

### Paralelo 1: SendGrid
1. Crear cuenta SendGrid
2. Instalar dependencia
3. Crear `src/lib/email.ts`
4. Actualizar `src/lib/notifications.ts`

### Paralelo 2: WebSocket
1. Crear hook `useNotificationsRealtime`
2. Actualizar `notification-bell.tsx`
3. Testear que funciona en tiempo real

### Paralelo 3: Flujo de Negociación
1. Crear migration SQL (project_proposals)
2. Crear APIs
3. Crear páginas (invite, proposals, submit-offer)
4. Crear componentes UI
5. Integrar todo

---

## TESTING CHECKLIST

### SendGrid
- [ ] Email de invitación llega
- [ ] Email de respuesta llega
- [ ] Email de aceptación llega
- [ ] Plantillas HTML se ven bien

### WebSocket
- [ ] Notificación aparece sin refresh
- [ ] Contador se actualiza en tiempo real
- [ ] Funciona en múltiples tabs simultáneamente
- [ ] Se desconecta/reconecta correctamente

### Flujo de Negociación
- [ ] Empresa crea propuesta
- [ ] Freelancer ve invitación + propuesta
- [ ] Chat se crea automáticamente
- [ ] Freelancer puede negociar en chat
- [ ] Empresa ve respuestas en tiempo real
- [ ] Se crea oferta formal correctamente
- [ ] Empresa puede aceptar oferta
- [ ] Fondos se bloquean correctamente
- [ ] Notificaciones se envían en cada paso

---

## NOTAS IMPORTANTES

1. **Variables de entorno:**
   - Asegúrate de añadir SENDGRID_API_KEY a Vercel
   - NEXT_PUBLIC_APP_URL debe estar configurado

2. **Backward compatibility:**
   - El chat existente sigue funcionando
   - Las notificaciones antiguas se conservan
   - Solo cambia el mecanismo de entrega

3. **Escalabilidad:**
   - Supabase Realtime soporta miles de conexiones simultáneas
   - SendGrid free tier: 100 emails/día (suficiente para desarrollo)
   - Cambiar a plan pago cuando sea necesario

4. **Error handling:**
   - Fallback de email: si SendGrid falla, log en consola pero no crash
   - Fallback de WebSocket: si WebSocket falla, fallback a polling
   - Reintentos automáticos en fallos de conexión

---
