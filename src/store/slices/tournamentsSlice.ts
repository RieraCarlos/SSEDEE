// src/store/slices/tournamentsSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Tournament } from '@/api/type/tournaments.api';
import { fetchTournaments } from '../thunks/tournamentsThunks';
import type { RootState } from '@/store/store';

interface TournamentsState {
  tournaments: Tournament[];
  loading: boolean;
  error?: string | null;
}

const initialState: TournamentsState = {
  tournaments: [],
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
      });
  },
});

export const selectTournaments = (state: RootState) => state.tournaments.tournaments;
export const selectTournamentsLoading = (state: RootState) => state.tournaments.loading;

export default tournamentsSlice.reducer;
