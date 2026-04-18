/**
 * EJEMPLO DE INTEGRACIÓN: Sistema de Actualización de Nómina
 * 
 * Este archivo documenta cómo integrar el componente ClubRosterTable
 * con el modal UpdateNominaModal en una página de administración de torneos.
 * 
 * PREREQUISITOS:
 * - Redux Store configurado con clubRosterReducer
 * - Supabase Client inicializado
 * - Componente UpdateNominaModal disponible
 * - Hook useClubRoster disponible
 */

import React, { useState, useCallback } from 'react';
import { ClubRosterTable } from '@/components/Copa/ClubRosterTable';

import { useAppSelector } from '@/hooks/useAppSelector';
import { selectAuthUser } from '@/store/slices/authSlice';
import { canEditClubRoster } from '@/utils/rosterPermissions';

/**
 * EJEMPLO 1: Integración en una página de administración de torneos
 */
export const TournamentAdminPage: React.FC<{
  tournamentId: string;
}> = ({ tournamentId }) => {
  const user = useAppSelector(selectAuthUser);
  const [clubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Simular carga de clubes
  const loadClubs = useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Implementar fetch real desde Supabase
      // const { data } = await supabase
      //   .from('tournament_clubs')
      //   .select('*')
      //   .eq('tournament_id', tournamentId);
      // setClubs(data);
    } finally {
      setLoading(false);
    }
  }, [tournamentId]);

  const handleRosterUpdated = useCallback(() => {
    loadClubs(); // Recargar lista después de actualizar nómina
  }, [loadClubs]);

  // Validar permisos
  if (!canEditClubRoster(user?.role)) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-400">
          No tienes permisos para editar las nóminas de los clubes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gestión de Nóminas</h1>
        <p className="text-gray-400 mt-2">
          Actualiza los jugadores de cada club para este torneo
        </p>
      </div>

      <ClubRosterTable
        clubs={clubs}
        tournamentId={tournamentId}
        onRosterUpdated={handleRosterUpdated}
        loading={loading}
      />
    </div>
  );
};

/**
 * EJEMPLO 2: Hook personalizado para gestión de nóminas
 * Uso en componentes que necesiten lógica compleja de actualización
 */
export const useClubRosterManagement = () => {
  const user = useAppSelector(selectAuthUser);
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);

  const canEdit = canEditClubRoster(user?.role);

  const handleClubSelect = useCallback((clubId: string) => {
    if (canEdit) {
      setSelectedClubId(clubId);
    }
  }, [canEdit]);

  return {
    selectedClubId,
    handleClubSelect,
    canEdit,
    isAdmin: user?.role === 'admin',
  };
};

/**
 * EJEMPLO 3: Validación de permisos en modal
 * El modal valida internamente usando el hook useAppSelector
 */
export const PermissionCheckExample = () => {
  const user = useAppSelector(selectAuthUser);

  // Esta validación ocurre dentro de UpdateNominaModal
  // automáticamente usando selectAuthUser
  
  return (
    <div>
      {canEditClubRoster(user?.role) ? (
        <p>Tienes permiso para actualizar nóminas</p>
      ) : (
        <p>No tienes permiso para actualizar nóminas</p>
      )}
    </div>
  );
};

/**
 * EJEMPLO 4: Implementación en componente Copa/TournamentClubs
 * 
 * Integración típica en el componente existente de administración de clubes:
 * 
 * ```tsx
 * import { ClubRosterTable } from '@/components/Copa/ClubRosterTable';
 * 
 * export const TournamentClubs: React.FC<{ tournamentId: string }> = ({
 *   tournamentId,
 * }) => {
 *   const [clubs, setClubs] = useState<any[]>([]);
 * 
 *   const handleRosterUpdated = () => {
 *     // Recargar clubs o actualizar el estado local
 *     loadClubs();
 *   };
 * 
 *   return (
 *     <ClubRosterTable
 *       clubs={clubs}
 *       tournamentId={tournamentId}
 *       onRosterUpdated={handleRosterUpdated}
 *     />
 *   );
 * };
 * ```
 */

/**
 * RESUMEN DE FLUJO:
 * 
 * 1. Usuario abre ClubRosterTable
 * 2. Hace clic en "Nómina" (desktop) o "Actualizar Nómina" (mobile)
 * 3. Se abre UpdateNominaModal
 * 4. Modal carga:
 *    - clubPlayers (jugadores actuales del club)
 *    - availableUsers (usuarios sin asignar)
 * 5. Usuario selecciona/deselecciona jugadores
 * 6. Hace clic en "Guardar"
 * 7. Se ejecuta updateNomina Thunk que:
 *    - Compara jugadores actuales vs nuevos
 *    - Elimina jugadores no seleccionados
 *    - Agrega nuevos jugadores seleccionados
 * 8. Modal cierra y TournamentClubs se recarga
 * 9. useCallback de memoización evita re-renders innecesarios
 * 
 * OPTIMIZACIONES:
 * - ClubRosterTableRow usa React.memo con comparador personalizado
 * - useClubRoster usa useMemo para filteredAvailableUsers
 * - UpdateNominaModal limpia estado con cleanup()
 * - Validación de permisos con canEditClubRoster()
 */

export default TournamentAdminPage;
