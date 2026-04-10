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
      const { data, error } = await supabase
        .from('partidos_calendario')
        .select(`
          *,
          torneos(name),
          local:equipo_local_id(name),
          visita:equipo_visitante_id(name)
        `)
        .in('torneo_id', ids)
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
      const { data: tournament, error: tError } = await supabase
        .from('torneos')
        .select('equipos')
        .eq('id', tournamentId)
        .single();
      
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
      const { data, error } = await supabase
        .from('torneos')
        .select('name')
        .eq('id', tournamentId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTournamentStatsLeaders = createAsyncThunk(
  "tournaments/fetchStatsLeaders",
  async (tournamentId: string, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('partidos_sucesos')
        .select(`
          jugador_nombre,
          tipo,
          equipo,
          partido:partidos_calendario!inner(torneo_id)
        `)
        .eq('partido.torneo_id', tournamentId)
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
