import { useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { supabase } from '@/api/supabaseClient';
import { toast } from 'sonner';
import { 
  fetchLiveMatchData, 
  finalizeMatchThunk 
} from '@/store/thunks/liveMatchThunks';
import { 
  addLiveEvent, 
  selectLiveMatchState, 
  selectLiveScores,
  selectLiveStatsSummary,
} from '@/store/slices/liveMatchSlice';

/**
 * Custom Hook para la Gestión del Partido en Vivo (SOLID)
 * Centraliza fetching, suscripciones (Realtime) y lógica de eventos.
 */
export function useLiveMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const dispatch = useAppDispatch();
  const matchState = useAppSelector(selectLiveMatchState);
  const scores = useAppSelector(selectLiveScores);
  const stats = useAppSelector(selectLiveStatsSummary);

  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const isValidMatchId = !!matchId && uuidRegex.test(matchId);

  // ... (Efectos previos se mantienen igual)
  useEffect(() => {
    if (isValidMatchId) {
      dispatch(fetchLiveMatchData(matchId));
    }
  }, [matchId, dispatch, isValidMatchId]);

  useEffect(() => {
    if (!isValidMatchId) return;

    // Suscripción a Sucesos (Goles, Tarjetas)
    const eventsChannel = supabase
      .channel(`match_events_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partidos_sucesos',
          filter: `partido_id=eq.${matchId}`,
        },
        (payload) => {
          const newEvent = payload.new as any;
          dispatch(addLiveEvent({
            id: newEvent.id,
            type: newEvent.tipo,
            team: newEvent.equipo,
            playerId: newEvent.jugador_id,
            playerName: newEvent.jugador_nombre,
            metadata: newEvent.metadata,
            periodo: newEvent.periodo,
            minute: newEvent.minuto || 0,
            timestamp: newEvent.created_at
          }));
        }
      )
      .subscribe();

    const matchChannel = supabase
      .channel(`match_status_${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'partidos_calendario',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          if (payload.new.is_active === false) {
            toast.info("El partido ha finalizado.");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(eventsChannel);
      supabase.removeChannel(matchChannel);
    };
  }, [matchId, isValidMatchId, dispatch]);

  // 3. Acciones de Administración
  const logEvent = useCallback(async (type: string, team: 'local' | 'visita', playerId: string, playerName: string, metadata?: any) => {
    if (!isValidMatchId) return;

    try {
      // 1. Registrar el suceso detallado
      const { error: eventError } = await supabase
        .from('partidos_sucesos')
        .insert([{
          partido_id: matchId,
          tipo: type,
          equipo: team,
          jugador_id: playerId,
          jugador_nombre: playerName,
          metadata: metadata,
          periodo: metadata?.periodo || matchState.currentPeriod
        }]);

      if (eventError) throw eventError;

      // 2. Sincronizar Marcador y Estadísticas Globales (Atomic Update)
      // Nota: Aunque Redux se actualiza vía Realtime, forzamos un update aquí 
      // para asegurar que el portal público (que solo lee partidos_calendario) se refresque.
      
      const scoreRules = matchState.config?.scoreRules || [];
      const scoreRule = scoreRules.find(r => r.id === type);
      const pointsToAdd = scoreRule?.points || (type === 'gol' || type === 'punto' ? 1 : 0);

      // Calculamos los nuevos valores basados en el estado actual + el nuevo evento
      const updateData: any = {
        goles_local: team === 'local' ? scores.scoreLocal + pointsToAdd : scores.scoreLocal,
        goles_visitante: team === 'visita' ? scores.scoreVisita + pointsToAdd : scores.scoreVisita
      };

      const { error: scoreError } = await supabase
        .from('partidos_calendario')
        .update(updateData)
        .eq('id', matchId);

      if (scoreError) console.error("Error sincronizando estadísticas:", scoreError);

    } catch (error: any) {
      toast.error("Error al registrar evento: " + error.message);
    }
  }, [matchId, isValidMatchId, scores, stats, matchState.config, matchState.currentPeriod]);

  const finalizeMatch = useCallback(async (observations: string) => {
    if (!isValidMatchId) return;
    return dispatch(finalizeMatchThunk(observations)).unwrap();
  }, [matchId, isValidMatchId, dispatch]);

  return {
    ...matchState,
    ...scores,
    logEvent,
    finalizeMatch,
    isValidMatchId,
    error: matchState.error
  };
}
