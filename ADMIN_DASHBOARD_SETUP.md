# Admin Dashboard - Setup Guide

## ¿Qué se ha completado?

### 1. Dashboard Visual (✅ IMPLEMENTADO)
- Dashboard principal con estadísticas en tiempo real
- Gráficos visuales (Pie Chart para invoices, Bar Chart para usuarios)
- KPIs principales: Total Invoices, Pendientes, Revenue, Total Users
- Estadísticas secundarias: Freelancers, Clientes, Proyectos

**Ubicación:** `/admin/dashboard`

### 2. Gestión de Invoices (✅ IMPLEMENTADO)
- API para obtener todas las invoices
- API para actualizar estado de invoices (pending → approved/rejected/paid)
- Búsqueda y filtrado por estado
- Interfaz para aprobar/rechazar invoices

**Ubicación:** 
- API: `/api/admin/invoices` y `/api/admin/invoices/[id]`
- Página: `/admin/invoices`

### 3. Base de Datos (✅ IMPLEMENTADO)
- Tabla `admin_users` creada con campos:
  - email (único)
  - name
  - role (admin/moderator)
  - permissions (JSONB)
  - is_active
- Índices para búsquedas rápidas

### 4. Autenticación Admin (✅ IMPLEMENTADO)
- Endpoint `/api/admin/check` para verificar si un usuario es admin
- Verificación por email en la tabla `admin_users`
- Soporte para diferentes roles (admin, moderator)

### 5. Estadísticas Admin (✅ IMPLEMENTADO)
- API `/api/admin/stats` retorna:
  - totalInvoices, pendingInvoices, approvedInvoices, paidInvoices, rejectedInvoices
  - totalRevenue, totalUsers, totalProjects, totalFreelancers, totalClients
  - Desglose de invoiceStatus por estado

## 📋 Pasos Necesarios para Completar

### PASO 1: Ejecutar Migrations en Supabase
Es **CRÍTICO** ejecutar las migrations en Supabase para que admin_users exista:

1. Ve a Supabase Dashboard → Tu Proyecto
2. SQL Editor
3. Copia y ejecuta el contenido de:
   - `supabase/migrations/008_make_allocated_budget_nullable.sql`
   - `supabase/migrations/009_add_spent_amount_column.sql`
   - `supabase/migrations/010_create_admin_users_table.sql`

O ejecuta todo de una vez con el archivo SUPABASE_SETUP.sql

### PASO 2: Agregar Tu Email como Admin
1. En Supabase SQL Editor, ejecuta:
```sql
INSERT INTO admin_users (email, name, role, is_active) 
VALUES ('TU_EMAIL@gmail.com', 'Tu Nombre', 'admin', true)
ON CONFLICT (email) DO NOTHING;
```

Reemplaza `TU_EMAIL@gmail.com` con tu email real.

### PASO 3: Probar el Dashboard

1. Inicia sesión con tu email en la app
2. Ve a `/admin/dashboard`
3. Deberías ver todas las estadísticas y gráficos

### PASO 4: Crear un Middleware de Redirección (OPCIONAL pero RECOMENDADO)

Para que admins vayan automáticamente a `/admin/dashboard` después de login:

En el middleware auth, agregar:
```typescript
if (isAdmin) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
}
```

## 🔗 URLs Implementadas

| Ruta | Descripción | Estado |
|------|-------------|--------|
| `/admin` | Página raíz del admin (redirige a dashboard) | ✅ |
| `/admin/dashboard` | Dashboard visual con estadísticas | ✅ |
| `/admin/invoices` | Gestión y aprobación de invoices | ✅ |
| `/api/admin/check` | Verificar si usuario es admin | ✅ |
| `/api/admin/stats` | Estadísticas del dashboard | ✅ |
| `/api/admin/invoices` | GET todas las invoices | ✅ |
| `/api/admin/invoices/[id]` | PATCH actualizar invoice | ✅ |

## 🎨 Características del Dashboard

### Estadísticas KPI
- Tarjetas con colores por categoría
- Iconos visuales
- Números grandes y legibles

### Gráficos
- **Pie Chart**: Distribución de invoices por estado
- **Bar Chart**: Distribución de usuarios (Clientes vs Freelancers)

### Búsqueda Rápida
- Botones para navegar a otros módulos
- Input de búsqueda (preparado para expandir)

## 📦 Dependencias Instaladas
- `recharts` - Para gráficos visuales

## 🚀 Próximos Pasos (No Implementados Aún)

1. **Admin Users Management** - Página para agregar/remover admins
2. **Search Enhancement** - Búsqueda en tiempo real por empresa/freelancer
3. **Reports** - Reportes avanzados y exportación a PDF/Excel
4. **Audit Logs** - Registro de acciones administrativas
5. **User Management** - Gestión completa de usuarios desde admin
6. **Project Management** - Vista de proyectos desde admin con actions
7. **Payment Processing** - Marcar invoices como pagadas
8. **Email Notifications** - Notificar freelancers cuando invoice es aprobada

## 🔐 Seguridad

Todos los endpoints admin verifican:
1. ✅ Autenticación (usuario logged in)
2. ✅ Autorización (email en admin_users con is_active=true)

Las acciones administrativas requieren ambas verificaciones.

## 📝 Base de Datos - admin_users

```sql
- id: UUID
- email: TEXT (UNIQUE)
- name: TEXT
- role: TEXT ('admin' | 'moderator')
- permissions: JSONB
- is_active: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

## 💡 Notas

- El dashboard se actualiza cada vez que se carga la página
- No hay auto-refresh en tiempo real (agregar WebSocket si se necesita)
- Las invoices se pueden filtrar por estado desde `/admin/invoices`
- Los gráficos mostran datos agregados pero no históricos (mejorable)
