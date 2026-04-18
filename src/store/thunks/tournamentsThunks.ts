import { createAsyncThunk } from "@reduxjs/toolkit";
import { TournamentsService } from "@/services/tournaments.services";
import type { Tournament } from "@/api/type/tournaments.api";
import { supabase } from "@/api/supabaseClient";

export const fetchTournaments = createAsyncThunk<Tournament[]>(
  "tournaments/fetchTournaments",
  async (_, { rejectWithValue }) => {
    const { data, error } = await TournamentsService.getTournaments();
    if (error) return rejectWithValue(error.message);
    return data || [];
  }
);

export const createTournament = createAsyncThunk<
  Tournament,
  { name: string; n_equipos: number; fecha: string[]; id_user: string; tipo: string }
>("tournaments/create", async (payload, { rejectWithValue }) => {
  const { data, error } = await TournamentsService.createTournament(payload);
  if (error || !data) return rejectWithValue(error?.message || "Failed to create tournament");
  return data;
});

export const addTeamToTournament = createAsyncThunk<
  Tournament,
  { tournamentId: string; teams: string[] }
>("tournaments/addTeam", async ({ tournamentId, teams }, { rejectWithValue }) => {
  const { data, error } = await TournamentsService.updateTournamentTeams(tournamentId, teams);
  if (error || !data) return rejectWithValue(error?.message || "Failed to update tournament");
  return data;
});

// Fase 2: Persistencia de Partidos (Thunks)
export const fetchTournamentMatches = createAsyncThunk(
  "tournaments/fetchMatches",
  async (tournamentId: string | string[], { rejectWithValue }) => {
    try {
      const ids = Array.isArray(tournamentId) ? tournamentId : [tournamentId];
      const validIds = ids.filter(id => id && typeof id === 'string' && id.length > 0 && !id.includes('placeholder'));

      if (validIds.length === 0) {
        return [];
      }

      // 1. Smart Resolution: Check if any of these validIds are actually SPORT IDs
      let resolvedTournamentIds = [...validIds];

      const { data: categorias } = await supabase
        .from('categorias')
        .select('id')
        .in('id_deporte', validIds);

      if (categorias && categorias.length > 0) {
        const catIds = categorias.map(c => c.id);
        const { data: torneos } = await supabase
          .from('torneos')
          .select('id')
          .in('id_categoria', catIds);

        if (torneos && torneos.length > 0) {
          const tIds = torneos.map(t => t.id);
          // Combine original IDs with resolved Tournament IDs
          resolvedTournamentIds = Array.from(new Set([...resolvedTournamentIds, ...tIds]));
        }
      }

      // 2. Fetch matches using all resolved Tournament IDs
      const { data, error } = await supabase
        .from('partidos_calendario')
        .select(`
          *,
          torneos(name),
          local:equipo_local_id(name),
          visita:equipo_visitante_id(name)
        `)
        .in('torneo_id', resolvedTournamentIds)
        .order('fecha_partido', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveTournamentFixture = createAsyncThunk(
  "tournaments/saveFixture",
  async (matches: any[], { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('partidos_calendario')
        .insert(matches)
        .select();

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchStandings = createAsyncThunk(
  "tournaments/fetchStandings",
  async (_, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('tabla_posiciones')
      .select(`
        *,
        club:clubes(name)
      `)
      .order('pts', { ascending: false })
      .order('gd', { ascending: false });

    if (error) return rejectWithValue(error.message);
    return data;
  }
);

export const fetchTournamentTeams = createAsyncThunk(
  "tournaments/fetchTeams",
  async (tournamentId: string, { rejectWithValue }) => {
    try {
      // 1. Obtener IDs de equipos del torneo
      const { data: tournaments, error: tError } = await supabase
        .from('torneos')
        .select('equipos')
        .eq('id', tournamentId)
        .limit(1);

      const tournament = tournaments?.[0];

      if (tError) throw tError;
      if (!tournament?.equipos || tournament.equipos.length === 0) return [];

      // 2. Obtener detalles de los clubes
      const { data: clubs, error: cError } = await supabase
        .from('clubes')
        .select('id, name, logo_url')
        .in('id', tournament.equipos);

      if (cError) throw cError;

      return clubs || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTournamentDetails = createAsyncThunk(
  "tournaments/fetchDetails",
  async (tournamentId: string, { rejectWithValue }) => {
    try {
      if (!tournamentId || tournamentId.includes('placeholder')) return null;

      const { data: tournaments, error: error } = await supabase
        .from('torneos')
        .select('name')
        .eq('id', tournamentId)
        .limit(1);

      const data = tournaments?.[0];

      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTournamentStatsLeaders = createAsyncThunk(
  "tournaments/fetchStatsLeaders",
  async (tournamentId: string | string[], { rejectWithValue }) => {
    try {
      const ids = Array.isArray(tournamentId) ? tournamentId : [tournamentId];
      const validIds = ids.filter(id => id && typeof id === 'string' && id.length > 0 && !id.includes('placeholder'));

      if (validIds.length === 0) return [];

      // Smart Resolution: Check if any of these validIds are SPORT IDs
      let resolvedTournamentIds = [...validIds];

      const { data: categorias } = await supabase
        .from('categorias')
        .select('id')
        .in('id_deporte', validIds);

      if (categorias && categorias.length > 0) {
        const catIds = categorias.map(c => c.id);
        const { data: torneos } = await supabase
          .from('torneos')
          .select('id')
          .in('id_categoria', catIds);

        if (torneos && torneos.length > 0) {
          const tIds = torneos.map(t => t.id);
          resolvedTournamentIds = Array.from(new Set([...resolvedTournamentIds, ...tIds]));
        }
      }

      if (resolvedTournamentIds.length === 0) return [];

      const { data, error } = await supabase
        .from('partidos_sucesos')
        .select(`
          jugador_nombre,
          tipo,
          equipo,
          partido:partidos_calendario!inner(torneo_id)
        `)
        .in('partido.torneo_id', resolvedTournamentIds)
        .in('tipo', ['gol', 'punto_basket', 'punto_voley']);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
export const updateTournamentMatch = createAsyncThunk(
  "tournaments/updateMatch",
  async ({ matchId, data }: { matchId: string; data: { fecha_partido: string; hora_inicio: string } }, { rejectWithValue }) => {
    try {
      const { data: updated, error } = await supabase
        .from('partidos_calendario')
        .update(data)
        .eq('id', matchId)
        .select()
        .single();

      if (error) throw error;
      return updated;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSportTeams = createAsyncThunk(
  "tournaments/fetchSportTeams",
  async (sportId: string, { rejectWithValue }) => {
    try {
      // 1. Obtener categorias asociadas al deporte
      const { data: categorias, error: catError } = await supabase
        .from('categorias')
        .select('id')
        .eq('id_deporte', sportId);

      if (catError) throw catError;
      if (!categorias || categorias.length === 0) return [];

      const categoryIds = categorias.map(c => c.id);

      // 2. Obtener torneos que pertenecen a estas categorias
      const { data: torneos, error: tError } = await supabase
        .from('torneos')
        .select('equipos')
        .in('id_categoria', categoryIds);

      if (tError) throw tError;
      if (!torneos || torneos.length === 0) return [];

      // 3. Extraer todos los IDs de equipos (clubes) únicos de todos los torneos
      const teamIdSet = new Set<string>();
      torneos.forEach(t => {
        if (t.equipos && Array.isArray(t.equipos)) {
          t.equipos.forEach((id: string) => teamIdSet.add(id));
        }
      });

      const uniqueTeamIds = Array.from(teamIdSet);
      if (uniqueTeamIds.length === 0) return [];

      // 4. Obtener detalles de los clubes
      const { data: clubs, error: cError } = await supabase
        .from('clubes')
        .select('id, name, logo_url')
        .in('id', uniqueTeamIds);

      if (cError) throw cError;

      return clubs || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

