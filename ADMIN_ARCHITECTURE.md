# 🏗️ Arquitectura del Admin Dashboard

## Diagrama de Flujo:

```
┌─────────────────┐
│  Usuario Admin  │
│  (navegador)    │
└────────┬────────┘
         │
         │ 1. Login con email
         ▼
┌─────────────────────────┐
│  Auth Middleware        │
│  (verificar sesión)     │
└────────┬────────────────┘
         │
         │ 2. Email autenticado
         ▼
┌─────────────────────────────────────┐
│  /admin/dashboard                   │
│  (página React del dashboard)        │
└────────┬────────────────────────────┘
         │
         │ 3. useEffect → fetch /api/admin/check
         ▼
┌─────────────────────────────────────┐
│  GET /api/admin/check               │
│  ✓ Verifica email en admin_users    │
│  ✓ Retorna {isAdmin: bool, admin}   │
└────────┬────────────────────────────┘
         │
         │ 4. Si isAdmin = true, fetch /api/admin/stats
         ▼
┌─────────────────────────────────────┐
│  GET /api/admin/stats               │
│  ✓ Calcula estadísticas             │
│  ✓ Retorna JSON con todos los datos │
└────────┬────────────────────────────┘
         │
         │ 5. Data → setStats(data)
         ▼
┌─────────────────────────────────────┐
│  Render Dashboard                   │
│  - KPI Cards                        │
│  - Pie Chart                        │
│  - Bar Chart                        │
└────────┬────────────────────────────┘
         │
         │ 6. Si usuario clica "Ver Invoices"
         ▼
┌─────────────────────────────────────┐
│  /admin/invoices                    │
│  (página de gestión de invoices)    │
└────────┬────────────────────────────┘
         │
         │ 7. fetch /api/admin/invoices
         ▼
┌─────────────────────────────────────┐
│  GET /api/admin/invoices            │
│  ✓ Verifica admin status            │
│  ✓ Retorna lista de invoices        │
└────────┬────────────────────────────┘
         │
         │ 8. Data → setInvoices(data)
         ▼
┌─────────────────────────────────────┐
│  Render Invoice List                │
│  - Búsqueda                         │
│  - Filtros                          │
│  - Botones Aprobar/Rechazar         │
└────────┬────────────────────────────┘
         │
         │ 9. Si usuario clica Aprobar
         ▼
┌─────────────────────────────────────┐
│  PATCH /api/admin/invoices/[id]    │
│  ✓ Verifica admin status            │
│  ✓ Actualiza status                 │
│  ✓ Retorna invoice actualizada      │
└────────┬────────────────────────────┘
         │
         │ 10. Actualiza estado en UI
         ▼
┌─────────────────────────────────────┐
│  Invoice actualizada en tabla       │
└─────────────────────────────────────┘
```

## Estructura de Carpetas:

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx (raíz → redirige a dashboard)
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   │       ├── useEffect: fetchStats()
│   │   │       ├── State: stats
│   │   │       ├── Render: KPI Cards
│   │   │       ├── Render: Pie Chart
│   │   │       └── Render: Bar Chart
│   │   │
│   │   ├── invoices/
│   │   │   └── page.tsx
│   │   │       ├── State: invoices, filters
│   │   │       ├── Methods: fetchInvoices, updateStatus
│   │   │       └── Render: Invoice List with Actions
│   │   │
│   │   └── users/ (próximo)
│   │
│   └── api/
│       └── admin/
│           ├── check/
│           │   └── route.ts (GET)
│           │       ├── Verifica autenticación
│           │       ├── Busca email en admin_users
│           │       └── Retorna {isAdmin, admin}
│           │
│           ├── stats/
│           │   └── route.ts (GET)
│           │       ├── Verifica admin status
│           │       ├── Calcula totales
│           │       └── Retorna Stats
│           │
│           └── invoices/
│               ├── route.ts (GET)
│               │   ├── Verifica admin status
│               │   └── Retorna lista de invoices
│               │
│               └── [id]/
│                   └── route.ts (PATCH)
│                       ├── Verifica admin status
│                       ├── Actualiza invoice
│                       └── Retorna invoice actualizada
│
└── lib/
    └── supabase.ts (cliente Supabase)

database/
└── supabase/
    └── migrations/
        ├── 008_make_allocated_budget_nullable.sql
        ├── 009_add_spent_amount_column.sql
        └── 010_create_admin_users_table.sql
            └── Crea tabla admin_users
                ├── Índices
                └── Datos iniciales
```

## Estados y Props:

### AdminDashboard Component

**States:**
```typescript
const [stats, setStats] = useState<Stats>({
    totalInvoices: number
    pendingInvoices: number
    approvedInvoices: number
    paidInvoices: number
    rejectedInvoices: number
    totalRevenue: number
    totalUsers: number
    totalProjects: number
    totalFreelancers: number
    totalClients: number
    invoiceStatus: { pending, approved, paid, rejected }
})

const [loading, setLoading] = useState(boolean)
const [error, setError] = useState(string)
const [searchQuery, setSearchQuery] = useState(string)
```

**Functions:**
```typescript
fetchStats() → Llama /api/admin/stats
```

### AdminInvoices Component

**States:**
```typescript
const [invoices, setInvoices] = useState<Invoice[]>
const [loading, setLoading] = useState(boolean)
const [searchQuery, setSearchQuery] = useState(string)
const [statusFilter, setStatusFilter] = useState(string)
```

**Functions:**
```typescript
fetchInvoices() → Llama /api/admin/invoices
updateInvoiceStatus(id, status) → Llama PATCH /api/admin/invoices/[id]
```

## Data Flow (Redux-style):

```
1. User accesses /admin/dashboard
   ↓
2. Component mounts
   ↓
3. useEffect runs fetchStats()
   ↓
4. API GET /api/admin/stats
   ├─ Verifica auth
   ├─ Verifica admin_users
   └─ Calcula datos
   ↓
5. Response → setStats(data)
   ↓
6. Component re-renders con stats
   ↓
7. Gráficos y cards se muestran
   ↓
8. Usuario puede interactuar:
   ├─ Ver invoices
   ├─ Buscar
   ├─ Filtrar
   └─ Aprobar/Rechazar
```

## Security Layers:

```
Capa 1: Autenticación
├─ session user exists?
└─ email is not null?

Capa 2: Autorización
├─ email in admin_users?
└─ is_active = true?

Capa 3: Permisos
├─ role = 'admin'?
├─ role = 'moderator'?
└─ permissions JSONB?

Capa 4: Rate Limiting (futuro)
└─ API calls/min limited?
```

## API Endpoints:

### GET /api/admin/stats
```
Request: 
  - Headers: session cookie
  
Response (200):
  {
    totalInvoices: 45,
    pendingInvoices: 12,
    approvedInvoices: 28,
    paidInvoices: 20,
    rejectedInvoices: 5,
    totalRevenue: 50000,
    totalUsers: 156,
    totalProjects: 89,
    totalFreelancers: 45,
    totalClients: 30,
    invoiceStatus: { pending: 12, approved: 28, paid: 20, rejected: 5 }
  }

Errors:
  401 - Not authenticated
  403 - Not an admin
  500 - Server error
```

### GET /api/admin/invoices
```
Request: 
  - Headers: session cookie
  
Response (200):
  [
    {
      id: "uuid",
      amount: 1500.50,
      status: "pending|approved|paid|rejected",
      created_at: "2024-01-15T10:30:00Z",
      due_date: "2024-02-15T10:30:00Z"
    },
    ...
  ]

Errors:
  401 - Not authenticated
  403 - Not an admin
  500 - Server error
```

### PATCH /api/admin/invoices/[id]
```
Request: 
  - Headers: session cookie
  - Body: { status: "approved|rejected|paid" }
  
Response (200):
  {
    id: "uuid",
    amount: 1500.50,
    status: "approved",
    updated_at: "2024-01-15T10:35:00Z"
  }

Errors:
  400 - Invalid status
  401 - Not authenticated
  403 - Not an admin
  404 - Invoice not found
  500 - Server error
```

## Database Schema:

### admin_users table
```sql
id              UUID PRIMARY KEY
email           TEXT UNIQUE NOT NULL
name            TEXT
role            TEXT CHECK (role IN ('admin', 'moderator'))
permissions     JSONB
is_active       BOOLEAN
created_at      TIMESTAMP
updated_at      TIMESTAMP

Indexes:
- idx_admin_users_email
- idx_admin_users_is_active
```

### Example Records:
```
admin@example.com    | admin      | {...}  | true | 2024-01-01
support@example.com  | moderator  | {...}  | true | 2024-01-01
your-email@gmail.com | admin      | {...}  | true | 2024-01-15
```

## Performance Considerations:

```
✅ Stats cacheadas en estado del cliente
✅ Índices en admin_users para búsquedas O(1)
✅ Gráficos lazy-rendered
✅ Invoices paginables (futuro)
✅ Búsqueda en frontend (no en backend)
✅ Filtros en frontend (no en backend)
```

## Escalabilidad:

```
Para 1000+ invoices:
├─ Agregar paginación en /api/admin/invoices
├─ Agregar sort params (by date, amount, status)
├─ Agregar filters en backend
└─ Cachar estadísticas en Redis (futuro)

Para múltiples admins:
├─ Ya soportado con rol/permissions
├─ Agregar audit logs
├─ Agregar activity feed
└─ Agregar notifications
```

## Monitoreo:

```
Métricas a trackear:
├─ /api/admin/stats - Time to respond
├─ /api/admin/invoices - Query time
├─ Dashboard - Page load time
├─ Charts - Render time
└─ Error rates por endpoint
```

---

**Última actualización:** Hoy
**Arquitecto:** Sistema Admin Dashboard Modular
**Status:** 🟢 LISTO PARA PRODUCCIÓN
