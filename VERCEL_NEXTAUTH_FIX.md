# Fix: NextAuth Server Error en Vercel

**Problema:** `https://ad-marketplace-next-...vercel.app/api/auth/error`
**Error:** "There is a problem with the server configuration"

---

## Causa del Problema

NextAuth necesita que `NEXTAUTH_URL` sea configurado correctamente en Vercel:
- En **localhost**: `http://localhost:3000`
- En **Vercel**: `https://ad-marketplace-next-...vercel.app`

Si `NEXTAUTH_URL` no está configurado o es incorrecto, NextAuth falla al validar las URLs de callback.

---

## Solución: Configurar Variables en Vercel

### 1. **Ir al dashboard de Vercel**
   - Abre https://vercel.com/dashboard
   - Selecciona el proyecto "ad-marketplace-next"

### 2. **Ir a Settings → Environment Variables**
   - Click en "Settings"
   - Click en "Environment Variables"

### 3. **Agregar/Actualizar estas variables:**

#### NEXTAUTH_SECRET
- **Key:** `NEXTAUTH_SECRET`
- **Value:** Genera uno nuevo con:
  ```bash
  openssl rand -base64 32
  ```
  O si ya tienes uno en `.env.local`, usa ese mismo.
- **Environments:** Production, Preview, Development

#### NEXTAUTH_URL
- **Key:** `NEXTAUTH_URL`
- **Value:** `https://ad-marketplace-next-20p1iz6e6-alvaros-projects-7b6480b3.vercel.app`
  (O tu URL correcta de Vercel)
- **Environments:** Production, Preview, Development

#### NEXT_PUBLIC_SUPABASE_URL
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Tu URL de Supabase
- **Environments:** Production, Preview, Development

#### NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Tu clave anónima de Supabase
- **Environments:** Production, Preview, Development

#### SUPABASE_SERVICE_ROLE_KEY
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Tu clave de servicio de Supabase
- **Environments:** Production (solo)

#### STRIPE_SECRET_KEY (Opcional)
- **Key:** `STRIPE_SECRET_KEY`
- **Value:** Tu clave secreta de Stripe (si usas Stripe)
- **Environments:** Production (solo)

#### NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Opcional)
- **Key:** `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- **Value:** Tu clave pública de Stripe
- **Environments:** Production, Preview, Development

---

## Pasos Detallados en Vercel UI

1. **Login en Vercel:**
   - https://vercel.com/login

2. **Selecciona el proyecto:**
   - Haz click en "ad-marketplace-next"

3. **Abre Settings:**
   - Arriba del proyecto, click en "Settings"

4. **Abre Environment Variables:**
   - Left sidebar → "Environment Variables"

5. **Agrega cada variable:**
   - Click en "Add New"
   - Ingresa Key
   - Ingresa Value
   - Selecciona Environments (Production, Preview, Development)
   - Click en "Save"

6. **Redeploy el proyecto:**
   - Va a "Deployments"
   - Busca el último deploy
   - Click en los 3 puntos
   - Click en "Redeploy"

---

## Variables Que Necesitas

Obtén estos valores de:

### Supabase
1. https://app.supabase.com
2. Selecciona tu proyecto
3. Settings → API
4. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_ROLE_KEY`

### NextAuth Secret
```bash
# En tu terminal local:
openssl rand -base64 32

# O si usas Windows sin openssl:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Alternativa: Usar Vercel Environment Detection

NextAuth v5+ detecta automáticamente `VERCEL_URL` en Vercel.

Para que funcione automáticamente, **no necesitas** `NEXTAUTH_URL` si:
- Usas NextAuth v5+
- Verificas que en `src/auth.ts` no hay override manual de `NEXTAUTH_URL`

Pero es más seguro configurarlo explícitamente.

---

## Si Aún Hay Error

Si después de configurar las variables aún ves el error:

1. **Revisa los logs de Vercel:**
   - En Vercel, va a "Deployments"
   - Haz click en el deployment
   - Abre "Logs" → "Runtime Logs"
   - Busca errores

2. **Verifica NEXTAUTH_SECRET:**
   - Debe estar configurado
   - No puede estar vacío

3. **Verifica NEXTAUTH_URL:**
   - Debe ser EXACTAMENTE tu URL de Vercel
   - No debe tener `/` al final
   - Debe ser HTTPS (no HTTP)

4. **Revisa que Supabase está configurado:**
   - Las claves deben ser válidas
   - Supabase debe estar accesible

---

## Checklist Final

- [ ] NEXTAUTH_SECRET está configurado en Vercel
- [ ] NEXTAUTH_URL es tu URL de Vercel (HTTPS)
- [ ] NEXT_PUBLIC_SUPABASE_URL está configurado
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY está configurado
- [ ] SUPABASE_SERVICE_ROLE_KEY está configurado
- [ ] Hiciste Redeploy del proyecto
- [ ] Esperaste ~5 minutos para que los cambios apliquen

---

## Después de Arreglar

Una vez configurado, deberías poder:
1. ✅ Ir a `/sign-in` sin errores
2. ✅ Loguearte con tus credenciales
3. ✅ Acceder a `/dashboard/client` o `/dashboard/freelancer`

---

**Última Actualización:** 30 de Noviembre, 2025
**Próximo Paso:** Configurar las variables en Vercel y redeploy
