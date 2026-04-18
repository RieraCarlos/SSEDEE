# 🔄 COMPARATIVA: Antes vs Después - Sistema de Faltas Futsal

## 📊 Comparación de Comportamiento

### **ANTES (Lógica Cíclica - PROBLEMÁTICA)**

```typescript
// Viejo cálculo de conteo
const localVisualCount = localFouls.length - (localResets * 6);
// Problema: Cada vez que se otorgaba tiro libre, restaba 6
// Resultado: Contador resetea en ciclos de 6
```

#### Flujo Anterior:
```
Falta 1-6:   count = 1, 2, 3, 4, 5, 6  ← Llega a 6
             ↓ Usuario confirma tiro libre
             TIRO_LIBRE_6_FALTAS registrado
             
Falta 7:     count = 1  ← 🚨 RESETEA A 1
             ↓
Falta 8:     count = 2
Falta 9:     count = 3
...
Falta 12:    count = 6  ← Vuelve a resetear

PROBLEMA: Modal aparecería cada 6 faltas indefinidamente
         El contador SIEMPRE reset a 1 después de cada TL
```

#### Visualización Antigua:
```
count: 1 → 2 → 3 → 4 → 5 → 6 [MODAL] → 1 → 2 → 3 → 4 → 5 → 6 [MODAL] ...
                ↑                   ↑
          Contador avanza      RESETEA A 1
```

---

### **DESPUÉS (Contador Lineal - CORRECTO)**

```typescript
// Nuevo cálculo - mucho más simple y lógico
const localFoulCount = localFouls.length;
// Problema resuelto: Solo cuenta faltas, sin manipulación
// Resultado: Contador crece linealmente
```

#### Flujo Nuevo:
```
Falta 1-6:   count = 1, 2, 3, 4, 5, 6  ← Llega a 6
             Visual: ROJO pulsante
             atLimit = true
             ↓ Usuario confirma tiro libre
             TIRO_LIBRE_6_FALTAS registrado
             
Falta 7:     count = 7  ← ✅ CONTINÚA LINEALMENTE
             Visual: NARANJA (Auto Tiro Libre)
             isAutoFreeThrow = true
             ↓
Falta 8:     count = 8
             Visual: NARANJA (Auto Tiro Libre)
             
Falta 9:     count = 9
             Visual: NARANJA (Auto Tiro Libre)

CORRECTO: Cada nueva falta genera automáticamente un TL
         Sin resetear, contador crece indefinidamente
         
Cambio período → count resetea a 0 automáticamente
```

#### Visualización Nueva:
```
count: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → ... → [PERÍODO 2] → 0 → 1 → 2...
                         ↑           ↑
                   Modal aparece  Auto TL
                   (una sola vez) (continúa)
```

---

## 📋 Tabla Comparativa

| Aspecto | ANTES | DESPUÉS |
|---------|-------|---------|
| **Tipo de Contador** | Cíclico (0-6 repetido) | Lineal (0 a ∞) |
| **Falta 6** | Muestra modal | Muestra modal (solo una vez) |
| **Falta 7** | count = 1, modal aparece de nuevo | count = 7, auto-TL, sin modal |
| **Falta 12** | count = 6, modal aparece de nuevo | count = 12, auto-TL |
| **Cambio período** | count resetea | count resetea automáticamente |
| **Tiros Libres** | Cada 6 faltas exactamente | Primero en 6, luego en cada una |
| **Indicador Visual** | Solo rojo (alerta) | Rojo + Naranja (3 estados) |
| **Estado isAutoFreeThrow** | No existía | ✅ Nuevo, true cuando count > 6 |

---

## 🎯 Casos de Uso

### **Caso 1: Partido Normal (Período Corto)**

#### ANTES:
```
Periodo 1:
Falta 1-5, falta 6 [MODAL] → TL
Falta 7-11 (count 1-5), falta 12 [MODAL] → TL  
Falta 13-17 (count 1-5), falta 18 [MODAL] → TL
...espera indefinidamente nuevos modales
```

#### DESPUÉS:
```
Periodo 1:
Falta 1-5 (count 1-5), falta 6 [MODAL] → TL ✅
Falta 7-∞ (count 7-∞) → Auto-TL para cada una ✅
Sin más modales, sistema automático
```

---

### **Caso 2: Cambio de Período**

#### ANTES:
```
Periodo 1: ... falta 18 [MODAL] ...
Cambio a Periodo 2:
Falta 1 → count = 1 ✅
Correcto, pero porque coincide
```

#### DESPUÉS:
```
Periodo 1: ... falta 12 (count 12) ...
Cambio a Periodo 2:
Falta 1 → count = 1 ✅
Mucho más claro: count siempre = número de faltas del período
```

---

## 🔧 Cambios de Código

### **useFutsalRules.ts**

#### ANTES:
```typescript
const localResets = events.filter(
  e => e.type === 'TIRO_LIBRE_6_FALTAS' && 
       e.team === 'local' && 
       e.periodo === currentPeriod
).length;

const localVisualCount = localFouls.length - (localResets * 6);
return {
  local: {
    count: localVisualCount >= 0 ? localVisualCount : 0,
    atLimit: localVisualCount >= 6,
    // ❌ Problemas:
    // 1. Resta 6 cada tiro libre (resetea)
    // 2. atLimit = true cuando count >= 6 (aparece cada 6 faltas)
  }
}
```

#### DESPUÉS:
```typescript
const localFoulCount = localFouls.length;
const localAtLimit = localFoulCount === 6 && localFreeThrows.length === 0;
const localInAutoFreeThrow = localFoulCount > 6;

return {
  local: {
    count: localFoulCount,
    atLimit: localAtLimit,        // ✅ true solo cuando count = 6 EXACTAMENTE
    isAutoFreeThrow: localInAutoFreeThrow, // ✅ true cuando count > 6
    freeThrowsAwarded: localFreeThrows.length, // ✅ Info adicional
  }
}
```

---

## 📊 Visualización de Estados

### **Estado en count = 6 (AMBOS)**

```
┌─────────────────────────┐
│ ANTES Y DESPUÉS IGUAL   │
│ atLimit = true          │
│ Modal aparece: SÍ       │
│ Color: ROJO pulsante    │
└─────────────────────────┘
```

### **Estado en count = 7 (DIFERENCIA CLAVE)**

```
ANTES:                          DESPUÉS:
┌───────────────────┐          ┌──────────────────┐
│ count = 1         │          │ count = 7        │
│ atLimit = true    │          │ atLimit = false  │
│ Modal aparece: SÍ │          │ Modal aparece: NO│
│ Color: ROJO       │          │ isAutoFreeThrow: │
│                   │          │ true             │
│ 🚨 PROBLEMA:      │          │ Color: NARANJA   │
│ Modal indefinido  │          │                  │
│ Usuario confundido│          │ ✅ CORRECTO:     │
└───────────────────┘          │ Auto-TL activo   │
                                └──────────────────┘
```

---

## ✅ Verificación de Requisitos

### Requisito 1: "Después de 6ta falta, cada nueva falta otorga tiro libre"

| Antes | Después |
|-------|---------|
| ❌ Modal se repetía | ✅ Auto-TL sin modal |
| ❌ Confuso | ✅ Claro: "Auto Tiro Libre Activo" |
| ❌ count reseteaba | ✅ count continúa linealmente |

### Requisito 2: "No vuelve a contar las faltas"

| Antes | Después |
|-------|---------|
| ❌ count = 1,2,3,4,5,6,1,2,3... | ✅ count = 1,2,3,4,5,6,7,8,9... |
| ❌ Restaraba 6 en cada TL | ✅ Solo suma sin restar |

### Requisito 3: "Reiniciar conteo en segundo tiempo"

| Antes | Después |
|-------|---------|
| ✅ Sí funcionaba | ✅ Sí, automático |
| ⚠️ Poco claro por qué | ✅ Claro: filtra por periodo |

---

## 🎯 Mejora Conceptual

**El cambio clave**: De pensar en "ciclos de 6 faltas" a pensar en "una sola vez 6 faltas, después auto-tiro-libre"

```
ANTES:  Ciclo → Ciclo → Ciclo ...
        6fa  → RESET → 6fa → RESET

DESPUÉS: Conteo lineal → Auto-TL → Nuevo período
         0-6         7-∞       0-6
```

---

## 📚 Documentación

- Guía completa: `FUTSAL_FOULS_GUIDE.md`
- Cambios detallados: `CAMBIOS_SISTEMA_FALTAS.md`
- Código: `src/hooks/useFutsalRules.ts`

---

**Conclusión**: El sistema anterior era conceptualmente incorrecto para las reglas de futsal. Ahora es **lógicamente correcto, visualmente claro y automáticamente reiniciable**.

**Última actualización**: 17 Abril 2026
