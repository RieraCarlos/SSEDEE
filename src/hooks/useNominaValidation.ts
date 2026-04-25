import { useCallback, useMemo, useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { 
  selectNominaVerificacion, 
  setPlayerSelection, 
  saveNominaVerificacionThunk,
  checkNominaVerificacionThunk
} from '@/store/slices/nominaVerificacionSlice';
import type { PlayerStatus } from '@/store/slices/nominaVerificacionSlice';

export function useNominaValidation(matchId: string, rosters: any[]) {
  const dispatch = useAppDispatch();
  const { selections, status, isLoading, error, readOnly } = useAppSelector(selectNominaVerificacion);

  // 1. CARGA INICIAL: Si el matchId cambia, verificamos si ya existe una nomina guardada
  useEffect(() => {
    if (matchId) {
      dispatch(checkNominaVerificacionThunk(matchId));
    }
    // Eliminamos el reset al desmontar para evitar bucles infinitos con el Scoreboard
  }, [matchId, dispatch]);

  // Filter out any undefined or invalid player objects in the roster just in case
  const validRosters = useMemo(() => rosters.filter(p => p && p.id), [rosters]);
  const totalCount = validRosters.length;

  const verifiedCount = useMemo(() => {
    let count = 0;
    validRosters.forEach(player => {
      const state = selections[player.id];
      if (state === 'presente' || state === 'atrasado' || state === 'inasistencia') {
        count++;
      }
    });
    return count;
  }, [validRosters, selections]);

  const progress = totalCount > 0 ? Math.round((verifiedCount / totalCount) * 100) : 0;
  const isComplete = totalCount > 0 && verifiedCount === totalCount;

  const handleSelect = useCallback((playerId: string, st: PlayerStatus) => {
    if (readOnly) return;
    dispatch(setPlayerSelection({ playerId, status: st }));
  }, [dispatch, readOnly]);

  const getSegregatedArrays = useCallback(() => {
    const presentes: string[] = [];
    const atrasados: string[] = [];
    const faltantes: string[] = [];

    validRosters.forEach(player => {
      const st = selections[player.id];
      if (st === 'presente') presentes.push(player.id);
      else if (st === 'atrasado') atrasados.push(player.id);
      else if (st === 'inasistencia') faltantes.push(player.id);
    });

    return { presentes, atrasados, faltantes };
  }, [selections, validRosters]);

  const saveNomina = useCallback(async () => {
    if (!isComplete) throw new Error("Aún hay jugadores sin estado asignado.");
    
    const arrays = getSegregatedArrays();
    
    return dispatch(saveNominaVerificacionThunk({
      partidoId: matchId,
      presentes: arrays.presentes,
      atrasados: arrays.atrasados,
      faltantes: arrays.faltantes
    })).unwrap();
  }, [isComplete, matchId, getSegregatedArrays, dispatch]);

  return {
    selections,
    status,
    isLoading,
    error,
    readOnly,
    progress,
    verifiedCount,
    totalCount,
    isComplete,
    handleSelect,
    saveNomina
  };
}
