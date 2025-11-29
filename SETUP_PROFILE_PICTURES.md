# Setup Guide - Profile Picture Upload

## Paso 1: Ejecutar Migración de Base de Datos ✅

### Opción A: Desde Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Click en tu proyecto
3. En el menú lateral: **SQL Editor**
4. Click **New Query**
5. Copia y pega este SQL:

```sql
-- Add avatar_url column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add avatar_url column to freelancer_profiles table (optional)
ALTER TABLE freelancer_profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

6. Click **Run** (o presiona Ctrl+Enter)
7. Deberías ver: "Success. No rows returned"

### Opción B: Desde archivo local

Si tienes Supabase CLI instalado:
```bash
supabase db push
```

---

## Paso 2: Crear Storage Bucket 📦

1. En Supabase Dashboard, ve a **Storage** (menú lateral)
2. Click **Create a new bucket**
3. Configura:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **SÍ** (muy importante)
   - **File size limit**: `5242880` (5MB en bytes)
   - **Allowed MIME types**: `image/jpeg,image/png,image/webp`

4. Click **Create bucket**

---

## Paso 3: Configurar RLS Policies 🔒

1. En Storage, click en el bucket **avatars**
2. Ve a la pestaña **Policies**
3. Click **New Policy**

### Policy 1: Upload (INSERT)
- **Policy name**: `Users can upload their own avatar`
- **Allowed operation**: INSERT
- **Target roles**: authenticated
- **USING expression**: (dejar vacío)
- **WITH CHECK expression**:
```sql
bucket_id = 'avatars'
```

Click **Review** → **Save policy**

### Policy 2: Read (SELECT)
- **Policy name**: `Avatars are publicly accessible`
- **Allowed operation**: SELECT
- **Target roles**: public
- **USING expression**:
```sql
bucket_id = 'avatars'
```

Click **Review** → **Save policy**

### Policy 3: Update
- **Policy name**: `Users can update their own avatar`
- **Allowed operation**: UPDATE
- **Target roles**: authenticated
- **USING expression**:
```sql
bucket_id = 'avatars'
```

Click **Review** → **Save policy**

### Policy 4: Delete
- **Policy name**: `Users can delete their own avatar`
- **Allowed operation**: DELETE
- **Target roles**: authenticated
- **USING expression**:
```sql
bucket_id = 'avatars'
```

Click **Review** → **Save policy**

---

## Paso 4: Verificar Setup ✓

### Verificar migración:
En SQL Editor, ejecuta:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'avatar_url';
```

Deberías ver:
```
column_name | data_type
avatar_url  | text
```

### Verificar bucket:
1. Ve a Storage → avatars
2. Intenta subir un archivo de prueba manualmente
3. Si funciona, el bucket está bien configurado

---

## Paso 5: Probar en la App 🧪

1. Inicia tu app: `npm run dev`
2. Ve a: `http://localhost:3000/onboarding/freelancer/profile-picture`
3. Arrastra una imagen
4. Deberías ver:
   - Preview de la imagen
   - Mensaje "¡Imagen subida correctamente!"

### Verificar en BD:
```sql
SELECT id, email, avatar_url 
FROM users 
WHERE avatar_url IS NOT NULL 
LIMIT 5;
```

### Verificar en Storage:
Storage → avatars → Deberías ver tu archivo

---

## 🐛 Troubleshooting

### Error: "new row violates check constraint"
**Solución**: El bucket no es público. Ve a Storage → avatars → Settings → Make public

### Error: "Permission denied"
**Solución**: Falta alguna RLS policy. Revisa el Paso 3.

### Error: "Bucket not found"
**Solución**: El bucket no se llama exactamente `avatars`. Verifica el nombre.

### La imagen no se muestra
**Solución**: 
1. Verifica que el bucket es público
2. Abre la URL del avatar directamente en el navegador
3. Verifica CORS en Supabase Settings

---

## ✅ Checklist Final

- [ ] Migración ejecutada (avatar_url en users)
- [ ] Bucket `avatars` creado
- [ ] Bucket configurado como público
- [ ] 4 RLS policies creadas
- [ ] Probado upload desde la app
- [ ] Imagen visible en Storage
- [ ] URL guardada en BD

---

**¿Necesitas ayuda con algún paso específico?**
