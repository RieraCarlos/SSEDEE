# ✅ Checklist de Validación - Club Roster Management

## 📋 Verificación de Archivos Creados

### Archivos Core
- [ ] `src/hooks/useClubRoster.ts` - Custom hook (103 líneas)
- [ ] `src/store/slices/clubRosterSlice.ts` - Redux slice with extraReducers (140 líneas)
- [ ] `src/store/thunks/clubRosterThunks.ts` - Async Thunks para Supabase (195 líneas)
- [ ] `src/components/Copa/UpdateNominaModal.tsx` - Modal responsivo (320 líneas)
- [ ] `src/components/Copa/ClubRosterTable.tsx` - Tabla con React.memo (250 líneas)

### Utilidades
- [ ] `src/utils/rosterPermissions.ts` - Validación de permisos (45 líneas)
- [ ] `src/components/Copa/ClubRosterIntegrationExample.tsx` - Ejemplos de integración

### Documentación
- [ ] `README_CLUB_ROSTER.md` - Guía de uso completa
- [ ] `ARCHITECTURE_CLUB_ROSTER.md` - Documentación de arquitectura

---

## 🔧 Verificación de Configuración Redux

### Store
```typescript
// ✅ Verificar que store.ts tiene:
import clubRosterReducer from './slices/clubRosterSlice'

reducer: {
  // ... otros reducers
  clubRoster: clubRosterReducer,  // ← DEBE ESTAR AQUÍ
}
```

**Checklist:**
- [ ] `clubRosterReducer` está importado
- [ ] Se agregó a `reducer` en `configureStore`
- [ ] Nombre de la key es `clubRoster`

---

## 🧪 Verificación de Types y Interfaces

### Interfaces Definidas
```typescript
// En clubRosterSlice.ts:
- [ ] ClubPlayer interface
  ├─ id, user_id, club_id, tournament_id
  ├─ dorsal?, posicion?
  └─ user? { id, name, email }

- [ ] AvailableUser interface
  ├─ id, name, email, role

- [ ] ClubRosterState interface
  ├─ clubPlayers: ClubPlayer[]
  ├─ availableUsers: AvailableUser[]
  ├─ loading: boolean
  ├─ error: string | null
  └─ updateLoading: boolean
```

**Validación de tipos:**
- [ ] Todos los interfaces usan tipos específicos (no `any`)
- [ ] Propiedades opcionales marcadas con `?`
- [ ] Tipos genéricos bien definidos

---

## 📱 Verificación de Componentes

### UpdateNominaModal.tsx
```typescript
- [ ] Props interface definida
  ├─ isOpen: boolean
  ├─ clubId: string
  ├─ clubName: string
  ├─ tournamentId: string
  ├─ onClose: () => void
  └─ onSuccess: () => void

- [ ] Animaciones Framer Motion
  ├─ AnimatePresence wrapping
  ├─ motion.div para overlay
  └─ motion.div para modal

- [ ] Search input funcional
  ├─ OnChange handler
  └─ Filter logic

- [ ] Multi-select checkboxes
  ├─ Array de disponibles
  ├─ Array de seleccionados
  └─ Toggle handlers

- [ ] Estados visuales
  ├─ Loading spinner
  ├─ Error message
  └─ Button disabled states

- [ ] Responsive design
  ├─ Mobile: fullscreen
  ├─ Desktop: centered modal
  └─ Breakpoints en `md`
```

### ClubRosterTable.tsx
```typescript
- [ ] React.memo en filas
  └─ Custom comparator function

- [ ] Renderizado condicional basado en permisos
  ├─ canEditRoster check
  └─ Visible solo si user.role === 'admin' o 'dt'

- [ ] Responsive table
  ├─ Hidden columns en mobile (n_equipos)
  ├─ Dropdown menu en mobile
  └─ Directo en desktop

- [ ] Integración con modal
  └─ ClubRosterTableRow dispara UpdateNominaModal
```

---

## 🔄 Verificación de Flujo de Datos

### Redux Flow
```typescript
- [ ] Dispatch fetchClubPlayers
  ├─ Action type: 'clubRoster/fetchClubPlayers/pending'
  ├─ State: loading = true
  └─ Resultado: clubPlayers = [...]

- [ ] Dispatch fetchAvailableUsers
  ├─ Action type: 'clubRoster/fetchAvailableUsers/pending'
  ├─ State: loading = true
  └─ Resultado: availableUsers = [...]

- [ ] Dispatch updateClubNomina
  ├─ Action type: 'clubRoster/updateClubNomina/pending'
  ├─ State: updateLoading = true
  └─ Resultado: clubPlayers = [actualizado]

- [ ] Dispatch clearRosterState
  └─ Todos los valores vuelven a initialState
```

---

## 🌐 Verificación de Supabase Integration

### Tablas Requeridas
```sql
-- ✅ Verificar en Supabase que existan:

1. torneo_club_jugadores
   - id (uuid, pk)
   - user_id (uuid, fk)
   - club_id (uuid, fk)
   - tournament_id (uuid, fk)
   - dorsal (int?)
   - posicion (text?)
   - created_at
   - updated_at

2. usuarios
   - id (uuid, pk)
   - name (text)
   - email (text)
   - role (text)

3. clubs
   - id (uuid, pk)
   - name (text)
   - logo (text?)
   - n_equipos (int?)
```

**Checklist de seguridad:**
- [ ] RLS está habilitado en tablas
- [ ] Policies para admin (CRUD completo)
- [ ] Policies para dt (Editar solo sus clubes)
- [ ] Policies para jugadores (Solo lectura)

---

## 🧩 Verificación de Hooks

### useClubRoster
```typescript
- [ ] Parámetros:
  ├─ clubId (string | null)
  └─ tournamentId (string | null)

- [ ] Retorna objeto con:
  ├─ clubPlayers: ClubPlayer[]
  ├─ availableUsers: AvailableUser[] (filtrados)
  ├─ loading: boolean
  ├─ error: string | null
  ├─ loadClubPlayers(): Promise
  ├─ loadAvailableUsers(): Promise
  ├─ updateNomina(playerIds): Promise
  └─ cleanup(): void

- [ ] Usa useCallback para funciones
- [ ] Usa useMemo para filteredAvailableUsers
- [ ] Validación de null checks
```

### useAppDispatch y useAppSelector
```typescript
- [ ] Importados de hooks
- [ ] Tipados correctamente
- [ ] Selectors memoizados en clubRosterSlice
```

---

## 🎨 Verificación de Estilos

### Tailwind Classes
```javascript
- [ ] Color palette
  ├─ #13161c (bg-[#13161c])
  ├─ #1d2029 (bg-[#1d2029])
  └─ #0ae98a (bg-[#0ae98a], text-[#0ae98a])

- [ ] Responsive breakpoints
  ├─ sm: (mobile)
  ├─ md: (desktop)
  └─ hidden/block alternancia

- [ ] States
  ├─ hover: (hover:bg-*, hover:text-*)
  ├─ disabled: (disabled:opacity-50)
  └─ focus: (focus:border-*, focus:outline-none)

- [ ] Animations
  ├─ Transitions (transition-colors, transition-all)
  └─ Framer Motion (initial, animate, exit)
```

---

## ✅ Verificación de Permisos

### Función canEditClubRoster
```typescript
- [ ] Acepta userRole: 'admin' | 'dt' | 'jugador' | null
- [ ] Retorna true si admin O dt
- [ ] Retorna false si no
- [ ] Se usa en:
  ├─ ClubRosterTable (para mostrar botón)
  ├─ UpdateNominaModal (validación)
  └─ Páginas de administración
```

---

## 🧹 Verificación de Cleanup

### En UpdateNominaModal
```typescript
- [ ] useEffect limpiar state al cerrar
- [ ] cleanup() se llama en handleClose
- [ ] selectedPlayerIds se resetea
- [ ] searchQuery se resetea
```

### En Redux
```typescript
- [ ] clearRosterState reducer
- [ ] Se llama desde cleanup() del hook
- [ ] Resetea todos los valores
```

---

## 🚀 Verificación de Performance

### React.memo
- [ ] ClubRosterTableRow usa React.memo
- [ ] Tiene custom comparator
- [ ] displayName está definido

### useMemo
- [ ] filteredAvailableUsers está memoizado
- [ ] dependencies bien definidas

### useCallback
- [ ] loadClubPlayers usa useCallback
- [ ] loadAvailableUsers usa useCallback
- [ ] updateNomina usa useCallback
- [ ] handleSave en Modal usa useCallback

---

## 📊 Verificación de Logging/Debugging

### En Thunks
```typescript
- [ ] Comentarios explaining queries
- [ ] Error handling con try/catch
- [ ] rejectWithValue con mensaje descriptivo
```

### En Componentes
```typescript
- [ ] JSDoc comments
- [ ] console.error en catch blocks
- [ ] Mensajes descriptivos en UI
```

---

## 🔍 Verificación de Build

Ejecutar antes de hacer commit:

```bash
# Verificar tipos TypeScript
✅ npx tsc --noEmit

# Verificar ESLint
✅ npm run lint

# Validar build
✅ npm run build

# Esperar output sin errores
```

**Resultado esperado:**
```
✓ No TypeScript errors
✓ No ESLint errors
✓ Build successful
✓ No warnings
```

---

## 📝 Verificación de Documentación

- [ ] README_CLUB_ROSTER.md existe
  ├─ Descripción general
  ├─ Stack técnico
  ├─ Archivos implementados
  ├─ Guía de uso
  ├─ Ejemplos de integración
  └─ Próximos pasos

- [ ] ARCHITECTURE_CLUB_ROSTER.md existe
  ├─ Diagrama general
  ├─ Sequence diagram
  ├─ Patrones de arquitectura
  ├─ Flujo de seguridad
  └─ Performance metrics

- [ ] ClubRosterIntegrationExample.tsx existe
  ├─ Ejemplo 1: TournamentAdminPage
  ├─ Ejemplo 2: useClubRosterManagement hook
  ├─ Ejemplo 3: PermissionCheckExample
  └─ Ejemplo 4: Integración en componentes

---

## 🎯 Verificación de Integración

### En página de administración de torneos

```typescript
// Necesitas:
const TournamentClubs = ({ tournamentId }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  
  return (
    <ClubRosterTable
      clubs={clubs}
      tournamentId={tournamentId}
      onRosterUpdated={() => loadClubs()}
    />
  );
};
```

**Checklist:**
- [ ] Componente ClubRosterTable importado
- [ ] Props correctos pasados
- [ ] onRosterUpdated callback implementado
- [ ] Modal se abre al click
- [ ] Datos se actualizan después de guardar

---

## 🧪 Test Cases (Si implementas testing)

```typescript
// useClubRoster Hook
- [ ] loadClubPlayers dispara fetchClubPlayers
- [ ] loadAvailableUsers dispara fetchAvailableUsers
- [ ] updateNomina dispara updateClubNomina
- [ ] cleanup dispara clearRosterState

// clubRosterSlice
- [ ] Initial state correcto
- [ ] Pending states actualizan loading
- [ ] Fulfilled states actualizan data
- [ ] Rejected states actualizan error

// Componentes
- [ ] Modal abre/cierra correctamente
- [ ] Search filter funciona
- [ ] Multi-select trabaja
- [ ] Botones disabled en loading
```

---

## 🐛 Troubleshooting

Si algo no funciona, verificar:

### Error: "useClubRoster is not defined"
```
✅ Importar en componente:
   import { useClubRoster } from '@/hooks/useClubRoster'
```

### Error: "clubRosterReducer is not defined"
```
✅ En store.ts agregar:
   import clubRosterReducer from './slices/clubRosterSlice'
```

### Modal no abre
```
✅ Verificar:
   - isOpen prop es true
   - onClick handler setea state correctamente
   - Permisos del usuario son admin o dt
```

### Datos no se cargan
```
✅ Verificar:
   - useEffect se ejecuta en modal open
   - clubId y tournamentId no son null
   - Supabase client está inicializado
   - RLS policies permiten lectura
```

### Redux state no actualiza UI
```
✅ Verificar:
   - useAppSelector importado correctamente
   - Selector existe en clubRosterSlice
   - Store está configurado con clubRoster reducer
```

---

## ✨ Final Checklist

- [ ] Todos los archivos creados sin errores
- [ ] TypeScript compila sin warnings
- [ ] Store incluye clubRoster reducer
- [ ] Componentes se importan correctamente
- [ ] Modal abre/cierra sin errores
- [ ] Datos cargan desde Supabase
- [ ] Actualización de nómina funciona
- [ ] Permisos se validan correctamente
- [ ] Responsive design funciona (móvil y desktop)
- [ ] Documentación está completa
- [ ] Código sigue Clean Code principles
- [ ] Performance optimizations implementadas

---

## 🎉 ¡Listo para producción!

Una vez todos los items estén marcados ✅, el sistema está listo para:
1. Code review
2. Testing en staging
3. Deployment a producción

**Próximos pasos después de integración:**
1. Realizar manual testing en navegador
2. Verificar RLS policies en Supabase
3. Test en diferentes dispositivos (móvil/tablet/desktop)
4. Validar permisos con diferentes roles
5. Performance testing con datos reales
6. User acceptance testing (UAT)
