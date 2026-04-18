# 🏆 Sistema de Actualización de Nómina por Club

## 📋 Descripción General

Sistema completo y escalable para la gestión de nóminas de clubes en torneos. Implementado con React + TypeScript, Redux Toolkit, Supabase y diseño Mobile-First responsivo.

**Stack Técnico:**
- ✅ Custom Hook Pattern (Dependency Injection)
- ✅ Redux Toolkit con Thunks asincronicos
- ✅ Optimistic UI Updates
- ✅ React.memo para optimización
- ✅ Tailwind CSS Mobile-First
- ✅ Framer Motion Animations
- ✅ Validación de permisos integrada

---

## 📦 Archivos Implementados

### 1. **Hook Custom - `useClubRoster.ts`**
```
src/hooks/useClubRoster.ts
```
**Responsabilidades:**
- Encapsula lógica de gestión de nóminas
- Inyección de dependencias (clubId, tournamentId)
- Métodos: loadClubPlayers(), loadAvailableUsers(), updateNomina(), cleanup()
- Optimización con useMemo para filteredAvailableUsers
- Cleanup automático de estado Redux

**Uso:**
```typescript
const {
  clubPlayers,
  availableUsers,
  loading,
  updateLoading,
  error,
  loadClubPlayers,
  loadAvailableUsers,
  updateNomina,
  cleanup,
} = useClubRoster(clubId, tournamentId);
```

---

### 2. **Redux Slice - `clubRosterSlice.ts`**
```
src/store/slices/clubRosterSlice.ts
```
**Responsabilidades:**
- Gestión centralizada de estado (clubPlayers, availableUsers, loading, error)
- Reducers: clearRosterState, addPlayerOptimistic, removePlayerOptimistic
- ExtraReducers para 3 Thunks asincronicos
- Selectors memoizados para prevenir re-renders
- Interfaz TypeScript: ClubPlayer, AvailableUser, ClubRosterState

**Selectors Disponibles:**
```typescript
selectClubPlayers
selectAvailableUsers
selectRosterLoading
selectRosterError
selectUpdateLoading
selectFilteredAvailableUsers
```

---

### 3. **Redux Thunks - `clubRosterThunks.ts`**
```
src/store/thunks/clubRosterThunks.ts
```
**Operaciones Supabase:**

#### `fetchClubPlayers`
- Obtiene jugadores actuales del club en torneo
- Query: torneo_club_jugadores con relación usuarios
- Parámetros: { clubId, tournamentId }

#### `fetchAvailableUsers`
- Obtiene usuarios sin asignar al club
- Filtra por rol (excluye admins)
- Excluye jugadores ya asignados al club
- Parámetros: { clubId, tournamentId }

#### `updateClubNomina`
- Upsert inteligente: elimina no seleccionados, agrega nuevos
- Previene duplicados
- Sincronización segura
- Parámetros: { clubId, tournamentId, playerIds }

**Manejo de errores:**
- rejectWithValue para captura en Redux
- Mensajes descriptivos
- Validación de respuestas

---

### 4. **Modal Responsivo - `UpdateNominaModal.tsx`**
```
src/components/Copa/UpdateNominaModal.tsx
```
**Características:**
- **Mobile First:** Fullscreen en móvil, centered en desktop
- **Búsqueda:** Filtrado por nombre/email en tiempo real
- **Multi-select:** Checkboxes para seleccionar/deseleccionar jugadores
- **Estados de carga:** Indicadores visuales durante operaciones
- **Animaciones:** Transiciones suaves con Framer Motion
- **Notificaciones:** Estados de error integrados
- **Cleanup:** Limpia Redux state al cerrar

**Props:**
```typescript
interface UpdateNominaModalProps {
  isOpen: boolean;
  clubId: string;
  clubName: string;
  tournamentId: string;
  onClose: () => void;
  onSuccess: () => void;
}
```

**Diseño Color Palette:**
- Primary: #13161c
- Secondary: #1d2029
- Accent: #0ae98a

---

### 5. **Tabla de Clubes - `ClubRosterTable.tsx`**
```
src/components/Copa/ClubRosterTable.tsx
```
**Responsabilidades:**
- Renderiza lista de clubes con acciones
- React.memo en filas para optimización
- Validación de permisos integrada
- **Desktop:** Botón "Nómina" visible
- **Mobile:** Menú de tres puntos con opciones

**Props:**
```typescript
interface ClubRosterTableProps {
  clubs: Club[];
  tournamentId: string;
  onRosterUpdated: () => void;
  loading?: boolean;
}
```

---

### 6. **Validación de Permisos - `rosterPermissions.ts`**
```
src/utils/rosterPermissions.ts
```
**Funciones:**
- `canEditClubRoster(userRole)` → true si admin o dt
- `canViewClubPlayers(userRole)` → validación de lectura
- `canDeletePlayer(userRole, isOwnerOfClub)` → eliminación
- `getRosterPermissionLevel(userRole)` → niveles (full/limited/none)

**Uso:**
```typescript
import { canEditClubRoster } from '@/utils/rosterPermissions';

if (canEditClubRoster(user?.role)) {
  // Mostrar opciones de edición
}
```

---

### 7. **Ejemplo de Integración - `ClubRosterIntegrationExample.tsx`**
```
src/components/Copa/ClubRosterIntegrationExample.tsx
```
Documentación con ejemplos de uso en:
- Páginas de administración
- Hooks personalizados
- Validación de permisos
- Integración en componentes existentes

---

## 🔧 Actualización de Redux Store

Se ha actualizado **`src/store/store.ts`** para incluir:

```typescript
import clubRosterReducer from './slices/clubRosterSlice'

export const store = configureStore({
  reducer: {
    // ... otros reducers
    clubRoster: clubRosterReducer,  // ← NUEVO
  },
})
```

---

## 🚀 Guía de Uso

### 1. **Integración en componente existente**

```typescript
import { ClubRosterTable } from '@/components/Copa/ClubRosterTable';

const TournamentClubs: React.FC = ({ tournamentId }) => {
  const [clubs, setClubs] = useState<Club[]>([]);

  const handleRosterUpdated = () => {
    loadClubs(); // Recargar datos
  };

  return (
    <ClubRosterTable
      clubs={clubs}
      tournamentId={tournamentId}
      onRosterUpdated={handleRosterUpdated}
    />
  );
};
```

### 2. **Validación de permisos en página**

```typescript
import { selectAuthUser } from '@/store/slices/authSlice';
import { canEditClubRoster } from '@/utils/rosterPermissions';

const AdminPage = () => {
  const user = useAppSelector(selectAuthUser);

  if (!canEditClubRoster(user?.role)) {
    return <div>No tienes permisos</div>;
  }

  return <ClubRosterTable {...props} />;
};
```

---

## 📱 Diseño Responsivo

### Desktop (≥ md)
```
┌─────────────────────────────────────────┐
│ Club Name        │ N Equipos │ [Nómina] │
└─────────────────────────────────────────┘
```

### Mobile (< md)
```
┌──────────────────────────────┐
│ Club Name           [⋮ Menu] │
├──────────────────────────────┤
│ - Actualizar Nómina         │
└──────────────────────────────┘
```

### Modal Desktop
Ventana centrada, max-width: 2xl, con overlay

### Modal Mobile
Fullscreen con overlay, deslizable

---

## 🔐 Seguridad

### Validación Frontend
- `canEditClubRoster()` valida rol del usuario
- Modal no se abre sin permisos
- Estados de loading previenen múltiples clicks

### Validación Backend (Recomendado)
En tus RLS Policies de Supabase:

```sql
-- Tabla torneo_club_jugadores
CREATE POLICY "Admins y DTs pueden editar nóminas"
  ON torneo_club_jugadores
  FOR UPDATE
  USING (
    auth.jwt()->>'role' IN ('admin', 'dt')
  );

CREATE POLICY "Solo propietarios del club pueden editar"
  ON torneo_club_jugadores
  FOR UPDATE
  USING (
    club_id IN (
      SELECT id FROM clubs 
      WHERE dt_id = auth.uid()
    )
  );
```

---

## ⚡ Optimizaciones

### React.memo
```typescript
const ClubRosterTableRow = React.memo<ClubRosterTableRowProps>(
  ({ club, tournamentId, onRosterUpdated }) => {
    // Componente
  },
  (prevProps, nextProps) => {
    // Comparador personalizado
    return prevProps.club.id === nextProps.club.id;
  }
);
```

### useMemo
```typescript
const filteredAvailableUsers = useMemo(() => {
  return availableUsers.filter(user => 
    !clubPlayers.map(p => p.user_id).includes(user.id)
  );
}, [availableUsers, clubPlayers]);
```

### useCallback
```typescript
const loadClubPlayers = useCallback(() => {
  dispatch(fetchClubPlayers({ clubId, tournamentId }));
}, [clubId, tournamentId, dispatch]);
```

---

## 🐛 Debugging

### Estado Redux
```typescript
// En React DevTools
store.getState().clubRoster
// {
//   clubPlayers: [...]
//   availableUsers: [...]
//   loading: false
//   error: null
//   updateLoading: false
// }
```

### Logs
```typescript
// En clubRosterThunks.ts
console.log('fetchClubPlayers:', { clubId, tournamentId });
console.log('Response:', data);
```

---

## 📊 Flujo de Datos

```
ClubRosterTable
    │
    └─→ ClubRosterTableRow
        │
        └─→ UpdateNominaModal
            │
            └─→ useClubRoster Hook
                ├─→ Dispatch fetchClubPlayers
                ├─→ Dispatch fetchAvailableUsers
                └─→ Dispatch updateClubNomina
                    │
                    └─→ Redux Thunks
                        │
                        └─→ Supabase API
```

---

## 🎯 Próximos Pasos

1. **Integrar en página existente**
   - Ubicar componente que lista clubes
   - Reemplazar/complementar con ClubRosterTable
   - Pasar clubs, tournamentId, onRosterUpdated

2. **Configurar Supabase RLS**
   - Crear políticas de seguridad en base de datos
   - Validar permisos en backend

3. **Testing**
   - Unit tests para hooks
   - Integration tests para Redux
   - E2E tests para modal

4. **Mejoras futuras**
   - Asignación de dorsales en modal
   - Asignación de posiciones
   - Historial de cambios en nómina
   - Export a PDF
   - Sincronización en tiempo real

---

## 📝 Notas Importantes

- ✅ Todos los archivos tienen TypeScript typing
- ✅ Código documentado con JSDoc comments
- ✅ Sigue patrón Clean Code (DI, SOLID, separación de concerns)
- ✅ Optimizado para performance (React.memo, useMemo, useCallback)
- ✅ Mobile-First responsive design
- ✅ Validación de permisos integrada
- ✅ Manejo robusto de errores

---

## 🤝 Soporte

Si necesitas ajustes o aclaraciones:
- Revisar `ClubRosterIntegrationExample.tsx` para ejemplos
- Validar tipos en interfaces de Redux state
- Consultar comentarios en Thunks para operaciones Supabase
