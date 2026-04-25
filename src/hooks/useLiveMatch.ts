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
import { checkNominaVerificacionThunk, resetVerificacionState } from '@/store/slices/nominaVerificacionSlice';
import { 
  addLiveEvent, 
  removeLiveEvent,
  selectLiveMatchState, 
  selectLiveScores,
  selectLiveStatsSummary,
} from '@/store/slices/liveMatchSlice';
import { useMatchEvents } from './useMatchEvents';

/**
 * Custom Hook para la Gestión del Partido en Vivo (SOLID)
 * Centraliza fetching, suscripciones (Realtime) y lógica de eventos.
 */
export function useLiveMatch() {
  const { matchId } = useParams<{ matchId: string }>();
  const dispatch = useAppDispatch();
  const matchState = useAppSelector(selectLiveMatchState);
  const scores = useAppSelector(selectLiveScores);
  useAppSelector(selectLiveStatsSummary); // Subscription only for now

  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  const isValidMatchId = !!matchId && uuidRegex.test(matchId);

  // ... (Efectos previos se mantienen igual)
  useEffect(() => {
    if (isValidMatchId) {
      dispatch(fetchLiveMatchData(matchId));
      dispatch(checkNominaVerificacionThunk(matchId));
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
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'partidos_sucesos',
          filter: `partido_id=eq.${matchId}`,
        },
        (payload) => {
          const oldEvent = payload.old as any;
          if (oldEvent && oldEvent.id) {
            dispatch(removeLiveEvent(oldEvent.id));
          }
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
      dispatch(resetVerificacionState());
    };
  }, [matchId, isValidMatchId, dispatch]);

  // 3. Acciones de Administración mediante Hook Externo
  const { createEvent: logEvent, deleteEvent } = useMatchEvents(
    isValidMatchId ? matchId : '',
    { scoreLocal: scores.scoreLocal, scoreVisita: scores.scoreVisita },
    matchState.currentPeriod,
    matchState.config?.scoreRules || []
  );

  const finalizeMatch = useCallback(async (observations: string) => {
    if (!isValidMatchId) return;
    return dispatch(finalizeMatchThunk(observations)).unwrap();
  }, [matchId, isValidMatchId, dispatch]);

  return {
    ...matchState,
    ...scores,
    logEvent,
    deleteEvent,
    finalizeMatch,
    isValidMatchId,
    error: matchState.error
  };
}
