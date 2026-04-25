import { useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { MatchEvent } from '@/core/disciplines';
import { removeLiveEvent } from '@/store/slices/liveMatchSlice';

/**
 * Custom Hook: Maneja la lógica de creación y reversión de sucesos.
 * Desencadena la sincronización atómica con Supabase.
 */
export function useMatchEvents(
  matchId: string, 
  scores: { scoreLocal: number, scoreVisita: number }, 
  currentPeriod: number,
  scoreRules: any[]
) {
  const dispatch = useDispatch();

  const createEvent = useCallback(async (type: string, team: 'local' | 'visita', playerId: string, playerName: string, metadata?: any) => {
    if (!matchId) return;

    try {
      // 1. Inserción Directa
      const { data: newEvent, error: eventError } = await supabase
        .from('partidos_sucesos')
        .insert([{
          partido_id: matchId,
          tipo: type,
          equipo: team,
          jugador_id: playerId,
          jugador_nombre: playerName,
          metadata: metadata,
          periodo: metadata?.periodo || currentPeriod
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // 2. Recalcular marcador si es una regla de puntuación
      const scoreRule = scoreRules.find(r => r.id === type);
      const pointsToAdd = scoreRule?.points || (type === 'gol' || type === 'punto' ? 1 : 0);

      if (pointsToAdd > 0) {
        const updateData: any = {
          goles_local: team === 'local' ? scores.scoreLocal + pointsToAdd : scores.scoreLocal,
          goles_visitante: team === 'visita' ? scores.scoreVisita + pointsToAdd : scores.scoreVisita
        };

        const { error: scoreError } = await supabase
          .from('partidos_calendario')
          .update(updateData)
          .eq('id', matchId);

        if (scoreError) console.error("Error sincronizando estadísticas (Puntos +):", scoreError);
      }
      
      return newEvent;

    } catch (error: any) {
      toast.error("Error al registrar evento: " + error.message);
      throw error;
    }
  }, [matchId, scores, currentPeriod, scoreRules]);

  const deleteEvent = useCallback(async (event: MatchEvent) => {
    if (!matchId || !event.id) return;

    try {
      // 1. Eliminación Directa con Select para validar RLS
      const { data: deletedRows, error: deleteError } = await supabase
        .from('partidos_sucesos')
        .delete()
        .eq('id', event.id)
        .select();

      if (deleteError) throw deleteError;
      if (!deletedRows || deletedRows.length === 0) {
        throw new Error("Permisos insuficientes o fila no encontrada (Verifica Políticas RLS de DELETE).");
      }

      // Optimistic Update Frontend
      dispatch(removeLiveEvent(event.id));

      // 2. Reverso de Marcador si era puntuación
      const scoreRule = scoreRules.find(r => r.id === event.type);
      const pointsToSubtract = scoreRule?.points || (event.type === 'gol' || event.type === 'punto' ? 1 : 0);

      if (pointsToSubtract > 0) {
        // Asegurarse de que el score no sea negativo (Idempotencia)
        const currentLocal = scores.scoreLocal;
        const currentVisita = scores.scoreVisita;

        const updateData: any = {
          goles_local: event.team === 'local' ? Math.max(0, currentLocal - pointsToSubtract) : currentLocal,
          goles_visitante: event.team === 'visita' ? Math.max(0, currentVisita - pointsToSubtract) : currentVisita
        };

        const { error: scoreError } = await supabase
          .from('partidos_calendario')
          .update(updateData)
          .eq('id', matchId);

        if (scoreError) console.error("Error revirtiendo estadísticas (Puntos -):", scoreError);
      }

      toast.success("El registro fue anulado exitosamente.");
    } catch (error: any) {
      toast.error("Error al revertir acción: " + error.message);
      throw error;
    }
  }, [matchId, scores, scoreRules]);

  return {
    createEvent,
    deleteEvent
  };
}
