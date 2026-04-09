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
  async (tournamentId: string, { rejectWithValue }) => {
    const { data, error } = await supabase
      .from('partidos_calendario')
      .select('*')
      .eq('torneo_id', tournamentId);
    
    if (error) return rejectWithValue(error.message);
    return data;
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
