import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/api/supabaseClient';
import { setActiveMatch, setLiveEvents, setLoading, setCurrentPeriod, type NominaMember } from '../slices/liveMatchSlice';
import type { MatchEvent } from '@/core/disciplines';
import { toast } from 'sonner';
import type { RootState } from '../store';

/**
 * Thunk para hidratar toda la información de un partido en vivo
 * desde la base de datos (Partido, Clubes, Nóminas y Sucesos).
 */
export const fetchLiveMatchData = createAsyncThunk(
  'liveMatch/fetchData',
  async (matchId: string, { dispatch }) => {
    dispatch(setLoading(true));
    try {
      // 1. Obtener detalles del partido
      const { data: match, error: matchError } = await supabase
        .from('partidos_calendario')
        .select('*')
        .eq('id', matchId)
        .maybeSingle();

      if (matchError) throw matchError;
      if (!match) {
        throw new Error(`El partido con ID ${matchId} no existe en la base de datos.`);
      }

      // 1.1 Obtener Deporte del torneo
      const { data: tournaments, error: tourError } = await supabase
        .from('torneos')
        .select(`
          id_categoria,
          categorias (
            id_deporte,
            deportes (
              nombre
            )
          )
        `)
        .eq('id', match.torneo_id)
        .limit(1);
      
      const tournamentData = tournaments?.[0];
      
      if (tourError) {
        console.warn("No se pudo obtener la información del torneo:", tourError);
      }
      
      const sportName = (tournamentData as any)?.categorias?.deportes?.nombre || 'futbol';

      // 2. Obtener detalles de los clubes (Nombres y Logos)
      const { data: clubs, error: clubsError } = await supabase
        .from('clubes')
        .select('*')
        .in('id', [match.equipo_local_id, match.equipo_visitante_id]);

      if (clubsError) throw clubsError;

      const localClub = clubs.find(c => c.id === match.equipo_local_id);
      const visitaClub = clubs.find(c => c.id === match.equipo_visitante_id);

      // 3. Obtener Nóminas de ambos equipos
      const { data: rosters, error: rostersError } = await supabase
        .from('nominas')
        .select('*')
        .in('id_club', [match.equipo_local_id, match.equipo_visitante_id]);

      if (rostersError) throw rostersError;

      const localRoster = (rosters || [])
        .filter(r => r.id_club === match.equipo_local_id)
        .map(r => ({ ...r, id: r.id.toString() })); // Asegurar ID como string

      const visitaRoster = (rosters || [])
        .filter(r => r.id_club === match.equipo_visitante_id)
        .map(r => ({ ...r, id: r.id.toString() }));

      // 4. Obtener Sucesos (Eventos) ya registrados
      const { data: events, error: eventsError } = await supabase
        .from('partidos_sucesos')
        .select('*')
        .eq('partido_id', matchId)
        .order('created_at', { ascending: true });

      if (eventsError) throw eventsError;

      const formattedEvents: MatchEvent[] = (events || []).map(e => ({
        id: e.id,
        type: e.tipo,
        team: e.equipo as 'local' | 'visita',
        playerId: e.jugador_id,
        playerName: e.jugador_nombre,
        minute: e.minuto || 0,
        periodo: e.periodo || e.metadata?.periodo || 1,
        timestamp: e.created_at,
        metadata: e.metadata || {}
      }));

      // 4.1 Determinar periodo actual (el mayor encontrado en sucesos)
      const maxPeriod = Math.max(...formattedEvents.map(e => e.metadata?.periodo || 1), 1);

      // 5. Consolidar en el Estado Global
      dispatch(setActiveMatch({
        id: match.id,
        disciplineId: sportName,
        local: localClub?.name || "Equipo Local",
        localId: match.equipo_local_id,
        visita: visitaClub?.name || "Equipo Visitante",
        visitaId: match.equipo_visitante_id,
        localLogo: localClub?.logo_url,
        visitaLogo: visitaClub?.logo_url,
        localRoster: localRoster as NominaMember[],
        visitaRoster: visitaRoster as NominaMember[]
      }));

      dispatch(setLiveEvents(formattedEvents));
      dispatch(setCurrentPeriod(maxPeriod));

      return { success: true };

    } catch (error: any) {
      console.error("Error hidratando datos del partido en vivo:", error);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

/**
 * Thunk para finalizar el partido, guardar reporte y actualizar posiciones.
 */
export const finalizeMatchThunk = createAsyncThunk(
  'liveMatch/finalize',
  async (observations: string, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const { 
      activeMatchId, 
      events, 
      localName, 
      visitaName, 
      localId,
      visitaId
    } = state.liveMatch;

    if (!activeMatchId) return rejectWithValue("No hay un partido activo para finalizar.");

    // Lógica dinámica de puntaje según el deporte
    const scoreRules = state.liveMatch.config?.scoreRules || [];
    
    let scoreLocal = 0;
    let scoreVisita = 0;

    events.forEach(event => {
      const rule = scoreRules.find(r => r.id === event.type);
      if (rule) {
        if (event.team === 'local') scoreLocal += rule.points;
        else scoreVisita += rule.points;
      } else if (event.type === 'gol') {
        // Fallback para fútbol si la configuración no está cargada o es legacy
        if (event.team === 'local') scoreLocal += 1;
        else scoreVisita += 1;
      }
    });

    try {
      // 1. Insertar en resultados_partidos para disparar el trigger de posiciones
      const winnerId = scoreLocal > scoreVisita 
        ? localId 
        : scoreVisita > scoreLocal 
          ? visitaId 
          : null;

      const { error: resultError } = await supabase
        .from('resultados_partidos')
        .insert({
          partido_id: activeMatchId,
          goles_local: scoreLocal,
          goles_visitante: scoreVisita,
          ganador_id: winnerId
        });

      if (resultError) throw resultError;

      // 2. Construir reporte final JSONB
      const finalReport = {
        local: localName,
        visita: visitaName,
        marcador: `${scoreLocal} - ${scoreVisita}`,
        eventos: events,
        observaciones: observations,
        fecha_finalizacion: new Date().toISOString(),
        header_oficial: "Sistema de Seguimiento y Entretenimiento Deportivo en Ecuador"
      };

      // 3. Actualizar partidos_calendario
      const { error: updateError } = await supabase
        .from('partidos_calendario')
        .update({ 
          is_active: false,
          reporte_final: finalReport,
          goles_local: scoreLocal,
          goles_visitante: scoreVisita
        })
        .eq('id', activeMatchId);

      if (updateError) throw updateError;

      toast.success('¡Partido finalizado y posiciones actualizadas!');
      return { success: true, finalReport };

    } catch (error: any) {
      console.error('Error al finalizar partido:', error);
      toast.error('Error al finalizar: ' + (error.message || 'Error desconocido'));
      return rejectWithValue(error.message);
    }
  }
);
