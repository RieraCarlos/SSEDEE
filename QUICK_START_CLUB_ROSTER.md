# 🚀 Quick Start - Club Roster Management

## ⚡ Comienza en 5 minutos

### Paso 1: Verificar Store (1 min)
**Archivo:** `src/store/store.ts`

```typescript
import clubRosterReducer from './slices/clubRosterSlice'

export const store = configureStore({
  reducer: {
    // ... otros
    clubRoster: clubRosterReducer,  // ✅ ESTE DEBE ESTAR
  },
})
```

**Status:** ✅ Ya está configurado

---

### Paso 2: Importar componente en tu página (2 min)

**Locación:** Donde listaes clubes en administración

```typescript
// Importa
import { ClubRosterTable } from '@/components/Copa/ClubRosterTable';

// En tu componente
export const MyClubsPage = ({ tournamentId }) => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRosterUpdated = () => {
    // Recarga los clubes después de actualizar nómina
    loadClubs();
  };

  return (
    <div>
      <h1>Gestionar Clubes</h1>
      <ClubRosterTable
        clubs={clubs}
        tournamentId={tournamentId}
        onRosterUpdated={handleRosterUpdated}
        loading={loading}
      />
    </div>
  );
};
```

**Status:** ✅ Implementación lista

---

### Paso 3: Verificar permisos de usuario (1 min)

```typescript
import { canEditClubRoster } from '@/utils/rosterPermissions';
import { selectAuthUser } from '@/store/slices/authSlice';

export const AdminPage = () => {
  const user = useAppSelector(selectAuthUser);

  // Si el usuario NO es admin o dt, no mostrar tabla
  if (!canEditClubRoster(user?.role)) {
    return <div>No tienes acceso</div>;
  }

  return <ClubRosterTable {...props} />;
};
```

**Status:** ✅ Validación automática en componente

---

### Paso 4: Usar el hook personalizado (1 min)

Si necesitas lógica adicional en tu componente:

```typescript
import { useClubRoster } from '@/hooks/useClubRoster';

export const MyComponent = ({ clubId, tournamentId }) => {
  const {
    clubPlayers,      // Array de jugadores del club
    availableUsers,   // Array de usuarios sin asignar
    loading,          // boolean para spinner
    error,            // string | null
    loadClubPlayers,  // () => void
    loadAvailableUsers, // () => void
    updateNomina,     // (playerIds: string[]) => Promise
    cleanup,          // () => void
  } = useClubRoster(clubId, tournamentId);

  // Usar en tu lógica
  useEffect(() => {
    loadClubPlayers();
  }, [clubId]);

  return (
    <div>
      {loading && <Spinner />}
      {error && <Alert>{error}</Alert>}
      {clubPlayers.map(player => (
        <div key={player.id}>{player.usuarios?.name}</div>
      ))}
    </div>
  );
};
```

**Status:** ✅ Hook ready to use

---

## 📁 Estructura Creada

```
src/
├── hooks/
│   └── useClubRoster.ts          ✅ Custom Hook
├── store/
│   ├── slices/
│   │   └── clubRosterSlice.ts    ✅ Redux State
│   ├── thunks/
│   │   └── clubRosterThunks.ts   ✅ Async Operations
│   └── store.ts                   ✅ Configurado
├── components/Copa/
│   ├── UpdateNominaModal.tsx      ✅ Modal Responsivo
│   ├── ClubRosterTable.tsx        ✅ Tabla + React.memo
│   └── ClubRosterIntegrationExample.tsx  ✅ Ejemplos
└── utils/
    └── rosterPermissions.ts       ✅ Validación
```

---

## 🎯 Casos de Uso Rápidos

### Caso 1: Mostrar tabla de clubes con botón de nómina
```typescript
<ClubRosterTable
  clubs={myClubs}
  tournamentId={tournamentId}
  onRosterUpdated={reloadClubs}
/>
```

### Caso 2: Obtener jugadores del club programáticamente
```typescript
const { clubPlayers, loadClubPlayers } = useClubRoster(clubId, tournamentId);

useEffect(() => {
  loadClubPlayers();
}, []);

// clubPlayers ahora tiene los datos
```

### Caso 3: Actualizar nómina desde código
```typescript
const { updateNomina } = useClubRoster(clubId, tournamentId);

const handleSave = async () => {
  await updateNomina(['user-id-1', 'user-id-2', 'user-id-3']);
  // Nómina actualizada
};
```

### Caso 4: Validar permisos antes de mostrar
```typescript
if (canEditClubRoster(user?.role)) {
  // Mostrar opciones de edición
} else {
  // Solo lectura
}
```

---

## 🔌 Supabase Setup (Importante)

### Tablas Requeridas (SQL)

```sql
**Status:** Verificar que esta tabla existe en tu BD

---

## 🧪 Test Rápido en Navegador

1. Navega a tu página de administración de clubes
2. Verifica que aparece la tabla con los clubes
3. Haz click en el botón "Nómina" (o en el menú si es mobile)
4. Se abre el modal
5. Busca un jugador en el campo de búsqueda
6. Selecciona algunos jugadores con los checkboxes
7. Haz click en "Guardar"
8. El modal cierra y los datos se actualizan
9. ✅ Todo funciona!

---

## 🐛 Problemas Comunes

### "Modal no abre"
```typescript
// Verificar que tienes permisos
if (user?.role !== 'admin' && user?.role !== 'dt') {
  // El botón no se muestra
}

// Solución: Cambiar rol a admin o dt
```

### "Los datos no cargan"
```typescript
// Verificar que clubId y tournamentId no son null
if (!clubId || !tournamentId) {
  console.error('IDs faltantes');
}

// Solución: Pasar los IDs correctamente
```

### "Error de Supabase"
```typescript
// Verificar tabla existe
SELECT COUNT(*) FROM torneo_club_jugadores;

// Verificar RLS permite lectura
// (User debe estar autenticado)
```

---

## 💡 Tips

- **Mobile First:** El modal se ve fullscreen en móvil y centrado en desktop
- **Search:** El filtro es case-insensitive (busca por nombre o email)
- **Performance:** React.memo optimiza renders innecesarios
- **Cleanup:** El estado se limpia al cerrar el modal

---

## 📚 Documentación Completa

Para entender cómo funciona todo:
- **README_CLUB_ROSTER.md** - Guía detallada de uso
- **ARCHITECTURE_CLUB_ROSTER.md** - Arquitectura y patrones
- **CLUB_ROSTER_VALIDATION_CHECKLIST.md** - Verificación paso a paso

---

## ✅ Checklist Minimal

- [ ] Store tiene clubRosterReducer
- [ ] ClubRosterTable está en tu página
- [ ] Modal abre al click en "Nómina"
- [ ] Puedes seleccionar jugadores
- [ ] Guardas cambios exitosamente
- [ ] Permisos se validan correctamente

---

## 🚀 ¡Ya está!

Tu sistema de **Actualización de Nómina por Club** está funcional.

**Siguiente:** 
1. Integra en tu página actual
2. Prueba en navegador
3. Revisa la documentación si necesitas customizar
4. Haz commit y deploy 🎉
