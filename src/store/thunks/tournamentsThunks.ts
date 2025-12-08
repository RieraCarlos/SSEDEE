// src/store/thunks/tournamentsThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { TournamentsService } from "@/services/tournaments.services";
import type { Tournament } from "@/api/type/tournaments.api";

export const fetchTournaments = createAsyncThunk<Tournament[]>(
  "tournaments/fetchTournaments",
  async (_, { rejectWithValue }) => {
    try {
      const tournaments = await TournamentsService.getTournaments();
      return tournaments || [];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);
