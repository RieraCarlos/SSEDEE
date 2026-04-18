# 📋 Guía: Sistema Inteligente de Faltas en Futsal

## 🎯 Objetivo
Implementar un sistema de faltas que otorgue tiros libres automáticos después de la 6ta falta, reiniciando el contador en cada período.

---

## 📊 Estados del Sistema

### **Estado 1: Conteo Normal (Faltas 1-5)**
```
Visual: Gris o Amarillo (según cantidad)
count: 1, 2, 3, 4, 5
atLimit: false
isAutoFreeThrow: false
Acción: Solo se registra la falta
```

### **Estado 2: Límite Alcanzado (Falta 6)**
```
Visual: Rojo pulsante | ⚠️ "Límite: Otorgar Tiro Libre"
count: 6
atLimit: true ← MODAL APARECE
isAutoFreeThrow: false
Acción: Admin debe confirmar tiro libre
```

### **Estado 3: Tiro Libre Automático (Faltas 7+)**
```
Visual: Naranja | ⚡ "Auto Tiro Libre Activo" + badge "AUTO"
count: 7, 8, 9, ...
atLimit: false
isAutoFreeThrow: true ← SISTEMA AUTO-GENERA TIRO LIBRE
Acción: Cada nueva falta genera automáticamente un tiro libre
```

### **Estado 4: Reinicio de Período**
```
Acción: Admin avanza período (botón "Siguiente Fase" o "Comenzar")
Resultado: count resetea a 0, reinicia desde Estado 1
```

---

## 🧪 Cómo Probar

### **Test 1: Contador Lineal**
1. Abre un partido de Futsal
2. Registra falta → count = 1
3. Registra falta → count = 2
4. ... continúa hasta 6
5. ✅ Verifica que NO resetee en 6

### **Test 2: Modal de Confirmación**
1. Registra la 6ta falta
2. ✅ Modal aparece: "⚠️ Límite de Faltas"
3. Click en "Confirmar Tiro Libre"
4. ✅ Se registra evento TIRO_LIBRE_6_FALTAS

### **Test 3: Tiro Libre Automático**
1. Después de confirmar el tiro libre en falta 6
2. Registra otra falta (7ma)
3. ✅ count = 7, indicador naranja "⚡ Auto Tiro Libre Activo"
4. Registra otra falta (8va)
5. ✅ count = 8, sigue en modo auto

### **Test 4: Reinicio de Período**
1. Con count = 7 u 8 en período 1
2. Click en botón "Siguiente Fase"
3. Confirma en modal de avance
4. ✅ Período cambia a 2, count resetea a 0
5. Indicador vuelve a gris

### **Test 5: Reinicio de Múltiples Períodos**
1. Sigue Test 4 pero continúa a período 3, 4, etc.
2. ✅ Cada período reinicia en count = 0

---

## 🔧 Archivos Modificados

### `/src/hooks/useFutsalRules.ts`
**Cambios:**
- Lógica mejorada para contar faltas linealmente
- Nuevo campo: `isAutoFreeThrow` (true cuando count > 6)
- Comentarios detallados sobre el flujo

**Lógica Clave:**
```typescript
const localAtLimit = localFoulCount === 6 && localFreeThrows.length === 0;
const localInAutoFreeThrow = localFoulCount > 6;
```

### `/src/pages/Live/Scoreboard.tsx`
**Cambios:**
- Indicador visual para `isAutoFreeThrow` (naranja + "AUTO")
- Dos alertas separadas: "Límite" vs "Auto Tiro Libre"

**Clases de Color:**
- `red-500`: atLimit (rojo pulsante)
- `orange-500`: isAutoFreeThrow (naranja pulsante)
- `yellow-500`: Advertencia (4-5 faltas)
- `gray-400`: Normal (0-3 faltas)

---

## 🔄 Flujo Completo de Base de Datos

```
1. Admin registra falta
   ↓
2. logEvent('falta', 'local', ...) en useLiveMatch.ts
   ↓
3. Inserta en tabla 'partidos_sucesos'
   tipo: 'falta'
   periodo: currentPeriod
   ↓
4. Realtime (Supabase) dispara addLiveEvent en Redux
   ↓
5. useFutsalRules recalcula foulState
   ↓
6. Si count === 6 → atLimit = true
   Modal aparece y espera confirmación
   ↓
7. Admin confirma
   ↓
8. confirmTiroLibre() registra nuevo evento
   tipo: 'TIRO_LIBRE_6_FALTAS'
   ↓
9. Si Admin registra falta 7 → isAutoFreeThrow = true
   Indicador naranja aparece
```

---

## 🎮 Controles en la UI

| Acción | Resultado |
|--------|-----------|
| Registrar falta 1-5 | count aumenta, sin modal |
| Registrar falta 6 | Modal aparece (si atLimit) |
| Click "Confirmar Tiro Libre" | TIRO_LIBRE_6_FALTAS registrado |
| Registrar faltas 7+ | count aumenta, modo auto (naranja) |
| Click "Siguiente Fase" | Cambio de período, count resetea a 0 |

---

## 🚀 Próximas Mejoras (Opcional)

1. **Auto-registrar TIRO_LIBRE_6_FALTAS automáticamente** cuando count pase de 6 a 7
   - Actualmente requiere confirmación manual del admin
   
2. **Visualización de historial** de tiros libres otorgados por período
   - Mostrar badge con cantidad: "3 TL otorgados"

3. **Estadísticas avanzadas**
   - Gráfico de faltas por equipo a lo largo del partido
   - Promedio de faltas por período

4. **Sonido de alerta** cuando se alcanza el límite (opcional)

---

## 📚 Referencias

- **Reglas de Futsal CONMEBOL**: 6 faltas acumuladas = Tiro Libre Directo
- **Período**: Cada tiempo reinicia el contador a 0
- **Tiro Libre**: No resetea el contador, solo marca que se otorgó

---

## ✅ Checklist de Validación

- [ ] Contador llega hasta 6 sin resetear
- [ ] Modal aparece en falta 6
- [ ] Indicador "Auto" aparece en faltas 7+
- [ ] Cambio de período resetea a 0
- [ ] Múltiples períodos funcionan correctamente
- [ ] Base de datos registra todos los eventos
- [ ] Reportes PDF incluyen faltas y tiros libres

---

**Última actualización**: 17 Abril 2026
**Sistema**: Futsal (Fútbol Sala)
**Desarrollador**: GitHub Copilot
