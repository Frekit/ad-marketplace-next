# 🚀 QUICK START - Dashboard Admin

## En 5 Minutos

### 1. Ejecuta las Migrations en Supabase
```
Ve a: Supabase Dashboard → Tu Proyecto → SQL Editor
Copia TODO el contenido de: SUPABASE_ADMIN_SETUP.sql
Pega en SQL Editor y presiona "Run"
```

### 2. Agrega tu Email como Admin
En Supabase SQL Editor, ejecuta:
```sql
INSERT INTO admin_users (email, name, role, is_active) 
VALUES ('tu-email@gmail.com', 'Tu Nombre', 'admin', true)
ON CONFLICT (email) DO NOTHING;
```

### 3. Reinicia el Servidor
```bash
# Si está corriendo, presiona CTRL+C
# Luego vuelve a iniciar
npm run dev
```

### 4. Login y Prueba
1. Ve a http://localhost:3000
2. Inicia sesión con tu email
3. Navega a http://localhost:3000/admin/dashboard
4. ¡Listo! Deberías ver el dashboard con gráficos

---

## 📸 Qué Verás

### Dashboard Principal
- 5 tarjetas KPI: Total Invoices, Pendientes, Revenue, Usuarios
- 2 Gráficos: Pie Chart (invoices), Bar Chart (usuarios)
- Botones de navegación rápida

### Página de Invoices
- Lista de todas las invoices
- Búsqueda por freelancer/proyecto
- Filtros por estado
- Botones Aprobar/Rechazar

---

## 🔗 URLs Disponibles

| URL | Descripción |
|-----|-------------|
| `/admin/dashboard` | Dashboard con gráficos |
| `/admin/invoices` | Gestión de invoices |
| `/api/admin/stats` | API de estadísticas |
| `/api/admin/invoices` | API de invoices |

---

## ❌ Si No Funciona

### "No puedo acceder a /admin/dashboard"
**Solución:** Verifica que tu email está en `admin_users` como admin:
```sql
SELECT * FROM admin_users WHERE email = 'tu-email@gmail.com';
```
Debe tener `is_active = true`

### "Los gráficos no se muestran"
**Solución:** Reinicia el servidor. Recharts necesita que se rebuild:
```bash
npm run dev
```

### "Error: Cannot find module 'recharts'"
**Solución:** Instala la dependencia:
```bash
npm install recharts
```

---

## 💡 Customización Rápida

### Cambiar Colores
En `src/app/admin/dashboard/page.tsx`, busca:
```tsx
border-l-blue-500  // Cambia a border-l-green-500, etc
text-blue-600     // Cambia a text-green-600, etc
fill="#FFA500"    // Cambia el color del gráfico
```

### Agregar Más Estadísticas
1. Agrega campo en `Stats` type
2. Actualiza `/api/admin/stats`
3. Agrega una nueva Card en el dashboard

### Cambiar Frecuencia de Actualización
En el dashboard, el `useEffect` se ejecuta once. Para auto-actualizar cada 30 segundos:
```tsx
useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
}, [])
```

---

## 🎯 Próximos Pasos

Después de que funcione el dashboard:

1. **Crear página de Users** - Gestionar usuarios
2. **Crear página de Settings** - Agregar/remover admins
3. **Agregar Reportes** - Exportar datos
4. **Mejorar Búsqueda** - En tiempo real

---

## 📚 Archivos Importantes

- `ADMIN_DASHBOARD_SETUP.md` - Guía completa
- `SUPABASE_ADMIN_SETUP.sql` - Migrations
- `src/app/admin/dashboard/page.tsx` - Dashboard
- `src/app/api/admin/stats/route.ts` - API de stats

---

## ✅ Checklist Final

- [ ] Migrations ejecutadas en Supabase
- [ ] Email agregado como admin
- [ ] Servidor reiniciado
- [ ] Puedo acceder a `/admin/dashboard`
- [ ] Los gráficos se muestran
- [ ] Puedo ver invoices en `/admin/invoices`
- [ ] Puedo filtrar invoices

¡Si todo funciona, ¡felicidades! 🎉
