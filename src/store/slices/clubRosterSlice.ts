import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  fetchClubPlayers,
  fetchAvailableUsers,
  updateClubNomina,
  uploadCsvNomina,
} from '@/store/thunks/clubRosterThunks';

export interface ClubPlayer {
  id: string;
  id_club: string | null;
  fullname: string;
  email: string;
  role: string;
  posicion?: string | null;
  alias?: string | null;
  altura?: number | null;
  fecha_nacimiento?: string | null;
  avatar?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export type AvailableUser = ClubPlayer;

export interface ClubRosterState {
  clubPlayers: ClubPlayer[];
  availableUsers: AvailableUser[];
  loading: boolean;
  error: string | null;
  updateLoading: boolean;
}

const initialState: ClubRosterState = {
  clubPlayers: [],
  availableUsers: [],
  loading: false,
  error: null,
  updateLoading: false,
};

const clubRosterSlice = createSlice({
  name: 'clubRoster',
  initialState,
  reducers: {
    /**
     * Limpia el estado de la nómina
     * Se ejecuta al cerrar el modal para evitar data bleeding
     */
    clearRosterState: (state) => {
      state.clubPlayers = [];
      state.availableUsers = [];
      state.error = null;
      state.updateLoading = false;
    },

    /**
     * Actualización optimista: agrega un jugador localmente
     * antes de que la petición se complete
     */
    addPlayerOptimistic: (state, action: PayloadAction<ClubPlayer>) => {
      state.clubPlayers.push(action.payload);
    },

    /**
     * Actualización optimista: elimina un jugador localmente
     */
    removePlayerOptimistic: (state, action: PayloadAction<string>) => {
      state.clubPlayers = state.clubPlayers.filter(
        (p) => p.id !== action.payload
      );
    },
  },
  extraReducers: (builder) => {
    // fetchClubPlayers
    builder
      .addCase(fetchClubPlayers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClubPlayers.fulfilled, (state, action) => {
        state.loading = false;
        state.clubPlayers = action.payload;
      })
      .addCase(fetchClubPlayers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchAvailableUsers
    builder
      .addCase(fetchAvailableUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.availableUsers = action.payload;
      })
      .addCase(fetchAvailableUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateClubNomina
    builder
      .addCase(updateClubNomina.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateClubNomina.fulfilled, (state, action) => {
        state.updateLoading = false;
        // Actualiza la lista local con los datos retornados del servidor
        state.clubPlayers = action.payload;
      })
      .addCase(updateClubNomina.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });

    // uploadCsvNomina
    builder
      .addCase(uploadCsvNomina.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(uploadCsvNomina.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.clubPlayers = action.payload; // Reemplaza la nómina por completo en UI
      })
      .addCase(uploadCsvNomina.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload as string;
      });
  },
});

/**
 * Selectores
 */
export const selectClubPlayers = (state: any) =>
  state.clubRoster.clubPlayers;

export const selectAvailableUsers = (state: any) =>
  state.clubRoster.availableUsers;

export const selectRosterLoading = (state: any) =>
  state.clubRoster.loading;

export const selectRosterError = (state: any) => state.clubRoster.error;

export const selectRosterUpdateLoading = (state: any) =>
  state.clubRoster.updateLoading;

export const {
  clearRosterState,
  addPlayerOptimistic,
  removePlayerOptimistic,
} = clubRosterSlice.actions;

export default clubRosterSlice.reducer;
