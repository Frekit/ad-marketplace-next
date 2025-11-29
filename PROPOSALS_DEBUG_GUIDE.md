# Propuestas/Invitaciones - Guía de Debug

**Fecha:** 30 de Noviembre, 2025
**Status:** ✅ LA PROPUESTA EXISTE EN LA BD - Problema es con la autenticación en el frontend

---

## Resumen de lo Que Está Pasando

✅ **La invitación SÍ se creó correctamente en la base de datos:**
- ID de invitación: `ddfb967f-261c-4089-a7cd-4cd2d090bd5d`
- Freelancer: Álvaro Romero (`2f9d2e6a-1f09-473b-a11f-00849690934b`)
- Proyecto: "Facebook Ads Campaign Q4" (`4f5e447d-9105-4255-b817-69922170cdb1`)
- Status: Pendiente
- Cliente: FLUVIP (`ce6ffb9c-03bf-4181-9417-154dfb653625`)

✅ **Los endpoints de API funcionan correctamente:**
- `/api/debug/proposals?freelancer_id=2f9d2e6a-1f09-473b-a11f-00849690934b` - Devuelve la propuesta
- `/api/debug/invitations?freelancer_id=2f9d2e6a-1f09-473b-a11f-00849690934b` - Devuelve la invitación
- `/api/debug/user?user_id=2f9d2e6a-1f09-473b-a11f-00849690934b` - Álvaro tiene rol 'freelancer'

❌ **El problema:**
Álvaro Romero **no está viendo las propuestas en su dashboard** porque:
1. Probablemente no está logueado en el navegador
2. O la sesión de autenticación no se está pasando correctamente al endpoint `/api/freelancer/proposals`

---

## Cómo Probar

### 1. Verificar que la propuesta existe en la BD

```bash
curl "http://localhost:3000/api/debug/proposals?freelancer_id=2f9d2e6a-1f09-473b-a11f-00849690934b"
```

**Respuesta esperada:**
```json
{
  "freelancer_id": "2f9d2e6a-1f09-473b-a11f-00849690934b",
  "proposal_count": 1,
  "proposals": [
    {
      "id": "ddfb967f-261c-4089-a7cd-4cd2d090bd5d",
      "project": {
        "id": "4f5e447d-9105-4255-b817-69922170cdb1",
        "title": "Facebook Ads Campaign Q4",
        "description": "Need an experienced Facebook Ads specialist...",
        "skills_required": ["Facebook Ads", "Social Media"],
        "allocated_budget": 500
      },
      "client": {
        "name": "FLUVIP",
        "email": "alvaroromero@fluvip.com"
      },
      "message": "",
      "status": "pending",
      "created_at": "2025-11-29T23:24:46.230233+00:00"
    }
  ]
}
```

### 2. Ver los datos de Álvaro

```bash
curl "http://localhost:3000/api/debug/user?user_id=2f9d2e6a-1f09-473b-a11f-00849690934b"
```

**Respuesta esperada:**
```json
{
  "user": {
    "id": "2f9d2e6a-1f09-473b-a11f-00849690934b",
    "email": "alvarovi24@gmail.com",
    "first_name": "Alvaro",
    "last_name": "Romero",
    "role": "freelancer",
    "company_name": null,
    "created_at": "2025-11-29T12:17:32.99451",
    "updated_at": "2025-11-29T12:17:32.99451",
    "avatar_url": null
  }
}
```

---

## Qué Necesita Hacer Álvaro

Para ver sus propuestas en el dashboard `/dashboard/freelancer`:

1. **Asegúrese de que está logueado como Álvaro Romero**
   - Email: `alvarovi24@gmail.com`
   - (Contraseña necesaria)

2. **Vaya a:** `http://localhost:3000/dashboard/freelancer`

3. **Debería ver** en la sección "Mis Propuestas":
   - Proyecto: "Facebook Ads Campaign Q4"
   - Cliente: "FLUVIP"
   - Estado: Pendiente ⏳

---

## Estructura del Código

### API Endpoint: `/api/freelancer/proposals`

**Archivo:** `src/app/api/freelancer/proposals/route.ts`

**Flujo:**
1. Verifica autenticación (obtiene session de NextAuth)
2. Verifica que el usuario sea freelancer
3. Consulta `project_invitations` tabla
4. Hace join con `projects` y `users` tablas
5. Formatea y devuelve propuestas

**Requisitos:**
- ✅ Usuario debe estar autenticado
- ✅ Usuario debe tener rol = 'freelancer'
- ✅ La sesión debe contener `user.id` correcto

### Dashboard Component: `/dashboard/freelancer`

**Archivo:** `src/app/dashboard/freelancer/page.tsx`

**Sección "Mis Propuestas":**
- Llama a `fetch("/api/freelancer/proposals")` en useEffect
- Muestra lista de propuestas con:
  - Título del proyecto
  - Descripción (primeros 100 chars)
  - Cliente
  - Estado (Pendiente/Aceptada/Rechazada)
- Estados de carga y error

---

## Debug Endpoints (Temporales)

**Ubicación:** `src/app/api/debug/`

| Endpoint | Query Params | Propósito |
|----------|--------------|-----------|
| `/api/debug/invitations` | `freelancer_id` | Ver invitaciones sin autenticación |
| `/api/debug/proposals` | `freelancer_id` | Ver propuestas sin autenticación |
| `/api/debug/user` | `user_id` | Ver datos de usuario |

**Nota:** Estos endpoints son TEMPORALES y deben eliminarse antes de ir a producción.

---

## Pasos Siguientes

1. **Asegurar que Álvaro está logueado**
   - Verificar que tiene sesión activa en el navegador
   - Revisar cookies de sesión en DevTools

2. **Verificar el endpoint /api/freelancer/proposals**
   - Ir a DevTools > Network
   - Cargar `/dashboard/freelancer`
   - Buscar la request a `/api/freelancer/proposals`
   - Ver el status (debería ser 200)
   - Ver la respuesta (debería contener la propuesta)

3. **Si hay error 401:**
   - Significa que Álvaro no está autenticado
   - Debe loguearse primero

4. **Si hay error 500:**
   - Revisar logs de servidor
   - El problema probablemente sea un query error en Supabase

---

## Lo Que YA Está Implementado

✅ **Base de Datos:**
- Tabla `project_invitations` con todas las propuestas
- Foreign keys correctas

✅ **API Backend:**
- Endpoint `/api/projects/[id]/invite` para crear invitaciones
- Endpoint `/api/freelancer/proposals` para listar propuestas
- Endpoint `/api/projects/[id]/invitations` para ver invitaciones enviadas

✅ **Frontend:**
- Sección "Mis Propuestas" en dashboard del freelancer
- UI bonita con estados visuales
- Loading y empty states

---

## Lo Que Falta (Features Futuras)

- [ ] Ver detalles completos de una propuesta
- [ ] Aceptar invitación y enviar oferta
- [ ] Rechazar invitación
- [ ] Mensajería entre cliente y freelancer pre-contrato
- [ ] Notificaciones en tiempo real

---

**Last Updated:** 30 de Noviembre, 2025
**Next Action:** Loguearse como Álvaro Romero y verificar que aparecen las propuestas
