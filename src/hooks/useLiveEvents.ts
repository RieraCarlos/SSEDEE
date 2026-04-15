import { useEffect, useState } from 'react';
import { supabase } from '@/api/supabaseClient';

export interface LiveMatch {
  id: string;
  torneo_id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  goles_local: number;
  goles_visitante: number;
  is_active: boolean;
  local_name?: string;
  visita_name?: string;
  discipline?: string;
  // Estadísticas Extendidas
  faltas_local?: number;
  faltas_visita?: number;
  amarillas_local?: number;
  amarillas_visita?: number;
  rojas_local?: number;
  rojas_visita?: number;
  periodo?: number;
}

/**
 * Custom Hook: useLiveEvents
 * Manages real-time subscription to active matches for a specific tournament.
 */
export const useLiveEvents = (tournamentIds: string | string[]) => {
  const [activeMatches, setActiveMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[useLiveEvents] tournamentIds recibido:', tournamentIds);
    if (!tournamentIds) {
      console.log('[useLiveEvents] tournamentIds es nulo/vacío, retornando');
      return;
    }
    const ids = Array.isArray(tournamentIds) ? tournamentIds : [tournamentIds];
    const validIds = ids.filter(id => id && typeof id === 'string' && id.length > 0 && !id.includes('placeholder'));
    console.log('[useLiveEvents] validIds después de filtrar:', validIds);
    if (validIds.length === 0) {
      console.log('[useLiveEvents] No hay validIds, retornando');
      return;
    }

    // 1. Initial Fetch and Resolution
    const fetchActiveMatches = async () => {
      setLoading(true);
      console.log('[useLiveEvents] Iniciando fetchActiveMatches con validIds:', validIds);
      
      // Smart Resolution: Check if any validIds are SPORT IDs
      let resolvedTournamentIds = [...validIds];
      
      const { data: categorias } = await supabase
        .from('categorias')
        .select('id')
        .in('id_deporte', validIds);

      console.log('[useLiveEvents] Categorías encontradas:', categorias);
      if (categorias && categorias.length > 0) {
        const catIds = categorias.map(c => c.id);
        const { data: torneos } = await supabase
          .from('torneos')
          .select('id')
          .in('id_categoria', catIds);
          
        console.log('[useLiveEvents] Torneos encontrados por categorías:', torneos);
        if (torneos && torneos.length > 0) {
          const tIds = torneos.map(t => t.id);
          resolvedTournamentIds = Array.from(new Set([...resolvedTournamentIds, ...tIds]));
        }
      }

      console.log('[useLiveEvents] resolvedTournamentIds finales:', resolvedTournamentIds);
      const { data, error } = await supabase
        .from('partidos_calendario')
        .select(`
          *,
          local:equipo_local_id(name),
          visita:equipo_visitante_id(name),
          torneos(
            name,
            categorias(
              deportes(nombre)
            )
          )
        `)
        .in('torneo_id', resolvedTournamentIds)
        .eq('is_active', true);

      console.log('[useLiveEvents] Data de partidos activos:', data);
      console.log('[useLiveEvents] Error:', error);
      if (!error && data) {
        const formatted = data.map((m: any) => ({
          ...m,
          local_name: m.local?.name,
          visita_name: m.visita?.name,
          discipline: m.torneos?.categorias?.deportes?.nombre
        }));
        console.log('[useLiveEvents] Partidos formateados:', formatted);
        setActiveMatches(formatted);
      }
      setLoading(false);
      
      return resolvedTournamentIds;
    };

    // 2. Realtime Subscriptions (Dynamic based on resolution)
    let channels: any[] = [];
    
    fetchActiveMatches().then((resolvedTournamentIds) => {
      console.log('[useLiveEvents] Suscribiendo a cambios en tiempo real para:', resolvedTournamentIds);
      if (!resolvedTournamentIds || resolvedTournamentIds.length === 0) {
        console.log('[useLiveEvents] No hay resolvedTournamentIds, no se crean suscripciones');
        return;
      }
      
      channels = resolvedTournamentIds.map(id => {
        return supabase
          .channel(`live-matches-${id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'partidos_calendario',
              filter: `torneo_id=eq.${id}`
            },
            () => {
              fetchActiveMatches();
            }
          )
          .subscribe();
      });
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [JSON.stringify(tournamentIds)]);

  return { activeMatches, loading };
};
