import { useCallback, useMemo } from 'react';
import { useAppDispatch } from '@/hooks/useAppDispatch';
import { useAppSelector } from '@/hooks/useAppSelector';
import {
  fetchClubPlayers,
  fetchAvailableUsers,
  updateClubNomina,
} from '@/store/thunks/clubRosterThunks';
import {
  selectClubPlayers,
  selectAvailableUsers,
  selectRosterLoading,
  selectRosterError,
  selectRosterUpdateLoading,
  clearRosterState,
} from '@/store/slices/clubRosterSlice';

/**
 * Custom Hook para gestionar la nómina (roster) de un club
 * Encapsula toda la lógica de comunicación con Redux y Supabase
 * 
 * @param clubId - ID del club
 * @param tournamentId - ID del torneo
 * @returns Objeto con métodos y estado para gestionar la nómina
 */
export const useClubRoster = (clubId: string | null, tournamentId?: string | null) => {
  const dispatch = useAppDispatch();

  // Selectores del estado global
  const clubPlayers = useAppSelector(selectClubPlayers);
  const availableUsers = useAppSelector(selectAvailableUsers);
  const loading = useAppSelector(selectRosterLoading);
  const updateLoading = useAppSelector(selectRosterUpdateLoading);
  const error = useAppSelector(selectRosterError);

  /**
   * Obtiene los jugadores del club desde la tabla de nómina
   */
  const loadClubPlayers = useCallback(async () => {
    if (!clubId) return;
    await dispatch(fetchClubPlayers({ clubId, tournamentId: tournamentId || undefined }) as any);
  }, [clubId, tournamentId, dispatch]);

  /**
   * Obtiene la lista de usuarios disponibles para asignar al club
   */
  const loadAvailableUsers = useCallback(async () => {
    if (!clubId) return;
    await dispatch(fetchAvailableUsers({ clubId, tournamentId: tournamentId || undefined }) as any);
  }, [clubId, tournamentId, dispatch]);

  /**
   * Actualiza la nómina del club con los nuevos jugadores
   */
  const updateNomina = useCallback(
    async (playerIds: string[]) => {
      if (!clubId) {
        throw new Error('Club ID es requerido');
      }

      return await dispatch(
        updateClubNomina({
          clubId,
          playerIds,
        }) as any
      );
    },
    [clubId, dispatch]
  );

  /**
   * Limpia el estado temporal de la nómina
   * Se ejecuta al cerrar el modal para evitar data bleeding
   */
  const cleanup = useCallback(() => {
    dispatch(clearRosterState());
  }, [dispatch]);

  /**
   * Filtra usuarios disponibles excluyendo los ya asignados
   */
  const filteredAvailableUsers = useMemo(() => {
    if (!availableUsers || !clubPlayers) return [];

    const assignedPlayerIds = new Set(clubPlayers.map((p: any) => p.id));
    return availableUsers.filter((user: any) => !assignedPlayerIds.has(user.id));
  }, [availableUsers, clubPlayers]);

  return {
    clubPlayers,
    availableUsers: filteredAvailableUsers,
    loading,
    updateLoading,
    error,
    loadClubPlayers,
    loadAvailableUsers,
    updateNomina,
    cleanup,
  };
};
