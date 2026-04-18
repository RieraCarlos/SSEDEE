# 📊 Dependency Graph - Club Roster System

## Importación de Dependencias (Arrow Direction)

```
┌─────────────────────────────────────────────────────┐
│              COMPONENTES UI (Views)                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  UpdateNominaModal.tsx                              │
│  ├─ imports: useClubRoster                          │
│  ├─ imports: useAppDispatch, useAppSelector         │
│  ├─ imports: Framer Motion                          │
│  └─ imports: Lucide Icons                           │
│                                                     │
│  ClubRosterTable.tsx                                │
│  ├─ imports: UpdateNominaModal                      │
│  ├─ imports: useAppSelector                         │
│  ├─ imports: selectAuthUser                         │
│  └─ imports: canEditClubRoster                      │
│                                                     │
│  YourPage.tsx                                       │
│  ├─ imports: ClubRosterTable                        │
│  └─ imports: canEditClubRoster                      │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │ uses
                 ↓
┌─────────────────────────────────────────────────────┐
│           CUSTOM HOOKS (Logic Layer)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  useClubRoster.ts                                   │
│  ├─ imports: useAppDispatch                         │
│  ├─ imports: useAppSelector                         │
│  ├─ imports: fetchClubPlayers                       │
│  ├─ imports: fetchAvailableUsers                    │
│  ├─ imports: updateClubNomina                       │
│  ├─ imports: clearRosterState                       │
│  ├─ imports: selectClubPlayers                      │
│  ├─ imports: selectAvailableUsers                   │
│  ├─ imports: selectRosterLoading                    │
│  └─ imports: selectRosterError                      │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │ dispatches
                 ↓
┌─────────────────────────────────────────────────────┐
│        REDUX STATE MANAGEMENT (State Layer)         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  store.ts                                           │
│  └─ imports: clubRosterReducer                      │
│                                                     │
│  clubRosterSlice.ts                                 │
│  ├─ imports: fetchClubPlayers                       │
│  ├─ imports: fetchAvailableUsers                    │
│  ├─ imports: updateClubNomina                       │
│  ├─ exports: selectClubPlayers                      │
│  ├─ exports: selectAvailableUsers                   │
│  ├─ exports: selectRosterLoading                    │
│  ├─ exports: selectRosterError                      │
│  ├─ exports: clearRosterState (action)              │
│  ├─ exports: addPlayerOptimistic (action)           │
│  ├─ exports: removePlayerOptimistic (action)        │
│  └─ exports: default (reducer)                      │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │ triggers
                 ↓
┌─────────────────────────────────────────────────────┐
│      ASYNC THUNKS (Data Layer - Async Ops)          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  clubRosterThunks.ts                                │
│  ├─ fetchClubPlayers                                │
│  │  └─ Query: SELECT * FROM torneo_club_jugadores   │
│  │     WHERE club_id = ? AND tournament_id = ?      │
│  │                                                  │
│  ├─ fetchAvailableUsers                             │
│  │  ├─ Query: SELECT user_id FROM assigned players  │
│  │  └─ Query: SELECT * FROM usuarios (NOT assigned) │
│  │                                                  │
│  └─ updateClubNomina                                │
│     ├─ SELECT current players                       │
│     ├─ DELETE players not in new list               │
│     ├─ INSERT new players                           │
│     └─ SELECT updated roster                        │
│                                                     │
│  imports: supabase client                           │
│  imports: createAsyncThunk                          │
│                                                     │
└────────────────┬────────────────────────────────────┘
                 │ calls
                 ↓
┌─────────────────────────────────────────────────────┐
│         DATABASE (Supabase / Backend)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  torneo_club_jugadores table                        │
│  ├─ id, user_id, club_id, tournament_id             │
│  ├─ dorsal, posicion                                │
│  └─ RLS Policies (auth checks)                      │
│                                                     │
│  usuarios table                                     │
│  ├─ id, name, email, role                           │
│  └─ RLS Policies                                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📦 Module Dependencies Tree

```
src/
│
├── hooks/
│   └── useClubRoster.ts
│       ├─ IMPORTS:
│       │  ├─ useCallback (React)
│       │  ├─ useMemo (React)
│       │  ├─ useAppDispatch
│       │  ├─ useAppSelector
│       │  ├─ fetchClubPlayers
│       │  ├─ fetchAvailableUsers
│       │  ├─ updateClubNomina
│       │  ├─ clearRosterState
│       │  ├─ selectClubPlayers
│       │  ├─ selectAvailableUsers
│       │  ├─ selectRosterLoading
│       │  └─ selectRosterError
│       │
│       └─ EXPORTS:
│          └─ useClubRoster (hook)
│
├── store/
│   ├── store.ts
│   │   ├─ IMPORTS:
│   │   │  ├─ configureStore (Redux Toolkit)
│   │   │  ├─ persistence middleware
│   │   │  └─ clubRosterReducer ◄──────────┐
│   │   │                                   │
│   │   └─ EXPORTS:                          │
│   │      ├─ store (configured)             │
│   │      ├─ RootState (type)               │
│   │      └─ AppDispatch (type)             │
│   │                                        │
│   ├── slices/
│   │   └── clubRosterSlice.ts ─────────────┘
│   │       ├─ IMPORTS:
│   │       │  ├─ createSlice
│   │       │  ├─ PayloadAction
│   │       │  ├─ fetchClubPlayers
│   │       │  ├─ fetchAvailableUsers
│   │       │  └─ updateClubNomina
│   │       │
│   │       ├─ EXPORTS:
│   │       │  ├─ ClubPlayer (interface)
│   │       │  ├─ AvailableUser (interface)
│   │       │  ├─ ClubRosterState (interface)
│   │       │  ├─ selectClubPlayers
│   │       │  ├─ selectAvailableUsers
│   │       │  ├─ selectRosterLoading
│   │       │  ├─ selectRosterError
│   │       │  ├─ selectRosterUpdateLoading
│   │       │  ├─ clearRosterState (action)
│   │       │  ├─ addPlayerOptimistic (action)
│   │       │  ├─ removePlayerOptimistic (action)
│   │       │  └─ default (reducer)
│   │       │
│   │       └─ REDUCERS + EXTRA REDUCERS:
│   │          ├─ fetchClubPlayers pending/fulfilled/rejected
│   │          ├─ fetchAvailableUsers pending/fulfilled/rejected
│   │          └─ updateClubNomina pending/fulfilled/rejected
│   │
│   └── thunks/
│       └── clubRosterThunks.ts
│           ├─ IMPORTS:
│           │  ├─ createAsyncThunk
│           │  ├─ supabaseClient
│           │  └─ interfaces (ClubPlayer, AvailableUser)
│           │
│           └─ EXPORTS:
│              ├─ fetchClubPlayers (Thunk)
│              ├─ fetchAvailableUsers (Thunk)
│              ├─ updateClubNomina (Thunk)
│              └─ clearRosterState (helper)
│
├── components/
│   └── Copa/
│       ├── UpdateNominaModal.tsx
│       │   ├─ IMPORTS:
│       │   │  ├─ React, useEffect, useState, useCallback
│       │   │  ├─ Framer Motion (motion, AnimatePresence)
│       │   │  ├─ Lucide (X, Search, Plus, Trash2, Loader)
│       │   │  └─ useClubRoster
│       │   │
│       │   ├─ PROPS:
│       │   │  ├─ isOpen: boolean
│       │   │  ├─ clubId: string
│       │   │  ├─ clubName: string
│       │   │  ├─ tournamentId: string
│       │   │  ├─ onClose: () => void
│       │   │  └─ onSuccess: () => void
│       │   │
│       │   └─ FEATURES:
│       │      ├─ Search filter
│       │      ├─ Multi-select checkboxes
│       │      ├─ Loading states
│       │      ├─ Error handling
│       │      ├─ Responsive design
│       │      └─ Framer Motion animations
│       │
│       ├── ClubRosterTable.tsx
│       │   ├─ IMPORTS:
│       │   │  ├─ React, useState, useCallback
│       │   │  ├─ UpdateNominaModal
│       │   │  ├─ useAppSelector
│       │   │  ├─ selectAuthUser
│       │   │  └─ Lucide Icons
│       │   │
│       │   ├─ COMPONENTS:
│       │   │  ├─ ClubRosterTableRow (React.memo)
│       │   │  └─ ClubRosterTable (main)
│       │   │
│       │   ├─ PROPS:
│       │   │  ├─ clubs: Club[]
│       │   │  ├─ tournamentId: string
│       │   │  ├─ onRosterUpdated: () => void
│       │   │  └─ loading?: boolean
│       │   │
│       │   └─ FEATURES:
│       │      ├─ React.memo optimization
│       │      ├─ Permission validation
│       │      ├─ Responsive table
│       │      ├─ Desktop/Mobile buttons
│       │      └─ Dropdown menu (mobile)
│       │
│       ├── ClubRosterIntegrationExample.tsx
│       │   └─ Ejemplos de uso y patrones
│       │
│       └── ... otras componentes Copa
│
└── utils/
    └── rosterPermissions.ts
        ├─ EXPORTS:
        │  ├─ canEditClubRoster(userRole)
        │  ├─ canViewClubPlayers(userRole)
        │  ├─ canDeletePlayer(userRole, isOwner)
        │  └─ getRosterPermissionLevel(userRole)
        │
        └─ TYPES:
           └─ UserRole = 'admin' | 'dt' | 'jugador' | null
```

---

## 🔄 Data Flow Cycle

```
USER ACTION
    │
    ├─ CLICK "Nómina" button
    │  └─→ ClubRosterTable → ClubRosterTableRow
    │       └─→ Opens UpdateNominaModal (state: isOpen = true)
    │
    └─→ MODAL OPENS
       │
       ├─→ useEffect fires
       │   ├─ loadClubPlayers()
       │   │  └─→ dispatch(fetchClubPlayers)
       │   │      └─→ Redux: clubRoster.loading = true
       │   │          Redux: clubRoster.clubPlayers = [...]
       │   │
       │   └─ loadAvailableUsers()
       │      └─→ dispatch(fetchAvailableUsers)
       │         └─→ Redux: clubRoster.availableUsers = [...]
       │
       ├─→ UI RENDERS with data
       │   ├─ availableUsers list shows
       │   ├─ Search input appears
       │   └─ Checkboxes ready to interact
       │
       └─→ USER SELECTS PLAYERS
          │
          ├─ onClick checkbox
          │  └─→ togglePlayerSelection(userId)
          │      └─→ setState(selectedPlayerIds)
          │          └─→ COMPONENT RE-RENDERS (local)
          │
          └─→ USER CLICKS "GUARDAR"
             │
             ├─→ handleSave()
             │  └─→ updateNomina(selectedPlayerIds)
             │      └─→ dispatch(updateClubNomina)
             │          └─→ Redux: clubRoster.updateLoading = true
             │              Supabase: BEGIN TRANSACTION
             │              ├─ SELECT current players
             │              ├─ DELETE old players
             │              ├─ INSERT new players
             │              └─ SELECT updated roster
             │              Supabase: COMMIT
             │              Redux: clubRoster.clubPlayers = [updated]
             │              Redux: clubRoster.updateLoading = false
             │
             └─→ MODAL CLOSES
                ├─→ handleClose()
                │   ├─ cleanup()
                │   │  └─→ dispatch(clearRosterState)
                │   │      └─→ Redux state reset
                │   │
                │   └─ setState(isOpen = false)
                │
                └─→ onSuccess() callback
                   └─→ Parent component reloads clubs list
```

---

## 🔐 Security Boundaries

```
┌─ Frontend Validation ─────────────────────────┐
│                                                │
│  1. canEditClubRoster(user.role)              │
│     Check if user can edit                     │
│     ├─ admin → ✅                              │
│     ├─ dt → ✅                                 │
│     └─ other → ❌ (no button shown)            │
│                                                │
│  2. Modal not rendered if !canEdit             │
│                                                │
│  3. Loading states prevent multiple clicks     │
│                                                │
│  4. Form validation before submit              │
│                                                │
└────────────┬────────────────────────────────────┘
             │ NETWORK CALL (HTTPS)
             ↓
┌─ Backend Security (Supabase RLS) ────────────┐
│                                                │
│  1. User Authentication Check                  │
│     token must be valid                        │
│                                                │
│  2. Row Level Security Policies                │
│     ├─ Admin policy: CRUD on all rows          │
│     ├─ DT policy: CRUD only own clubs          │
│     └─ Other: DENY                             │
│                                                │
│  3. Data Validation on Server                  │
│     ├─ clubId must exist                       │
│     ├─ tournamentId must exist                 │
│     └─ userIds must be valid                   │
│                                                │
│  4. Query Integrity                            │
│     ├─ Foreign key constraints                 │
│     ├─ Unique constraint prevention             │
│     └─ Transaction safety                      │
│                                                │
└────────────────────────────────────────────────┘
```

---

## 📈 Component Hierarchy

```
App
└── TournamentAdminPage (your page)
    └── ClubRosterTable
        ├── ClubRosterTableRow (React.memo)
        │   └── UpdateNominaModal
        │       ├── useClubRoster (hook)
        │       ├── useAppDispatch
        │       ├── useAppSelector
        │       ├── Framer Motion animations
        │       └── Lucide icons + Tailwind CSS
        │
        ├── ClubRosterTableRow
        │   └── UpdateNominaModal
        │
        └── ClubRosterTableRow
            └── UpdateNominaModal
```

---

## 🎯 Key Integration Points

```
1. Import ClubRosterTable in your admin page
   └─ Pass clubs, tournamentId, onRosterUpdated

2. useClubRoster Hook
   └─ Used internally by UpdateNominaModal
      Can be used directly if needed

3. Redux Store
   └─ clubRoster reducer must be in store

4. Supabase
   └─ torneo_club_jugadores table must exist
      RLS policies must be configured

5. User Permissions
   └─ user.role checked via canEditClubRoster
      Only admin/dt can edit
```

---

## 🚀 Performance Optimizations Applied

```
1. React.memo
   └─ ClubRosterTableRow prevents unnecessary re-renders

2. useCallback
   └─ Functions memoized (loadClubPlayers, updateNomina, etc)

3. useMemo
   └─ filteredAvailableUsers computed once per dependency change

4. Redux Selectors
   └─ createSelector pattern (auto-memoized)

5. Batch Queries
   └─ Single Thunk dispatch instead of multiple calls

6. State Cleanup
   └─ clearRosterState prevents data leaks
```

---

## 🔗 File Dependencies Summary

**Total files created: 10**

| File | Type | Dependencies | Purpose |
|------|------|---|---|
| useClubRoster.ts | Hook | Redux, Thunks | Logic encapsulation |
| clubRosterSlice.ts | Redux | Thunks | State management |
| clubRosterThunks.ts | Async | Supabase | Async operations |
| UpdateNominaModal.tsx | Component | Hook, Redux, Motion | Modal UI |
| ClubRosterTable.tsx | Component | Modal, Redux | Table UI |
| ClubRosterIntegrationExample.tsx | Doc | Components | Usage examples |
| rosterPermissions.ts | Utility | Types | Permission checks |
| store.ts | Config | Slice | Redux config |
| README_CLUB_ROSTER.md | Doc | - | Complete guide |
| ARCHITECTURE_CLUB_ROSTER.md | Doc | - | Architecture |
| CLUB_ROSTER_VALIDATION_CHECKLIST.md | Doc | - | Validation |
| QUICK_START_CLUB_ROSTER.md | Doc | - | Quick start |

**No breaking changes** - All existing code remains compatible ✅
