// src/store/slices/tournamentsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Tournament } from '@/api/type/tournaments.api';
import { fetchTournaments, createTournament, addTeamToTournament, fetchStandings } from '../thunks/tournamentsThunks';
import type { RootState } from '@/store/store';

interface TournamentsState {
  tournaments: Tournament[];
  standings: any[];
  loading: boolean;
  error?: string | null;
}

const initialState: TournamentsState = {
  tournaments: [],
  standings: [],
  loading: false,
  error: null,
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
      });
  },
});

export const selectTournaments = (state: RootState) => state.tournaments.tournaments;
export const selectStandings = (state: RootState) => state.tournaments.standings;
export const selectTournamentsLoading = (state: RootState) => state.tournaments.loading;

export default tournamentsSlice.reducer;
