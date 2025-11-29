# Configuración de Stripe para Desarrollo

## Paso 1: Crear Cuenta de Stripe (Gratis)

1. Ve a https://stripe.com
2. Click en "Sign up"
3. Completa el registro (no necesitas tarjeta de crédito)
4. Automáticamente estarás en **Test Mode** (modo de prueba)

## Paso 2: Obtener API Keys de Prueba

1. En el Dashboard de Stripe, ve a **Developers** → **API keys**
2. Verás dos claves en modo TEST:
   - **Publishable key**: `pk_test_...` (pública, va en frontend)
   - **Secret key**: `sk_test_...` (privada, va en backend)

## Paso 3: Configurar Variables de Entorno

Crea o actualiza tu archivo `.env.local`:

```env
# Stripe Test Keys
STRIPE_SECRET_KEY=sk_test_TU_CLAVE_SECRETA_AQUI
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_TU_CLAVE_PUBLICA_AQUI
STRIPE_WEBHOOK_SECRET=whsec_TU_WEBHOOK_SECRET_AQUI
```

## Paso 4: Configurar Webhooks Localmente

### Opción A: Usar Stripe CLI (Recomendado)

1. **Instalar Stripe CLI:**
   ```bash
   # Windows (con Chocolatey)
   choco install stripe-cli
   
   # O descargar desde: https://github.com/stripe/stripe-cli/releases
   ```

2. **Autenticar:**
   ```bash
   stripe login
   ```

3. **Escuchar webhooks:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   
   Esto te dará un `STRIPE_WEBHOOK_SECRET` que debes copiar a `.env.local`

### Opción B: Sin Stripe CLI (Desarrollo Básico)

Si no quieres instalar Stripe CLI ahora, puedes:
- Comentar temporalmente la verificación de webhooks
- Los depósitos funcionarán pero no se actualizará el balance automáticamente
- Puedes actualizar el balance manualmente en la base de datos

## Paso 5: Probar Pagos

### Tarjetas de Prueba

Usa estas tarjetas en el checkout de Stripe:

| Tarjeta | Número | Resultado |
|---------|--------|-----------|
| Visa exitosa | `4242 4242 4242 4242` | ✅ Pago exitoso |
| Visa con 3D Secure | `4000 0025 0000 3155` | ✅ Requiere autenticación |
| Visa rechazada | `4000 0000 0000 9995` | ❌ Pago rechazado |
| Mastercard | `5555 5555 5555 4444` | ✅ Pago exitoso |

**Datos adicionales:**
- **Fecha de expiración**: Cualquier fecha futura (ej: 12/25)
- **CVC**: Cualquier 3 dígitos (ej: 123)
- **Código postal**: Cualquiera (ej: 12345)

### SEPA Direct Debit (Transferencia Bancaria)

Para probar SEPA:
- **IBAN de prueba**: `DE89370400440532013000`
- **Nombre**: Cualquier nombre
- El pago se marca como "pendiente" y se completa después de unos segundos

## Paso 6: Verificar que Funciona

1. **Inicia tu aplicación:**
   ```bash
   npm run dev
   ```

2. **Ve a la página de Wallet:**
   - Inicia sesión como cliente
   - Click en "Depositar Fondos"
   - Ingresa un monto (ej: €100)
   - Click en "Depositar"

3. **En Stripe Checkout:**
   - Usa tarjeta `4242 4242 4242 4242`
   - Completa el pago

4. **Verifica en Stripe Dashboard:**
   - Ve a **Payments** en Stripe
   - Deberías ver el pago de prueba

5. **Verifica en tu App:**
   - Si los webhooks están configurados, el balance se actualiza automáticamente
   - Revisa la consola del servidor para ver los logs

## Troubleshooting

### Error: "STRIPE_SECRET_KEY is not set"
- Asegúrate de que `.env.local` existe
- Reinicia el servidor de desarrollo (`npm run dev`)

### Webhook no funciona
- Verifica que Stripe CLI esté corriendo: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- Copia el webhook secret que aparece en la terminal
- Actualiza `STRIPE_WEBHOOK_SECRET` en `.env.local`

### Balance no se actualiza
- Revisa la consola del servidor para ver errores
- Verifica que las funciones SQL estén creadas en Supabase
- Ejecuta el archivo `database/wallet-schema.sql` en Supabase

## Modo Producción (Cuando estés listo)

1. En Stripe Dashboard, activa tu cuenta (requiere verificación de negocio)
2. Cambia a **Live Mode** (toggle en la esquina superior derecha)
3. Obtén las claves de producción (sin `_test`)
4. Actualiza las variables de entorno en tu servidor de producción
5. Configura webhooks en producción (Stripe Dashboard → Webhooks)

## Recursos

- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)
- [Webhook Testing](https://stripe.com/docs/webhooks/test)
