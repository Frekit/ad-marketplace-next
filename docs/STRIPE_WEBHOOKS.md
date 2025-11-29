# Instalación y Configuración de Stripe CLI para Webhooks

## Paso 1: Descargar Stripe CLI

### Opción A: Descarga Manual (Recomendado para Windows)

1. **Descargar el ejecutable:**
   - Ve a: https://github.com/stripe/stripe-cli/releases/latest
   - Descarga: `stripe_X.X.X_windows_x86_64.zip`

2. **Extraer y mover:**
   ```powershell
   # Extrae el archivo ZIP
   # Mueve stripe.exe a una carpeta en tu PATH, por ejemplo:
   # C:\Program Files\Stripe\
   ```

3. **Agregar al PATH (opcional):**
   - Busca "Variables de entorno" en Windows
   - Edita la variable PATH
   - Añade la ruta donde pusiste `stripe.exe`

### Opción B: Con Chocolatey

Si tienes Chocolatey instalado:
```powershell
choco install stripe-cli
```

### Opción C: Con Scoop

Si tienes Scoop instalado:
```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

---

## Paso 2: Autenticar Stripe CLI

Una vez instalado, abre una **nueva terminal PowerShell** y ejecuta:

```powershell
stripe login
```

Esto abrirá tu navegador para autenticar. Sigue estos pasos:
1. Se abrirá una página de Stripe
2. Click en **"Allow access"**
3. Verás un mensaje de confirmación
4. Vuelve a la terminal

---

## Paso 3: Iniciar el Listener de Webhooks

En una **terminal separada** (déjala corriendo), ejecuta:

```powershell
cd C:\Users\alvar\.gemini\antigravity\scratch\ad-marketplace-next
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

**Importante:** Verás algo como esto:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

**Copia ese valor** que empieza con `whsec_`

---

## Paso 4: Actualizar Variables de Entorno

1. **Abre `.env.local`** en tu editor
2. **Actualiza la línea:**
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_el_valor_que_copiaste
   ```
3. **Guarda el archivo**

---

## Paso 5: Reiniciar el Servidor de Desarrollo

En tu terminal donde corre `npm run dev`:

```powershell
# Detener el servidor (Ctrl+C)
# Reiniciar
npm run dev
```

---

## Paso 6: Probar el Flujo Completo

Ahora sí, todo debería funcionar:

1. **Ve a** http://localhost:3000
2. **Inicia sesión** como cliente
3. **Ve a Wallet**
4. **Deposita €100** con tarjeta `4242 4242 4242 4242`
5. **Completa el pago**
6. **Vuelve al wallet** → ¡El balance debería actualizarse automáticamente! 🎉

---

## Verificar que Funciona

### En la Terminal de Stripe CLI

Deberías ver mensajes como:
```
2024-01-15 10:30:00   --> checkout.session.completed [evt_xxx]
2024-01-15 10:30:01   <-- [200] POST http://localhost:3000/api/stripe/webhook [evt_xxx]
```

### En la Consola del Servidor

Deberías ver:
```
✅ Deposit completed: €100 for user abc-123
```

### En tu Wallet

El balance debería mostrar:
- **Total Depositado:** €100
- **Balance Disponible:** €100
- **Balance Bloqueado:** €0

---

## Troubleshooting

### "stripe: command not found"
- Reinicia la terminal después de instalar
- Verifica que stripe.exe esté en el PATH
- Intenta ejecutar con ruta completa: `C:\ruta\a\stripe.exe login`

### "Failed to verify webhook signature"
- Verifica que el `STRIPE_WEBHOOK_SECRET` en `.env.local` sea correcto
- Asegúrate de que Stripe CLI esté corriendo
- Reinicia el servidor de desarrollo

### El webhook no se dispara
- Verifica que Stripe CLI esté corriendo: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Verifica que el puerto sea el correcto (3000)
- Revisa la consola de Stripe CLI para ver errores

### Balance no se actualiza
- Revisa la consola del servidor para ver errores
- Verifica que las funciones SQL estén creadas en Supabase
- Ejecuta `database/wallet-schema.sql` en Supabase si no lo has hecho

---

## Mantener Stripe CLI Corriendo

**Importante:** Stripe CLI debe estar corriendo mientras desarrollas.

Necesitarás **3 terminales abiertas:**
1. **Terminal 1:** `npm run dev` (servidor Next.js)
2. **Terminal 2:** `stripe listen --forward-to localhost:3000/api/stripe/webhook` (webhooks)
3. **Terminal 3:** Para ejecutar comandos

---

## Alternativa: Sin Stripe CLI (Temporal)

Si no quieres instalar Stripe CLI ahora:

1. **Comenta la verificación de firma** en `src/app/api/stripe/webhook/route.ts`:
   ```typescript
   // Comentar estas líneas temporalmente:
   // event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
   
   // Y usar:
   event = JSON.parse(body);
   ```

2. **Nota:** Esto es **solo para desarrollo**. En producción SIEMPRE debes verificar la firma.

---

## Próximos Pasos

Una vez que los webhooks funcionen:
- ✅ Los depósitos actualizarán el balance automáticamente
- ✅ Podrás crear proyectos y asignar presupuesto
- ✅ Los pagos a freelancers funcionarán correctamente
