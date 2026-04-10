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
    if (!tournamentIds) return;
    const ids = Array.isArray(tournamentIds) ? tournamentIds : [tournamentIds];
    const validIds = ids.filter(id => id && id.length > 0);
    if (validIds.length === 0) return;

    // 1. Initial Fetch
    const fetchActiveMatches = async () => {
      setLoading(true);
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
        .in('torneo_id', validIds)
        .eq('is_active', true);

      if (!error && data) {
        const formatted = data.map((m: any) => ({
          ...m,
          local_name: m.local?.name,
          visita_name: m.visita?.name,
          discipline: m.torneos?.categorias?.deportes?.nombre
        }));
        setActiveMatches(formatted);
      }
      setLoading(false);
    };

    fetchActiveMatches();

    // 2. Realtime Subscriptions (One channel per tournament ID)
    const channels = validIds.map(id => {
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

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [JSON.stringify(tournamentIds)]);

  return { activeMatches, loading };
};
