# 🧪 Guía de Prueba Manual - Sistema de Invitaciones

## Verificación en el Navegador

### 1. Accede como Freelancer
1. Ve a: `http://localhost:3001`
2. Inicia sesión con: **alvarovi24@gmail.com**
3. Navega a: `Mis Propuestas` o `http://localhost:3001/freelancer/proposals`

### 2. Deberías Ver 3 Invitaciones

Cada invitación debe mostrar:

#### Invitación 1 (más reciente)
- **Proyecto:** Facebook Ads Campaign Q4
- **De:** Alvaro Romero
- **Jornadas:** 20
- **Precio Total:** €1,500
- **Precio por Jornada:** €75
- **Tu Tarifa:** €25/día
- **Diferencia:** +200% (Verde - arriba de tu tarifa)
- **Hitos:** 4 definidos

#### Invitación 2
- **Proyecto:** Facebook Ads Campaign Q4
- **De:** Alvaro Romero
- **Jornadas:** 10
- **Precio Total:** €600
- **Precio por Jornada:** €60
- **Tu Tarifa:** €25/día
- **Diferencia:** +140% (Verde - arriba de tu tarifa)
- **Hitos:** 3 definidos

#### Invitación 3 (más antigua de las nuevas)
- **Proyecto:** Facebook Ads Campaign Q4
- **De:** Alvaro Romero
- **Jornadas:** 5
- **Precio Total:** €250
- **Precio por Jornada:** €50
- **Tu Tarifa:** €25/día
- **Diferencia:** +100% (Verde - arriba de tu tarifa)
- **Hitos:** 2 definidos

### 3. Haz Clic en una Invitación

Cuando hagas clic en cualquiera de las invitaciones, deberías ver:

✅ **Términos Propuestos**
- Número de Jornadas (no debería ser "Por definir")
- Precio Total (debería ser €250, €600 o €1,500)
- Precio por Jornada (debería ser €50, €60 o €75)

✅ **Comparación con Tu Tarifa**
- Tu tarifa diaria: €25
- Tarifa propuesta: €50-€75
- Diferencia: +100% a +200% (en verde)
- Mensaje: "Esta propuesta está por encima de tu tarifa"

✅ **Hitos Propuestos**
- Lista de hitos con nombre, descripción, monto y fecha de vencimiento

### 4. Troubleshooting

Si ves **"Por definir"** en los términos:
- Probablemente estás viendo una invitación antigua
- Las nuevas invitaciones deben mostrar los valores

Si ves el mensaje **"⚠️ Para ver la comparación con tu tarifa, por favor configúrala en tu perfil"**:
- Significa que tu tarifa diaria no está configurada (pero debería estar en €25)
- Verifica tu perfil: `http://localhost:3001/freelancer/profile-settings`

Si no ves **3 invitaciones nuevas**:
- Abre la consola del navegador (F12)
- Verifica que está haciendo fetch a `/api/freelancer/proposals`
- Debería retornar un array con 3 elementos

---

## 📊 Datos Esperados

### Base de Datos
```
Tabla: invitations

ID                                      | estimated_days | hourly_rate | suggested_milestones  | status
56b02aa8-bf54-4b63-90f7-be73bd22e0c5 | 20             | 75          | [4 hitos]             | pending
6980ef4a-9ba0-4af4-89fe-48635f9b9926 | 10             | 60          | [3 hitos]             | pending
194ce8fa-cb43-443f-8896-d6ad044dd538 | 5              | 50          | [2 hitos]             | pending
```

### API Response (GET /api/freelancer/proposals/[id]/proposal)
```json
{
  "id": "56b02aa8-bf54-4b63-90f7-be73bd22e0c5",
  "verification_status": "...",
  "freelancer_daily_rate": 25,
  "proposal": {
    "id": "56b02aa8-bf54-4b63-90f7-be73bd22e0c5",
    "project_id": "4f5e447d-9105-4255-b817-69922170cdb1",
    "duration": 20,
    "hourly_rate": 75,
    "total_amount": 1500,
    "price_per_day": 75,
    "price_difference_percent": 200,
    "status": "pending",
    "milestones": [...],
    "has_proposal": true
  },
  "project": { ... },
  "client": { ... }
}
```

---

## ✅ Checklist de Verificación

- [ ] Ves 3 invitaciones en `/freelancer/proposals`
- [ ] Cada invitación muestra jornadas (5, 10, 20)
- [ ] Cada invitación muestra precio total (€250, €600, €1,500)
- [ ] Cada invitación muestra precio por día (€50, €60, €75)
- [ ] La comparación muestra +100%, +140%, +200%
- [ ] El color de la diferencia es verde (positiva)
- [ ] Se muestran los hitos (2, 3, 4 en cada una)
- [ ] Al hacer clic en una, se cargan los detalles correctamente
- [ ] No hay errores en la consola del navegador

---

## 🔄 Reseteando las Pruebas

Para volver a crear las 3 invitaciones después de cambios:

```bash
npx tsx scripts/test-invitations.ts
```

Esto eliminará todas las invitaciones y creará 3 nuevas desde cero.
