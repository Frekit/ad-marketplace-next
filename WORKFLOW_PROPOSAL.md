# Propuesta de Flujo de Trabajo: Proyectos entre Freelancers y Empresas

## Visión General
Modelo **"Empresa Propone + Negociación Colaborativa"**:
- La empresa define términos iniciales claros
- Hay espacio para negociación en el chat
- Se llega a acuerdo ANTES de aceptar y bloquear fondos

---

## FASE 1: CREACIÓN DEL PROYECTO (Empresa)

### Paso 1.1: Empresa Crea Proyecto
**Página:** `/projects/new`

La empresa completa:
```
✓ Título del proyecto
✓ Descripción detallada
✓ Habilidades requeridas (tags)
✓ NUEVO: Duración estimada en jornadas (ej: 10, 20, 40 jornadas)
✓ NUEVO: Presupuesto máximo que está dispuesta a pagar
✓ NUEVO: Tarifa esperada (€/jornada que está dispuesta a pagar)
✓ NUEVO: Milestones sugeridos (estructura propuesta)
```

**Milestones Sugeridos (ejemplo):**
```
Estructura de 10 jornadas:
  ☆ Hito 1: Investigación y Estrategia (3 jornadas)
  ☆ Hito 2: Diseño y Prototipo (4 jornadas)
  ☆ Hito 3: Implementación y Testing (3 jornadas)

Presupuesto total: €750 (10 jornadas × €75/jornada)
  - Hito 1: €225
  - Hito 2: €300
  - Hito 3: €225
```

**Estado del proyecto:** `'draft'` (no publicado aún)

**Base de datos:**
```sql
ALTER TABLE projects ADD COLUMN (
  estimated_days INTEGER (10, 20, 40, etc.)
  budget_max DECIMAL (presupuesto máximo)
  hourly_rate DECIMAL (tarifa por jornada que espera pagar)
  suggested_milestones JSONB (estructura propuesta)
);
```

---

## FASE 2: INVITACIÓN CON PROPUESTA INICIAL (Empresa)

### Paso 2.1: Empresa Selecciona Freelancers e Invita
**Página:** `/projects/[id]/invite` (nueva o mejorada)

**Flujo de la empresa:**

1. Empresa ve lista de freelancers disponibles
2. Selecciona uno (ej: Juan García)
3. **Se abre panel de creación de propuesta:**

```
┌──────────────────────────────────────────────────┐
│ PERFIL DEL FREELANCER                            │
├──────────────────────────────────────────────────┤
│ 👤 Juan García                                   │
│ ⭐ Rating: 4.8/5 (25 proyectos completados)     │
│ 📊 Experiencia: 8 años en marketing digital     │
│                                                  │
│ 💰 TARIFA ESTÁNDAR: €75/jornada                 │
│    (Lo que habitualmente cobra)                  │
├──────────────────────────────────────────────────┤
│ CREAR PROPUESTA PARA JUAN                        │
│                                                  │
│ Duración estimada: [10] jornadas                │
│                                                  │
│ Tarifa que ofrezco:                             │
│  ☐ €75/jornada (su tarifa estándar)             │
│  ☐ €60/jornada (menos que su tarifa)            │
│  ☐ €85/jornada (más que su tarifa)              │
│                                                  │
│  Elegiste: €75/jornada                          │
│  Total presupuesto: €750 (10 × €75)             │
│                                                  │
│ Milestones sugeridos (desglosaré así):          │
│  ☆ Hito 1: Investigación (3 jornadas - €225)   │
│  ☆ Hito 2: Diseño (4 jornadas - €300)          │
│  ☆ Hito 3: Implementación (3 jornadas - €225)  │
│                                                  │
│ Mensaje adicional (contexto del proyecto):      │
│ [Campo de texto - opcional]                     │
│ "Necesito un experto en ads para..."            │
│                                                  │
│ [Botón] Enviar propuesta a Juan                │
│ [Botón] Cancelar                               │
└──────────────────────────────────────────────────┘
```

**Importante:** La empresa VE la tarifa estándar del freelancer y decide:
- Ofrecer su tarifa estándar (€75)
- Ofrecer menos (€60 - probablemente rechace)
- Ofrecer más (€85 - para atraerlo)

**Base de datos - Nueva tabla: `project_proposals`**
```sql
CREATE TABLE project_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4()
  invitation_id UUID REFERENCES project_invitations(id)

  -- Propuesta de la empresa
  estimated_days INTEGER (10 jornadas)
  hourly_rate DECIMAL (€75/jornada)
  total_budget DECIMAL (€750)
  suggested_milestones JSONB[] (estructura propuesta)
  message TEXT (contexto/explicación)

  -- Respuesta del freelancer
  freelancer_negotiation_notes JSONB (cambios que propone)
  freelancer_status TEXT ('pending', 'accepted', 'negotiating', 'rejected')

  -- Estados
  status TEXT ('sent', 'negotiating', 'agreed', 'rejected')
  created_at TIMESTAMP
  updated_at TIMESTAMP
);
```

### Paso 2.2: Freelancer Recibe Invitación + Propuesta
**Sección:** `/freelancer/proposals`

El freelancer ve:
```
Invitación de: Empresa ABC
Proyecto: "Campaña de Facebook Ads"
---
Propuesta Inicial:
  ✓ Duración: 10 jornadas
  ✓ Tarifa ofrecida: €75/jornada
  ✓ Presupuesto total: €750
  ✓ Mi tarifa estándar: €75/jornada ✓ (Coincide perfectamente)

  ✓ Milestones sugeridos:
    • Hito 1: Investigación y Estrategia (3 jornadas - €225)
    • Hito 2: Diseño y Prototipo (4 jornadas - €300)
    • Hito 3: Implementación y Testing (3 jornadas - €225)

  ✓ Mensaje de la empresa: "Necesitamos un experto en..."

[Botón] Ver detalles y responder
[Botón] Rechazar
```

---

## FASE 3: NEGOCIACIÓN EN CHAT (Ambas partes)

### Paso 3.1: Freelancer Abre Propuesta

**Página:** `/freelancer/proposals/[id]` (MODIFICADA)

El freelancer ve la propuesta clara de la empresa:

```
┌─────────────────────────────────────────┐
│ PROPUESTA DE: Empresa ABC               │
├─────────────────────────────────────────┤
│ Duración: 10 jornadas                   │
│ Tarifa ofrecida: €75/jornada            │
│ Presupuesto total: €750                 │
│ Mi tarifa estándar: €75/jornada ✓       │
│                                         │
│ Milestones sugeridos:                   │
│  • Hito 1: Investigación (3 jornadas)   │
│  • Hito 2: Diseño (4 jornadas)          │
│  • Hito 3: Implementación (3 jornadas)  │
├─────────────────────────────────────────┤
│ OPCIONES:                               │
│                                         │
│ [Opción 1] Aceptar propuesta            │
│ → Voy a crear la oferta formal          │
│   con estos términos                    │
│                                         │
│ [Opción 2] Proponer cambios en chat     │
│ → Voy a hablar con la empresa en el     │
│   chat sobre ajustes                    │
│                                         │
│ [Opción 3] Rechazar                     │
│                                         │
└─────────────────────────────────────────┘
```

**Flujo detallado:**

#### Caso A: Freelancer Acepta Directamente
```
Freelancer hace clic en "Aceptar propuesta"
    ↓
Se abre formulario de oferta formal:
  - Duración: 10 jornadas (fija)
  - Tarifa: €75/jornada (fija)
  - Total: €750 (fijo)

  - Milestones sugeridos pre-rellenados:
    * Hito 1: Investigación - 3 jornadas - €225
    * Hito 2: Diseño - 4 jornadas - €300
    * Hito 3: Implementación - 3 jornadas - €225

  (Freelancer puede ajustar descripción de hitos, pero no montos)
  - Carta de presentación: [campo de texto]
    ↓
[Botón] "Enviar Oferta Formal"
    ↓
Se crea: freelancer_offer con status 'pending'
Propuesta cambia a status 'agreed'
Se notifica a la empresa: "Oferta recibida"
```

#### Caso B: Freelancer Prefiere Negociar en Chat
```
Freelancer hace clic en "Proponer cambios en chat"
    ↓
Se crea conversación automáticamente
Freelancer entra a /freelancer/messages
    ↓
Freelancer escribe en el chat:
  "Hola, veo la propuesta de 10 jornadas a €75.
   ¿Podríamos hacer 8 jornadas? Creo que sería suficiente
   para los deliverables que mencionas."
    ↓
La empresa ve notificación: "Freelancer respondió a tu propuesta"
```

### Paso 3.2: Empresa Monitorea Propuestas
**Página:** `/projects/[id]/proposals` (nueva)

La empresa ve todas las propuestas:
```
PROPUESTAS ENVIADAS:

1️⃣ Juan García
   Estado: ACEPTADA ✓
   Propuesta: 10 jornadas - €750
   Milestones: [Investigación, Diseño, Implementación]

   [Botón] Ver oferta formal
   [Botón] Aceptar y bloquear fondos

2️⃣ María Sánchez
   Estado: EN NEGOCIACIÓN 💬
   Propuesta: 10 jornadas - €750
   Último mensaje: "Hola, podríamos hacer 8 jornadas?"

   [Botón] Ver chat
   [Botón] Responder

3️⃣ Carlos López
   Estado: RECHAZADA ✗
   Razón: No respondió
```

### Paso 3.3: Negociación en Chat (Bidireccional)

**El chat funciona en `/freelancer/messages` (existente):**

```
EMPRESA (10:00): "Hola Juan, te propongo 10 jornadas a €75/día"
FREELANCER (10:30): "Veo la propuesta. ¿Podrías ser más flexible con 8 jornadas?"
EMPRESA (11:00): "Entiendo, pero 10 es importante. Sin embargo, aceptamos 9 jornadas a €75"
FREELANCER (11:15): "Perfecto, 9 jornadas = €675. Voy a crear la oferta formal con ese acuerdo"
EMPRESA (11:20): "Excelente, espero tu oferta formal"
```

**Cuando llegan a acuerdo en el chat:**
```
EMPRESA escribe: "Confirmamos: 9 jornadas a €75/jornada = €675.
                 Milestones: (los que sugerimos originalmente)"
FREELANCER responde: "Perfecto, voy a crear la oferta formal ahora"

El freelancer vuelve a /freelancer/proposals/[id]
Ve: "Acuerdo alcanzado: 9 jornadas a €675"
Hace clic en [Aceptar acuerdo y crear oferta]
    ↓
Se pre-rellena el formulario con los términos acordados
Freelancer ajusta descripción de hitos si es necesario
Envía oferta formal
```

---

## FASE 4: ACUERDO Y CREACIÓN DE OFERTA FORMAL

### Paso 4.1: Ambos Llegan a Acuerdo

**En el chat, cuando hay acuerdo:**
```
Empresa escribe: "Ok, confirmamos 7 jornadas a €75/día = €525"
Freelancer responde: "Perfecto, estoy de acuerdo. Te comparto la oferta formal"
```

### Paso 4.2: Freelancer Envía Oferta Formal

**Página:** `/freelancer/proposals/[id]/submit-offer`

Basado en el acuerdo del chat, freelancer crea la oferta formal:
```
Duración acordada: 7 jornadas
Tarifa: €75/día
Total: €525

Milestones (propuesta):
  ☆ Hito 1: Investigación - 2 jornadas - €150 - Entrega: 2025-01-20
  ☆ Hito 2: Estrategia - 2 jornadas - €150 - Entrega: 2025-01-27
  ☆ Hito 3: Implementación - 3 jornadas - €225 - Entrega: 2025-02-03

Carta de presentación:
  "Tengo 8 años en marketing digital, especializado en Facebook Ads..."

[Botón] "Enviar Oferta Formal"
```

**Se crea:** `freelancer_offers` con status `'pending'`

---

## FASE 5: EMPRESA REVISA Y ACEPTA

### Paso 5.1: Empresa Revisa Oferta
**Página:** `/projects/[id]/offers`

```
OFERTA DE: Juan García

Términos acordados en el chat:
  ✓ Duración: 7 jornadas
  ✓ Tarifa: €75/día
  ✓ Total: €525

Milestones propuestos:
  ☆ Hito 1: Investigación - €150 - Entrega: 2025-01-20
  ☆ Hito 2: Estrategia - €150 - Entrega: 2025-01-27
  ☆ Hito 3: Implementación - €225 - Entrega: 2025-02-03

Saldo disponible: €3000
Fondos a bloquear: €525
Saldo después: €2475

[Botón] "Aceptar y Bloquear Fondos"
[Botón] "Rechazar"
```

### Paso 5.2: Empresa Acepta
```
Validaciones:
  ✓ Saldo suficiente
  ✓ Oferta vigente (no expirada)

Se ejecuta SQL: lock_project_funds(525)
  - available_balance: 3000 → 2475
  - locked_balance: 0 → 525

Cambios en proyecto:
  - status: 'draft' → 'active'
  - freelancer_id: uuid-de-juan
  - allocated_budget: 525
  - milestones: [copia de la oferta]

Se notifica al freelancer:
  ✓ "Tu oferta fue aceptada. El proyecto está activo."
```

---

## FASE 6: EJECUCIÓN Y PAGOS

### Paso 6.1: Freelancer Trabaja y Completa Hitos

El freelancer marca hitos como completados:
```
Hito 1 "Investigación" → [Botón] "Marcar como completado"
Mensaje: "Adjunto análisis de competencia en Google Drive"
```

### Paso 6.2: Empresa Aprueba y Paga
```
Empresa ve:
  ☆ Hito 1: Completado (esperando aprobación)

  [Botón] "Aprobar y Pagar €150"
  [Botón] "Rechazar y pedir cambios"
```

Al aprobar:
```
Ejecuta: transfer_milestone_funds(hito, freelancer)
  - locked_balance: 525 → 375
  - Transfiere €150 al wallet del freelancer

Se notifica al freelancer:
  ✓ "Hito aprobado. Recibiste €150"
```

### Paso 6.3: Proyecto Completo
```
Cuando todos los hitos están aprobados:
  - status: 'active' → 'completed'
  - Ambos pueden dejar reseñas
  - Se abre espacio para retroalimentación
```

---

## RESUMEN DE CAMBIOS NECESARIOS

### 1. Base de Datos
```sql
-- Nueva tabla
CREATE TABLE project_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID REFERENCES project_invitations(id),
  estimated_days INTEGER,
  budget_min DECIMAL,
  budget_max DECIMAL,
  proposed_hourly_rate DECIMAL,
  proposed_milestones JSONB,
  freelancer_counter_proposal JSONB,
  freelancer_status TEXT,
  status TEXT,
  message TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Modificaciones a projects
ALTER TABLE projects ADD COLUMN (
  estimated_days INTEGER,
  budget_max DECIMAL,
  deliverables TEXT,
  company_hourly_rate DECIMAL
);

-- Modificaciones a freelancer_offers
ALTER TABLE freelancer_offers ADD COLUMN (
  negotiation_history JSONB (historial de cambios en negociación)
);
```

### 2. Nuevas Páginas
```
/projects/[id]/invite (mejorada)
  - Mostrar tarifa de freelancer
  - Propuesta inicial clara

/projects/[id]/proposals (nueva)
  - Ver propuestas enviadas y respuestas

/freelancer/proposals/[id] (mejorada)
  - Chat integrado
  - Opciones: Aceptar / Contraproponer / Negociar

/freelancer/proposals/[id]/submit-offer (nueva)
  - Crear oferta formal basada en acuerdo
```

### 3. Nuevos APIs
```
POST /api/projects/[id]/proposals
  - Crear propuesta inicial (empresa)

POST /api/projects/[id]/proposals/[proposalId]/counter
  - Freelancer hace contrapropuesta

GET /api/projects/[id]/proposals
  - Empresa ve propuestas y respuestas

POST /api/conversations (existente, mejorado)
  - Crear chat automático al proponer
```

### 4. Chat Integrado
```
- Conversación automática cuando hay propuesta
- Se vincula a project_id
- Historial visible para ambos
- Permite adjuntos (archivos, URLs)
```

---

## COMPARACIÓN: ANTES vs DESPUÉS

### ANTES (Actual)
```
Empresa invita sin términos
    ↓
Freelancer propone totalmente desde cero
    ↓
Empresa acepta u rechaza (sin negociación)
```

### DESPUÉS (Propuesto)
```
Empresa propone: duración + presupuesto + tarifa
    ↓
Freelancer ve su tarifa vs propuesta de empresa
    ↓
Negociación clara en chat
    ↓
Se llega a acuerdo
    ↓
Freelancer envía oferta formal basada en acuerdo
    ↓
Empresa acepta (con fondos bloqueados)
```

---

## VENTAJAS DE ESTE MODELO

✓ **Para la Empresa:**
  - Control claro de presupuesto
  - Sabe qué esperar desde el inicio
  - Negocia antes de comprometer fondos
  - Menos sorpresas

✓ **Para el Freelancer:**
  - Ve claramente qué espera la empresa
  - Puede contraproponer sin crear oferta "incorrecta"
  - Negociación clara y documentada
  - No gasta tiempo haciendo oferta que será rechazada

✓ **Para la Plataforma:**
  - Menos fricción
  - Mejor tasa de aceptación
  - Menos disputas (se acuerda todo por adelantado)
  - Chat integrado = retención

---

## IMPLEMENTACIÓN RECOMENDADA (Orden)

1. **Fase 1:** Agregar campos a tabla `projects` (estimated_days, budget_max, etc.)
2. **Fase 2:** Crear tabla `project_proposals`
3. **Fase 3:** Mejorar página de invitación (`/projects/[id]/invite`)
4. **Fase 4:** Mejorar página de propuesta de freelancer (`/freelancer/proposals/[id]`)
5. **Fase 5:** Agregar chat integrado
6. **Fase 6:** Crear página de ofertas para empresa (`/projects/[id]/proposals`)
7. **Fase 7:** Crear página de envío de oferta formal (`/freelancer/proposals/[id]/submit-offer`)
8. **Fase 8:** Pruebas end-to-end

---

## Notas Finales

Este modelo **"Propuesta Inicial + Negociación + Acuerdo"** es ideal porque:

1. La empresa tiene **control y claridad** sobre lo que espera
2. El freelancer tiene **libertad para contraproponer** sin perder tiempo
3. Ambos **negocian en el chat** de forma natural
4. Se llega a **acuerdo documentado** antes de bloquear fondos
5. La oferta formal es **confirmación** de acuerdo, no propuesta inicial

Este es el flujo que usan plataformas exitosas como **Toptal** y **Gun.io**.
