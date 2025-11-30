# SendGrid Sandbox Mode Setup

## 🎯 Objetivo
Usar SendGrid en modo Sandbox para testing sin dominio verificado.

---

## 📋 PASOS RÁPIDOS

### 1. Crear Cuenta SendGrid

1. Ir a https://sendgrid.com
2. Hacer clic en **"Sign Up Free"**
3. Rellenar formulario:
   - Email: tu email
   - Password: contraseña segura
   - Company: tu nombre/proyecto
4. Verificar email (check inbox)
5. Confirmar teléfono (SMS)

### 2. Obtener API Key

1. Login en https://app.sendgrid.com
2. Ir a **Settings** → **API Keys** (izquierda)
3. Hacer clic **"Create API Key"**
4. Nombre: `Development Sandbox`
5. Permisos: Seleccionar **"Full Access"**
6. Click **"Create & Copy"**
7. Copiar la clave: `SG.xxxxxxxxxxxxxxxxxxxxx`

⚠️ **IMPORTANTE:** Solo se muestra una vez. Guarda en lugar seguro.

### 3. Activar Sandbox Mode

1. En Dashboard, ir a **Settings** → **Mail Send** (izquierda)
2. Buscar **"Sandbox Mode"**
3. Toggle el switch para **activar** (debe estar en azul)
4. Click **"Save"**

✅ Ahora todos los emails se envían a Sandbox (no a buzones reales)

### 4. Configurar Variables de Entorno

**En tu `.env.local`:**

```bash
# SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@malt.local
SENDGRID_FROM_NAME="malt - Ad Marketplace"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Reemplaza:**
- `SG.xxxxxxxxxxxxxxxxxxxxx` con tu API Key real
- `noreply@malt.local` puede ser cualquier email (no necesita verificación en Sandbox)

### 5. Reiniciar la App

```bash
npm run dev
```

Esperar a que diga "✓ Ready in Xxxms"

---

## 🧪 PROBAR QUE FUNCIONA

### Opción A: Crear una Invitación de Proyecto (Manual)

1. Ir a http://localhost:3000
2. Login como cliente
3. Crear un nuevo proyecto
4. Invitar un freelancer
5. En la consola del servidor (terminal), deberías ver:
   ```
   [Email Mock] To: freelancer@example.com
   [Email Mock] Subject: Invitación a proyecto: ...
   [Email Mock] Preview: <!DOCTYPE html>...
   ```

### Opción B: Ejecutar Script de Testing

```bash
npm run test:sendgrid
```

(El script aún no existe, ver abajo)

### Verificar en SendGrid Dashboard

1. Ir a https://app.sendgrid.com
2. Ir a **Activity Feed** (izquierda, bajo "Monitoring")
3. Deberías ver los emails "enviados" (con status "Sent" aunque sea Sandbox)
4. Click en un email para ver detalles (To, Subject, HTML, etc.)

---

## 📧 EMAIL TEMPLATES QUE FUNCIONAN

Con Sandbox Mode, estos emails se "envían" correctamente:

- ✅ **Project Invitation** - Cuando empresa invita freelancer
- ✅ **Proposal Response** - Cuando freelancer responde
- ✅ **Offer Accepted** - Cuando empresa acepta oferta
- ✅ **Chat Message** - Cuando hay mensaje nuevo en chat

---

## 🔄 FLUJO COMPLETO DE TESTING

```
1. Login como CLIENTE
   ↓
2. Crear PROYECTO
   ↓
3. Invitar FREELANCER
   ↓
4. Revisar consola → Ver [Email Mock] To: freelancer@...
   ↓
5. Revisar SendGrid Activity Feed → Ver email "enviado"
   ↓
6. Login como FREELANCER (otra ventana/incognito)
   ↓
7. Ver invitación en /freelancer/proposals
   ↓
8. Responder/negociar en chat
   ↓
9. Enviar oferta formal
   ↓
10. Ver notificación en Activity Feed nuevamente
```

---

## 📝 NOTAS IMPORTANTES

### Sobre Sandbox Mode

- **Los emails NO llegan a buzones reales** (propósito del testing)
- **Solo se registran en Activity Feed**
- **Perfecto para desarrollo**
- **0 límite de emails en Sandbox**

### Cambiar a Producción Después

Cuando tengas dominio verificado:

1. Ir a **Settings → Mail Send**
2. Toggle Sandbox Mode **OFF**
3. Verificar tu dominio en **Settings → Sender Authentication**
4. **El código NO cambia**, solo el .env

### API Key Seguridad

- Nunca commits SENDGRID_API_KEY al repo
- Usar .env.local (incluido en .gitignore)
- En Vercel, configurar en Environment Variables

---

## 🐛 TROUBLESHOOTING

**P: No veo emails en Activity Feed**
R:
- Asegúrate que Sandbox Mode está activado (toggle azul)
- Espera 10 segundos y refresh
- Revisar consola del servidor para [Email Mock]

**P: Dice "SendGrid not available"**
R:
- Verificar que `@sendgrid/mail` está instalado: `npm list @sendgrid/mail`
- Revisar SENDGRID_API_KEY en .env.local
- Reiniciar servidor: `Ctrl+C` y `npm run dev`

**P: Los emails dicen "Failed" en Activity Feed**
R:
- Verificar API Key es correcta (sin espacios)
- En Sandbox, esto es normal (propósito del testing)
- Ver detalles del error en Activity Feed

**P: ¿Los usuarios ven que recibieron email?**
R:
- **NO**, en Sandbox Mode solo ves en Activity Feed
- Es propósito de testing
- En producción sí llegan a buzones reales

---

## ✅ CHECKLIST FINAL

- [ ] Cuenta SendGrid creada
- [ ] Email verificado
- [ ] Teléfono confirmado
- [ ] API Key copiada
- [ ] Sandbox Mode activado (toggle azul)
- [ ] SENDGRID_API_KEY en .env.local
- [ ] SENDGRID_FROM_EMAIL en .env.local
- [ ] Servidor reiniciado (`npm run dev`)
- [ ] Probé invitando a un freelancer
- [ ] Vi el email en Activity Feed

---

## 🎉 ¡LISTO!

Ahora SendGrid está configurado en Sandbox Mode y puedes:
- ✅ Probar todo el flujo de negociación
- ✅ Ver emails en Activity Feed
- ✅ Verificar templates HTML
- ✅ Desarrollar sin afectar buzones reales

Cuando pases a producción, solo cambia:
- Verificar tu dominio
- Desactivar Sandbox Mode
- El código sigue igual
