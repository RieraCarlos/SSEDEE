import { useMemo, useCallback } from 'react';
import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { selectLiveMatchState, setCurrentPeriod } from '@/store/slices/liveMatchSlice';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';

/**
 * Hook de Dominio para la Lógica del Partido (DDD)
 * Encapsula reglas específicas por deporte (Fútbol, Futsal, Basketball, EcuaVoley).
 */
export function useMatchLogic() {
  const dispatch = useAppDispatch();
  const { 
    activeMatchId, 
    config, 
    events, 
    currentPeriod 
  } = useAppSelector(selectLiveMatchState);

  // 1. Nombre dinámico del periodo (e.g., "1er Cuarto", "2do Tiempo")
  const currentPeriodName = useMemo(() => {
    if (!config) return 'En Juego';
    const name = config.periods.name;
    
    // Lógica para EcuaVoley (Sets)
    if (config.id === 'ecuavoley') {
      return `Set ${currentPeriod}`;
    }

    // Lógica para Basketball (Cuartos)
    if (config.id === 'basketball') {
      return `${currentPeriod}º ${name}`;
    }

    // Genérico (Tiempo 1, Tiempo 2)
    return `${currentPeriod}º ${name}`;
  }, [config, currentPeriod]);

  // 2. Resumen de Tarjetas (Amarillas y Rojas)
  const cardSummary = useMemo(() => {
    const localYellow = events.filter(e => e.type === 'amarilla' && e.team === 'local').length;
    const localRed = events.filter(e => e.type === 'roja' && e.team === 'local').length;
    const visitaYellow = events.filter(e => e.type === 'amarilla' && e.team === 'visita').length;
    const visitaRed = events.filter(e => e.type === 'roja' && e.team === 'visita').length;

    return {
      local: { yellow: localYellow, red: localRed },
      visita: { yellow: visitaYellow, red: visitaRed }
    };
  }, [events]);

  // 3. Lógica de EcuaVoley: Puntos por Set
  const ecuaVoleySets = useMemo(() => {
    if (config?.id !== 'ecuavoley') return null;

    const sets = Array.from({ length: 3 }, (_, i) => ({
      periodo: i + 1,
      local: events.filter(e => e.type === 'punto' && e.team === 'local' && e.metadata?.periodo === (i + 1)).length,
      visita: events.filter(e => e.type === 'punto' && e.team === 'visita' && e.metadata?.periodo === (i + 1)).length
    }));

    return sets;
  }, [config, events]);

  // 4. Avance de Periodo
  const advancePeriod = useCallback(async () => {
    if (!activeMatchId || !config) return;

    const nextP = currentPeriod + 1;
    if (nextP > config.periods.count) {
      toast.info("Has llegado al último periodo configurado.");
      return;
    }

    try {
      // Registrar evento de cambio de periodo para auditoría
      const { error } = await supabase
        .from('partidos_sucesos')
        .insert([{
          partido_id: activeMatchId,
          tipo: 'cambio_periodo',
          equipo: 'local', // Evento neutral, usamos local por esquema
          jugador_id: 'SYSTEM',
          jugador_nombre: `INICIO ${nextP}º ${config.periods.name}`,
          periodo: nextP
        }]);

      if (error) throw error;

      dispatch(setCurrentPeriod(nextP));
      toast.success(`Iniciando ${nextP}º ${config.periods.name}`);
    } catch (error: any) {
      toast.error("Error al avanzar periodo: " + error.message);
    }
  }, [activeMatchId, config, currentPeriod, dispatch]);

    const currentSetPoints = config?.id === 'ecuavoley' ? {
      local: events.filter(e => e.type === 'punto' && e.team === 'local' && e.periodo === currentPeriod).length,
      visita: events.filter(e => e.type === 'punto' && e.team === 'visita' && e.periodo === currentPeriod).length
    } : null;

    // Lógica de desempate / ganador de partido para EcuaVoley
    const matchWinner = useMemo(() => {
      if (config?.id !== 'ecuavoley') return null;
      
      let localWins = 0;
      let visitaWins = 0;

      // Calcular sets cerrados (anteriores)
      for (let i = 1; i < currentPeriod; i++) {
        const lPoints = events.filter(e => e.type === 'punto' && e.team === 'local' && e.periodo === i).length;
        const vPoints = events.filter(e => e.type === 'punto' && e.team === 'visita' && e.periodo === i).length;
        if (lPoints > vPoints) localWins++;
        else if (vPoints > lPoints) visitaWins++;
      }

      // Si alguien ya tiene 2 victorias tras sets anteriores, o estamos en el último set posible
      if (localWins >= 2) return 'local';
      if (visitaWins >= 2) return 'visita';

      // Si el partido está avanzado y alguien ha ganado la mayoría requerida en el set actual FINAL
      // (Esta lógica se aplica al cerrar el partido)
      return null;
    }, [config, events, currentPeriod]);

    // Función auxiliar para saber si al avanzar se termina (para el botón de la UI)
    const willMatchEndOnAdvance = useMemo(() => {
      if (config?.id !== 'ecuavoley') return currentPeriod >= config?.periods.count!;
      
      let localWins = 0;
      let visitaWins = 0;
      for (let i = 1; i < currentPeriod; i++) {
        const lPoints = events.filter(e => e.type === 'punto' && e.team === 'local' && e.periodo === i).length;
        const vPoints = events.filter(e => e.type === 'punto' && e.team === 'visita' && e.periodo === i).length;
        if (lPoints > vPoints) localWins++;
        else if (vPoints > lPoints) visitaWins++;
      }

      const currentL = currentSetPoints?.local || 0;
      const currentV = currentSetPoints?.visita || 0;

      const potentialLocalWins = localWins + (currentL > currentV ? 1 : 0);
      const potentialVisitaWins = visitaWins + (currentV > currentL ? 1 : 0);

      // Si después de este set alguien tiene 2 victorias, el partido termina
      return potentialLocalWins >= 2 || potentialVisitaWins >= 2 || currentPeriod >= config.periods.count;
    }, [config, currentPeriod, events, currentSetPoints]);

  return {
    currentPeriodName,
    cardSummary,
    ecuaVoleySets,
    currentSetPoints,
    advancePeriod,
    currentPeriod,
    matchWinner,
    willMatchEndOnAdvance
  };
}
