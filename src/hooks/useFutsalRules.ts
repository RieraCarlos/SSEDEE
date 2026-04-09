import { useMemo, useCallback } from 'react';
import { useAppSelector } from './useAppSelector';
import { selectLiveMatchState } from '@/store/slices/liveMatchSlice';

/**
 * Hook de Dominio para las Reglas Específicas de Fútbol Sala
 * Maneja la lógica de ciclos de faltas acumuladas (6ta falta).
 */
export function useFutsalRules(logEvent: (type: string, team: 'local' | 'visita', pId: string, pName: string, meta: any) => Promise<void>) {
  const { events, currentPeriod, config, localName, visitaName } = useAppSelector(selectLiveMatchState);

  const isFutsal = config?.id === 'futsal' || config?.id === 'futbol sala';

  const foulState = useMemo(() => {
    if (!isFutsal) return null;

    // Filtramos las faltas del periodo actual
    const localFouls = events.filter(e => e.type === 'falta' && e.team === 'local' && e.periodo === currentPeriod);
    const visitaFouls = events.filter(e => e.type === 'falta' && e.team === 'visita' && e.periodo === currentPeriod);

    // Filtramos los eventos de Tiro Libre (Reseteos) del periodo actual
    const localResets = events.filter(e => e.type === 'TIRO_LIBRE_6_FALTAS' && e.team === 'local' && e.periodo === currentPeriod).length;
    const visitaResets = events.filter(e => e.type === 'TIRO_LIBRE_6_FALTAS' && e.team === 'visita' && e.periodo === currentPeriod).length;

    // Conteo visual de este ciclo
    const localVisualCount = localFouls.length - (localResets * 6);
    const visitaVisualCount = visitaFouls.length - (visitaResets * 6);

    return {
      local: {
        count: localVisualCount >= 0 ? localVisualCount : 0,
        atLimit: localVisualCount >= 6,
        name: localName,
        total: localFouls.length
      },
      visita: {
        count: visitaVisualCount >= 0 ? visitaVisualCount : 0,
        atLimit: visitaVisualCount >= 6,
        name: visitaName,
        total: visitaFouls.length
      }
    };
  }, [isFutsal, events, currentPeriod, localName, visitaName]);

  const confirmTiroLibre = useCallback(async (team: 'local' | 'visita') => {
    await logEvent(
      'TIRO_LIBRE_6_FALTAS', 
      team, 
      'SYSTEM', 
      `6ta Falta Alcanzada - Tiro Libre Directo Otorgado`, 
      { periodo: currentPeriod }
    );
  }, [logEvent, currentPeriod]);

  return {
    isFutsal,
    foulState,
    confirmTiroLibre
  };
}
