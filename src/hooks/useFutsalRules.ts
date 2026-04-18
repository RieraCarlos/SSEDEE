import { useMemo, useCallback } from 'react';
import { useAppSelector } from './useAppSelector';
import { selectLiveMatchState } from '@/store/slices/liveMatchSlice';

/**
 * Hook de Dominio para las Reglas Específicas de Fútbol Sala (Futsal)
 * 
 * LÓGICA DE FALTAS:
 * 1. Contador de faltas por período comienza en 0
 * 2. Al acumular 6 faltas → Se otorga el primer TIRO_LIBRE_6_FALTAS
 * 3. Después de 6ta falta → Cada nueva falta genera automáticamente un TIRO_LIBRE (sin resetear)
 * 4. Cambio de período → Contador vuelve a 0 y reinicia el ciclo
 * 
 * El sistema reconoce:
 * - `atLimit`: true cuando hay 6 o más faltas y aún NO se ha confirmado el tiro libre
 * - `isAutoFreeThrow`: true cuando hay más de 6 faltas (auto-tiro libre para cada nueva falta)
 */
export function useFutsalRules(logEvent: (type: string, team: 'local' | 'visita', pId: string, pName: string, meta: any) => Promise<void>) {
  const { events, currentPeriod, config, localName, visitaName } = useAppSelector(selectLiveMatchState);

  const isFutsal = config?.id === 'futsal' || config?.id === 'futbol sala';

  const foulState = useMemo(() => {
    if (!isFutsal) return null;

    // ========================================
    // FILTRADO POR PERÍODO ACTUAL
    // ========================================
    // Faltas cometidas en el período actual
    const localFouls = events.filter(e => e.type === 'falta' && e.team === 'local' && e.periodo === currentPeriod);
    const visitaFouls = events.filter(e => e.type === 'falta' && e.team === 'visita' && e.periodo === currentPeriod);

    // Eventos de Tiro Libre otorgado (6ta falta confirmada)
    // Estos eventos NO resetean el contador, solo marcan que se cobró un tiro libre
    const localFreeThrows = events.filter(e => e.type === 'TIRO_LIBRE_6_FALTAS' && e.team === 'local' && e.periodo === currentPeriod);
    const visitaFreeThrows = events.filter(e => e.type === 'TIRO_LIBRE_6_FALTAS' && e.team === 'visita' && e.periodo === currentPeriod);

    // ========================================
    // LÓGICA DE CONTEO
    // ========================================
    // El contador es simplemente el total de faltas en este período
    const localFoulCount = localFouls.length;
    const visitaFoulCount = visitaFouls.length;

    // Determinar si estamos en el ciclo de auto-tiro libre
    // - Si count < 6: esperando llegar a 6
    // - Si count === 6: mostrar modal para confirmar (atLimit = true)
    // - Si count > 6: ya en modo auto-tiro libre (cada nueva falta es tiro libre)
    const localAtLimit = localFoulCount === 6 && localFreeThrows.length === 0;
    const visitaAtLimit = visitaFoulCount === 6 && visitaFreeThrows.length === 0;

    const localInAutoFreeThrow = localFoulCount > 6;
    const visitaInAutoFreeThrow = visitaFoulCount > 6;

    return {
      local: {
        count: localFoulCount,
        atLimit: localAtLimit, // Mostrar modal cuando llega a exactamente 6
        isAutoFreeThrow: localInAutoFreeThrow, // Cada nueva falta = tiro libre automático
        freeThrowsAwarded: localFreeThrows.length, // Cuántos tiros libres ya se cobraron
        name: localName,
      },
      visita: {
        count: visitaFoulCount,
        atLimit: visitaAtLimit,
        isAutoFreeThrow: visitaInAutoFreeThrow,
        freeThrowsAwarded: visitaFreeThrows.length,
        name: visitaName,
      }
    };
  }, [isFutsal, events, currentPeriod, localName, visitaName]);

  /**
   * Confirma el primer tiro libre al alcanzar 6 faltas
   * Solo se usa una vez por período (cuando count === 6)
   */
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
