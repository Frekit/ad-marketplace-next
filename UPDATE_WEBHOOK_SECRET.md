# ⚠️ IMPORTANTE: Actualizar Webhook Secret

El webhook listener de Stripe está corriendo y ha generado un nuevo **webhook signing secret**.

## 🔑 Nuevo Webhook Secret:

```
whsec_fa66905315a99d08dc383a77bd40c537eddb38f3431d6caabd9c17d10e14cbef
```

## 📝 Pasos para actualizar:

1. **Abre tu archivo `.env.local`**

2. **Busca la línea que dice:**
   ```
   STRIPE_WEBHOOK_SECRET=whse...
   ```

3. **Reemplázala con:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_fa66905315a99d08dc383a77bd40c537eddb38f3431d6caabd9c17d10e14cbef
   ```

4. **Guarda el archivo**

## ✅ Estado Actual:

- ✅ Next.js corriendo en: `http://localhost:3000`
- ✅ Stripe webhook listener corriendo
- ✅ Webhook endpoint: `http://localhost:3000/api/stripe/webhook`
- ⏳ Esperando que actualices el webhook secret

## 🧪 Después de actualizar:

Una vez que actualices el secret, podrás ejecutar el test completo:

```bash
npx tsx scripts/test-full-flow.ts
```

El webhook debería procesar los eventos de Stripe y actualizar la base de datos automáticamente.

---

**Nota:** Este webhook secret es temporal y solo funciona mientras el `stripe listen` esté corriendo. Cada vez que reinicies el listener, obtendrás un nuevo secret.
