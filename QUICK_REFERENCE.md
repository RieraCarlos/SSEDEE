# 🚀 GUÍA RÁPIDA - Sistema de Faltas Futsal

## ⏱️ Referencia Rápida (30 segundos)

### El Problema ❌
Después de 6 faltas en futsal, se debe otorgar tiro libre. Pero el contador no debe resetear; cada nueva falta generará un tiro libre automáticamente. Todo esto debe reiniciarse al cambiar de período.

### La Solución ✅
Contador lineal (0-6-7-8...) que:
1. En falta 6 → Modal para confirmar
2. En faltas 7+ → Auto-tiro libre (sin modal)
3. En nuevo período → Reset a 0

---

## 🎨 Indicadores Visuales

```
┌──────────────────────────────┐
│ 0-3   │ GRIS     │ Normal     │
│ 4-5   │ AMARILLO │ Alerta     │
│ 6     │ ROJO ⚠️  │ Límite     │
│ 7+    │ NARANJA⚡│ Auto TL    │
└──────────────────────────────┘
```

---

## 🔧 Código Principal

### Archivo: `src/hooks/useFutsalRules.ts`

```typescript
// El contador es lineal, sin resets
const localFoulCount = localFouls.length;

// Estados booleanos
const localAtLimit = localFoulCount === 6 && localFreeThrows.length === 0;
const localInAutoFreeThrow = localFoulCount > 6;

return {
  local: {
    count: localFoulCount,          // ← 1, 2, 3, 4, 5, 6, 7, 8...
    atLimit: localAtLimit,          // ← true solo en 6
    isAutoFreeThrow: localInAutoFreeThrow, // ← true en 7+
    freeThrowsAwarded: localFreeThrows.length,
  }
}
```

---

## 📋 Estados en Tablero

| count | atLimit | isAutoFreeThrow | Visual | Acción |
|-------|---------|-----------------|--------|--------|
| 1-5 | false | false | Gris/Amarillo | Solo registra |
| 6 | **true** | false | Rojo pulsante | Modal aparece |
| 7-∞ | false | **true** | Naranja pulsante | Auto-TL |

---

## 🧪 Testing en 3 Pasos

```
1. Abre partido futsal
   ↓
2. Registra 6 faltas → count=6, modal aparece
   ↓
3. Confirma → count=7, naranja, "Auto Tiro Libre Activo"
   ↓
4. Avanza período → count=0 automáticamente
```

---

## 📁 Archivos Tocados

```
✏️ src/hooks/useFutsalRules.ts      ← Lógica de conteo
✏️ src/pages/Live/Scoreboard.tsx    ← Indicadores visuales
📄 FUTSAL_FOULS_GUIDE.md            ← Guía completa
📄 CAMBIOS_SISTEMA_FALTAS.md        ← Detalles técnicos
📄 COMPARATIVA_ANTES_DESPUES.md     ← Por qué cambió
```

---

## ❓ FAQ

**P: ¿Por qué en faltas 7+ no aparece modal?**  
R: Porque `atLimit` solo es true cuando `count === 6 exactamente`. En 7+ es false, por eso el modal no aparece.

**P: ¿Cómo reinicia en nuevo período?**  
R: `useFutsalRules` filtra eventos por `periodo === currentPeriod`. Al cambiar período, no hay faltas nuevas, así que `count = 0` automáticamente.

**P: ¿Se puede tener count > 6?**  
R: Sí, eso es lo nuevo. En el sistema anterior reseteaba, ahora crece indefinidamente (7, 8, 9...).

**P: ¿Qué evento se registra en BD?**  
R: `falta` (automático) y `TIRO_LIBRE_6_FALTAS` (al confirmar modal en falta 6).

---

## 🎮 Controles del Admin

| Acción | Resultado |
|--------|-----------|
| Registra falta 1-5 | count aumenta |
| Registra falta 6 | Modal aparece |
| Click "Confirmar" en modal | Registra TIRO_LIBRE_6_FALTAS |
| Registra falta 7+ | count aumenta, naranja, auto-TL |
| Click "Siguiente Fase" | Cambio período, count = 0 |

---

## 🔗 Conexión de Componentes

```
LiveMatch.tsx
    ↓
useFutsalRules() ← Calcula foulState
    ↓
Scoreboard.tsx ← Muestra indicadores
    ↓
TiroLibreModal.tsx ← Aparece si atLimit
    ↓
logEvent() → Registra en BD
```

---

## 📊 Ejemplo Completo

```
Período 1:
Falta 1: count=1, gris
Falta 2: count=2, gris
Falta 3: count=3, gris
Falta 4: count=4, amarillo
Falta 5: count=5, amarillo
Falta 6: count=6, ROJO pulsante ⚠️
         → Modal aparece
         → Admin confirma
Falta 7: count=7, NARANJA ⚡ "Auto Tiro Libre Activo"
Falta 8: count=8, NARANJA ⚡ (cada una = TL automático)
Falta 9: count=9, NARANJA ⚡

[Admin avanza período]

Período 2:
Falta 1: count=1, gris ← REINICIA
Falta 2: count=2, gris
... ciclo se repite
```

---

## 🚀 Deployment

1. Los cambios ya están en el código
2. No requiere migración de BD
3. Compatible con históricos de eventos
4. Solo afecta a partidos de futsal

---

## 📞 Soporte Rápido

**Error: Modal no aparece en falta 6**
→ Verifica que `atLimit === true` en Scoreboard

**Error: count resetea**
→ Verifica que no estés cambiando período accidentalmente

**Error: "Auto Tiro Libre" no aparece**
→ Verifica que `isAutoFreeThrow === true` en inspector de React

---

**Versión**: 1.0 | **Fecha**: 17 Abril 2026 | **Estado**: ✅ Producción
