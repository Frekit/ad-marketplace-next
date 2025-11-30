# Fix: "No se pudo cargar la propuesta" Error

**Problema:** Al hacer click en "Ver Detalles y Enviar Oferta" en la página de propuestas, aparecía el error "No se pudo cargar la propuesta"

**Ruta afectada:** `/freelancer/proposals/[id]`

**Ejemplo:** https://ad-marketplace-next-...vercel.app/freelancer/proposals/ddfb967f-261c-4089-a7cd-4cd2d090bd5d

---

## Causa del Problema

El endpoint `/api/freelancer/proposals/[id]` estaba intentando acceder a campos incorrectos en la tabla `users`:

**Código anterior (INCORRECTO):**
```typescript
client:users!project_invitations_client_id_fkey (
    id,
    name,           // ❌ Este campo NO existe
    email
)
```

**La tabla `users` tiene:**
- `first_name`
- `last_name`
- `company_name`

**NO tiene:**
- `name`

---

## Solución Implementada

**Cambios en `/api/freelancer/proposals/[id]/route.ts`:**

1. **Cambié los campos de `users`:**
   ```typescript
   client:users!project_invitations_client_id_fkey (
       id,
       first_name,      // ✅ Correcto
       last_name,       // ✅ Correcto
       email,
       company_name     // ✅ Agregado
   )
   ```

2. **Mejoré el formateo del nombre del cliente:**
   ```typescript
   const clientData = Array.isArray(invitation.client) ? invitation.client[0] : invitation.client;
   const clientName = clientData?.company_name ||
                    `${clientData?.first_name || ''} ${clientData?.last_name || ''}`.trim() ||
                    'Cliente';
   ```

3. **Agregué mejor manejo de errores:**
   ```typescript
   if (error || !invitation) {
       console.error('Database error:', error);  // ✅ Logging más detallado
       return NextResponse.json(
           { error: 'Proposal not found' },
           { status: 404 }
       );
   }
   ```

4. **Agregué `allocated_budget` a project data:**
   ```typescript
   project:projects (
       id,
       title,
       description,
       skills_required,
       allocated_budget,  // ✅ Agregado
       created_at
   )
   ```

---

## Cambios Realizados

**Archivos modificados:**
- `src/app/api/freelancer/proposals/[id]/route.ts`

**Commits:**
- `6d11fa1` - fix: correct field names in proposal details API endpoint

---

## Cómo Probarlo

### En Localhost (Ya funciona)
1. Asegúrate de estar logueado como freelancer
2. Ve a `/freelancer/proposals`
3. Haz click en "Ver Detalles y Enviar Oferta"
4. Deberías ver los detalles del proyecto sin error

### En Vercel (Necesita Redeploy)
1. El cambio ya está en GitHub
2. **Necesitas hacer Redeploy en Vercel** para que aplique
3. Una vez redeployed, los detalles de la propuesta cargarán correctamente

---

## Problemas Similares Corregidos

También se corrigió el mismo problema en:
- `/api/freelancer/proposals` (GET lista de propuestas)
- Ambos endpoints ahora usan los campos correctos de `users`

---

## Resultado Esperado

Después del redeploy en Vercel, cuando hagas click en "Ver Detalles y Enviar Oferta":

✅ Se cargará la propuesta
✅ Verás el título del proyecto
✅ Verás la descripción
✅ Verás el nombre del cliente (FLUVIP, si es cliente empresa)
✅ Verás los hitos para enviar tu oferta
✅ Podrás escribir una carta de presentación y proponer hitos

---

## Próximos Pasos

1. **Redeploy en Vercel:**
   - https://vercel.com/dashboard
   - Selecciona "ad-marketplace-next"
   - Deployments → Redeploy

2. **Verifica que funciona:**
   - Ve a `/freelancer/proposals`
   - Haz click en "Ver Detalles y Enviar Oferta"
   - Debería cargar correctamente

3. **Si aún falla:**
   - Revisa los logs de Vercel (Runtime Logs)
   - Verifica que NEXTAUTH_URL está configurado
   - Verifica que Supabase está accesible

---

**Última Actualización:** 30 de Noviembre, 2025
**Status:** ✅ Código corregido, pendiente redeploy en Vercel
