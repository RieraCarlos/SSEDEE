// src/store/slices/tournamentsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Tournament } from '@/api/type/tournaments.api';
import { 
  fetchTournaments, 
  createTournament, 
  addTeamToTournament, 
  fetchStandings, 
  fetchTournamentTeams,
  fetchTournamentMatches,
  fetchTournamentDetails,
  fetchTournamentStatsLeaders,
  updateTournamentMatch
} from '../thunks/tournamentsThunks';
import type { RootState } from '@/store/store';

interface TournamentsState {
  tournaments: Tournament[];
  standings: any[];
  tournamentTeams: any[];
  portalMatches: any[];
  portalStats: any[];
  activeTournamentMeta: any | null;
  loading: boolean;
  teamsLoading: boolean;
  heroLoading: boolean;
  timelineLoading: boolean;
  statsLoading: boolean;
  error?: string | null;
  heroError?: string | null;
  timelineError?: string | null;
  statsError?: string | null;
}

const initialState: TournamentsState = {
  tournaments: [],
  standings: [],
  tournamentTeams: [],
  portalMatches: [],
  portalStats: [],
  activeTournamentMeta: null,
  loading: false,
  teamsLoading: false,
  heroLoading: false,
  timelineLoading: false,
  statsLoading: false,
  error: null,
  heroError: null,
  timelineError: null,
  statsError: null,
};

const tournamentsSlice = createSlice({
  name: 'tournaments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTournaments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTournaments.fulfilled, (state, action: PayloadAction<Tournament[]>) => {
        state.loading = false;
        state.tournaments = action.payload;
      })
      .addCase(fetchTournaments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTournamentMatches.pending, (state) => {
        state.timelineLoading = true;
        state.timelineError = null;
      })
      .addCase(fetchTournamentMatches.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.timelineLoading = false;
        state.portalMatches = action.payload;
      })
      .addCase(fetchTournamentMatches.rejected, (state, action) => {
        state.timelineLoading = false;
        state.timelineError = action.payload as string;
      })
      .addCase(createTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTournament.fulfilled, (state, action: PayloadAction<Tournament>) => {
        state.loading = false;
        state.tournaments.push(action.payload);
      })
      .addCase(createTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTeamToTournament.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTeamToTournament.fulfilled, (state, action: PayloadAction<Tournament>) => {
        state.loading = false;
        const index = state.tournaments.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.tournaments[index] = action.payload;
        }
      })
      .addCase(addTeamToTournament.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStandings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchStandings.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.loading = false;
        state.standings = action.payload;
      })
      .addCase(fetchStandings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTournamentTeams.pending, (state) => {
        state.teamsLoading = true;
        state.error = null;
      })
      .addCase(fetchTournamentTeams.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.teamsLoading = false;
        state.tournamentTeams = action.payload;
      })
      .addCase(fetchTournamentTeams.rejected, (state, action) => {
        state.teamsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchTournamentDetails.pending, (state) => {
        state.heroLoading = true;
        state.heroError = null;
      })
      .addCase(fetchTournamentDetails.fulfilled, (state, action: PayloadAction<any>) => {
        state.heroLoading = false;
        state.activeTournamentMeta = action.payload;
      })
      .addCase(fetchTournamentDetails.rejected, (state, action) => {
        state.heroLoading = false;
        state.heroError = action.payload as string;
      })
      .addCase(fetchTournamentStatsLeaders.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(fetchTournamentStatsLeaders.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.statsLoading = false;
        state.portalStats = action.payload;
      })
      .addCase(fetchTournamentStatsLeaders.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload as string;
      })
      .addCase(updateTournamentMatch.pending, (state) => {
        state.timelineLoading = true;
        state.timelineError = null;
      })
      .addCase(updateTournamentMatch.fulfilled, (state, action: PayloadAction<any>) => {
        state.timelineLoading = false;
        const index = state.portalMatches.findIndex(m => m.id === action.payload.id);
        if (index !== -1) {
          state.portalMatches[index] = {
            ...state.portalMatches[index],
            ...action.payload
          };
        }
      })
      .addCase(updateTournamentMatch.rejected, (state, action) => {
        state.timelineLoading = false;
        state.timelineError = action.payload as string;
      });
  },
});

export const selectTournaments = (state: RootState) => state.tournaments.tournaments;
export const selectStandings = (state: RootState) => state.tournaments.standings;
export const selectTournamentTeams = (state: RootState) => state.tournaments.tournamentTeams;
export const selectPortalMatches = (state: RootState) => state.tournaments.portalMatches;
export const selectPortalStats = (state: RootState) => state.tournaments.portalStats;
export const selectActiveTournamentMeta = (state: RootState) => state.tournaments.activeTournamentMeta;

export const selectTournamentsLoading = (state: RootState) => state.tournaments.loading;
export const selectTeamsLoading = (state: RootState) => state.tournaments.teamsLoading;
export const selectHeroLoading = (state: RootState) => state.tournaments.heroLoading;
export const selectTimelineLoading = (state: RootState) => state.tournaments.timelineLoading;
export const selectStatsLoading = (state: RootState) => state.tournaments.statsLoading;

export const selectHeroError = (state: RootState) => state.tournaments.heroError;
export const selectTimelineError = (state: RootState) => state.tournaments.timelineError;
export const selectStatsError = (state: RootState) => state.tournaments.statsError;

export default tournamentsSlice.reducer;
