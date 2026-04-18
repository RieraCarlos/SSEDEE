# 🏗️ Arquitectura del Sistema de Nóminas

## 📐 Diagrama General

```
┌─────────────────────────────────────────────────────────────────────┐
│                         PRESENTACIÓN (UI)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ClubRosterTable (Tabla + React.memo)                              │
│       └─→ ClubRosterTableRow (Row)                                 │
│            └─→ UpdateNominaModal (Modal responsivo)                │
│                 └─→ useClubRoster (Custom Hook)                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      LÓGICA (Custom Hook)                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  useClubRoster(clubId, tournamentId)                               │
│  ├─ loadClubPlayers()     → Dispatch fetchClubPlayers              │
│  ├─ loadAvailableUsers()  → Dispatch fetchAvailableUsers           │
│  ├─ updateNomina()        → Dispatch updateClubNomina              │
│  └─ cleanup()             → Dispatch clearRosterState              │
│                                                                     │
│  Dependencies Injection:                                           │
│  - clubId (string)                                                 │
│  - tournamentId (string)                                           │
│  - useAppDispatch (Redux)                                          │
│  - useAppSelector (Redux)                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   ESTADO (Redux Toolkit)                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Redux Store                                                       │
│  └─ clubRoster: ClubRosterState                                    │
│     ├─ clubPlayers: ClubPlayer[]                                   │
│     ├─ availableUsers: AvailableUser[]                             │
│     ├─ loading: boolean                                            │
│     ├─ error: string | null                                        │
│     └─ updateLoading: boolean                                      │
│                                                                     │
│  Reducers:                                                         │
│  ├─ clearRosterState()                                             │
│  ├─ addPlayerOptimistic()                                          │
│  └─ removePlayerOptimistic()                                       │
│                                                                     │
│  ExtraReducers (Async Thunks):                                     │
│  ├─ fetchClubPlayers (pending/fulfilled/rejected)                  │
│  ├─ fetchAvailableUsers (pending/fulfilled/rejected)               │
│  └─ updateClubNomina (pending/fulfilled/rejected)                  │
│                                                                     │
│  Selectors (memoized):                                             │
│  ├─ selectClubPlayers                                              │
│  ├─ selectAvailableUsers                                           │
│  ├─ selectRosterLoading                                            │
│  ├─ selectRosterError                                              │
│  └─ selectUpdateLoading                                            │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                  DATOS (Async Thunks)                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  clubRosterThunks.ts                                               │
│  ├─ fetchClubPlayers(clubId, tournamentId)                         │
│  │  └─ SELECT torneo_club_jugadores + usuarios join                │
│  │                                                                 │
│  ├─ fetchAvailableUsers(clubId, tournamentId)                      │
│  │  ├─ SELECT assigned user_ids                                    │
│  │  ├─ SELECT all usuarios (NOT admin)                             │
│  │  └─ FILTER exclude assigned                                     │
│  │                                                                 │
│  └─ updateClubNomina(clubId, tournamentId, playerIds)              │
│     ├─ SELECT current players                                      │
│     ├─ DELETE players not in new list                              │
│     ├─ INSERT new players from list                                │
│     └─ SELECT updated roster                                       │
│                                                                     │
│  Error Handling:                                                   │
│  └─ rejectWithValue(error message)                                 │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                   BASE DE DATOS (Supabase)                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Tablas:                                                           │
│  ├─ torneo_club_jugadores                                          │
│  │  ├─ id (PK)                                                     │
│  │  ├─ user_id (FK → usuarios)                                     │
│  │  ├─ club_id (FK → clubs)                                        │
│  │  ├─ tournament_id (FK → tournaments)                            │
│  │  ├─ dorsal                                                      │
│  │  └─ posicion                                                    │
│  │                                                                 │
│  ├─ usuarios                                                       │
│  │  ├─ id (PK)                                                     │
│  │  ├─ name                                                        │
│  │  ├─ email                                                       │
│  │  └─ role                                                        │
│  │                                                                 │
│  └─ clubs                                                          │
│     ├─ id (PK)                                                     │
│     ├─ name                                                        │
│     ├─ logo                                                        │
│     └─ n_equipos                                                   │
│                                                                     │
│  RLS Policies:                                                     │
│  ├─ Admins: CRUD completo                                          │
│  ├─ DTs: Editar solo sus clubes                                    │
│  └─ Jugadores: Solo lectura                                        │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flujo de Actualización (Sequence Diagram)

```
Usuario          UI              Redux           Thunks          Supabase
   │              │                │               │                 │
   ├─ Click       │                │               │                 │
   │ "Nómina"     │                │               │                 │
   └──────────────→ Open Modal     │               │                 │
                   │                │               │                 │
                   ├─ loadClubPlayers()             │                 │
                   │                ├─ Dispatch    │                 │
                   │                │ fetchCP      │                 │
                   │                │              ├─ Query DB       │
                   │                │              │ SELECT * FROM   │
                   │                │              │ tcj WHERE...    │
                   │                │              │                 │
                   │                │              │←─ Data[]        │
                   │                │←─ fulfilled  │                 │
                   │←─ Update State │              │                 │
                   │ (loading: false)              │                 │
                   │                │               │                 │
                   ├─ loadAvailableUsers()         │                 │
                   │                ├─ Dispatch   │                 │
                   │                │ fetchAU    │                 │
                   │                │              ├─ Query DB       │
                   │                │              │ (2 queries)     │
                   │                │              │                 │
                   │                │              │←─ Data[]        │
                   │                │←─ fulfilled  │                 │
                   │←─ Update State │              │                 │
                   │ (availableUsers)              │                 │
                   │                │               │                 │
   │ Select/       │                │               │                 │
   │ Deselect      │                │               │                 │
   │ Players       │                │               │                 │
   └──────────────→ Update Local   │               │                 │
                   │ State          │               │                 │
                   │ (selectedIds)  │               │                 │
                   │                │               │                 │
   │ Click         │                │               │                 │
   │ "Guardar"     │                │               │                 │
   └──────────────→ updateNomina()  │               │                 │
                   │                ├─ Dispatch   │                 │
                   │                │ updateCN   │                 │
                   │                │              │                 │
                   │                │              ├─ SELECT current │
                   │                │              │ players         │
                   │                │              │                 │
                   │                │              │←─ [{}]          │
                   │                │              │                 │
                   │                │              ├─ DELETE old     │
                   │                │              │ records         │
                   │                │              │                 │
                   │                │              ├─ INSERT new     │
                   │                │              │ records         │
                   │                │              │                 │
                   │                │              ├─ SELECT all     │
                   │                │              │ (updated)       │
                   │                │              │                 │
                   │                │              │←─ [{}]          │
                   │                │←─ fulfilled  │                 │
                   │←─ Update State │              │                 │
                   │ (clubPlayers)  │              │                 │
                   │                │               │                 │
                   ├─ cleanup()     │               │                 │
                   │                ├─ Dispatch   │                 │
                   │                │ clearState │                 │
                   │                │←─ OK        │                 │
                   │                │               │                 │
                   ├─ Close Modal  │               │                 │
                   │                │               │                 │
   │              │                │               │                 │
   │ onSuccess()  │                │               │                 │
   │ Handler      │                │               │                 │
   └──────────────→ Reload Clubs   │               │                 │
```

---

## 🏛️ Patrones de Arquitectura

### 1. **Dependency Injection**
```typescript
// En vez de hardcodear clubId en el hook
const useClubRoster = (clubId: string, tournamentId: string) => {
  // Las dependencias se pasan como parámetros
  // Facilita testing y reutilización
}

// Uso
const { clubPlayers } = useClubRoster(clubId, tournamentId);
```

### 2. **Separation of Concerns**
```
UI Layer (Components)
    ↓
Logic Layer (Custom Hooks)
    ↓
State Management (Redux)
    ↓
Data Layer (Thunks + Supabase)
```

### 3. **Composition Pattern**
```typescript
<UpdateNominaModal>
  ├─ useClubRoster Hook
  ├─ useAppDispatch
  └─ useAppSelector
```

### 4. **Selector Pattern**
```typescript
// Redux Selectors (memoized con createSelector)
const selectClubPlayers = (state: RootState) => 
  state.clubRoster.clubPlayers;

// Uso en componentes
const clubPlayers = useAppSelector(selectClubPlayers);
```

### 5. **Optimistic UI**
```typescript
// Reducers para actualización inmediata
addPlayerOptimistic(state, action) {
  state.clubPlayers.push(action.payload);
}

// Mientras Thunk completa en background
```

### 6. **React.memo + Custom Comparator**
```typescript
export const ClubRosterTableRow = React.memo(
  Component,
  (prevProps, nextProps) => {
    // Custom comparison logic
    return prevProps.club.id === nextProps.club.id;
  }
);
```

### 7. **useCallback + useMemo**
```typescript
// Evita recrear funciones en cada render
const handleSave = useCallback(() => {
  updateNomina(Array.from(selectedPlayerIds));
}, [selectedPlayerIds, updateNomina]);

// Memoiza cálculos costosos
const filteredUsers = useMemo(() => {
  return availableUsers.filter(...);
}, [availableUsers]);
```

---

## 🔐 Flujo de Seguridad

```
┌─ Frontend Security ─────────────────────────────┐
│                                                  │
│  1. Verificación de rol                          │
│     canEditClubRoster(user?.role)                │
│     ├─ admin → ✅ permitir                       │
│     ├─ dt → ✅ permitir                          │
│     └─ otro → ❌ denegar                         │
│                                                  │
│  2. Modal no se abre sin permiso                 │
│     └─ Renderizado condicional                  │
│                                                  │
│  3. Loading states previenen múltiples clicks    │
│     └─ Botón deshabilitado durante operación   │
│                                                  │
└──────────────────────────────────────────────────┘
                      ↓
┌─ Backend Security (Supabase RLS) ───────────────┐
│                                                  │
│  1. Row Level Security Policies                  │
│     CREATE POLICY "edit_own_roster"              │
│     USING (user_role IN ('admin', 'dt'))         │
│                                                  │
│  2. Club Ownership Validation                    │
│     WHERE club_id IN (                           │
│       SELECT id FROM clubs                       │
│       WHERE dt_id = auth.uid()                   │
│     )                                            │
│                                                  │
│  3. User Authentication Check                    │
│     auth.role() = 'authenticated'                │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 📊 Estado Redux

```typescript
// Estructura completa del estado
interface RootState {
  clubRoster: {
    clubPlayers: [
      {
        id: string;
        user_id: string;
        club_id: string;
        tournament_id: string;
        dorsal?: number;
        posicion?: string;
        usuarios?: {
          id: string;
          name: string;
          email: string;
        };
      }
    ];
    
    availableUsers: [
      {
        id: string;
        name: string;
        email: string;
        role: string;
      }
    ];
    
    loading: boolean;         // fetchClubPlayers + fetchAvailableUsers
    error: string | null;     // Mensajes de error
    updateLoading: boolean;   // updateClubNomina en progreso
  };
}
```

---

## ⚡ Pipeline de Optimización

```
Componente Renderizado
    │
    ├─→ React.memo
    │   └─ Previene re-renders innecesarios
    │
    ├─→ useCallback
    │   └─ Memoriza funciones
    │
    ├─→ useMemo
    │   └─ Memoriza cálculos (filteredAvailableUsers)
    │
    ├─→ Redux Selectors
    │   └─ Memoizadas automáticamente
    │
    └─→ useAppSelector
        └─ Solo re-render si selector devuelve valor diferente
```

---

## 🎯 Ciclo de Vida del Modal

```
┌─ MOUNT ─────────────────────────────────────────────┐
│ 1. Modal abre (isOpen = true)                       │
│ 2. useEffect se ejecuta                             │
│    ├─ loadClubPlayers()                             │
│    └─ loadAvailableUsers()                          │
│ 3. Redux state actualiza                            │
│ 4. Componentes se re-renderizan                     │
└─────────────────────────────────────────────────────┘
                      ↓
┌─ INTERACTION ───────────────────────────────────────┐
│ 1. Usuario selecciona/deselecciona jugadores       │
│ 2. useState actualiza selectedPlayerIds             │
│ 3. Componente renderiza cambios                     │
│ 4. Usuario hace click en "Guardar"                  │
│    ├─ updateNomina() se ejecuta                     │
│    ├─ Thunk se dispara                              │
│    └─ loading state pasa a true                     │
└─────────────────────────────────────────────────────┘
                      ↓
┌─ UNMOUNT ───────────────────────────────────────────┐
│ 1. Modal cierra (isOpen = false)                    │
│ 2. handleClose() se ejecuta                         │
│ 3. cleanup() se ejecuta                             │
│    └─ Redux state se resetea                        │
│ 4. useState se resetea                              │
│    └─ selectedPlayerIds = new Set()                 │
│ 5. useEffect cleanup se ejecuta (si existe)         │
└─────────────────────────────────────────────────────┘
```

---

## 📈 Escalabilidad

### ¿Cómo agregar nueva funcionalidad?

**1. Nuevo botón en la tabla**
```typescript
// En ClubRosterTable.tsx
<button onClick={() => handleNewAction()}>
  Nueva Acción
</button>
```

**2. Nuevo Thunk en Supabase**
```typescript
// En clubRosterThunks.ts
export const newThunk = createAsyncThunk(...)
```

**3. Nuevo Reducer en Redux**
```typescript
// En clubRosterSlice.ts
reducers: {
  newReducer: (state, action) => { ... }
}
```

**4. Nuevo método en Hook**
```typescript
// En useClubRoster.ts
const newMethod = useCallback(() => {
  dispatch(newThunk(...))
}, [...deps])
```

---

## 🔗 Dependencias

```
UpdateNominaModal.tsx
├─ Framer Motion (animaciones)
├─ Lucide Icons (iconos)
├─ Tailwind CSS (estilos)
├─ useClubRoster (custom hook)
├─ useAppSelector (Redux)
└─ useAppDispatch (Redux)

useClubRoster.ts
├─ useAppDispatch
├─ useAppSelector
├─ useMemo (React)
├─ useCallback (React)
├─ createAsyncThunk (Redux Toolkit)
└─ clubRosterThunks

clubRosterThunks.ts
├─ supabase client
├─ CreateAsyncThunk (Redux Toolkit)
└─ rejectWithValue

ClubRosterTable.tsx
├─ React.memo
├─ useAppSelector
├─ selectAuthUser
├─ canEditClubRoster
└─ UpdateNominaModal
```

---

## 🚀 Performance Metrics

Optimizaciones implementadas:

| Métrica | Implementación |
|---------|---|
| **Component Re-renders** | React.memo + custom comparator |
| **Selector Re-evaluations** | Memoized Redux selectors |
| **Function Recreations** | useCallback memoization |
| **Computation Overhead** | useMemo for filtered users |
| **Bundle Size** | Composición modular, tree-shakeable |
| **Network Requests** | Batch queries a Supabase |
| **State Management** | Thunks con error handling robusto |

---

## 📝 Documentación Inline

Todos los archivos incluyen:
- ✅ JSDoc comments en funciones
- ✅ Type definitions completas
- ✅ Comentarios de lógica compleja
- ✅ Ejemplos de uso en props interfaces
- ✅ Notas de performance y seguridad
