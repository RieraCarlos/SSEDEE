import { createSlice, createSelector, type PayloadAction } from '@reduxjs/toolkit';
import { fetchStandings } from '../thunks/tournamentsThunks'; // Usamos el thunk existente modificado
import type { RootState } from '../store';
import { TOURNAMENT_GROUPS } from '@/config/constants';

interface StandingsState {
  rawStandings: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: StandingsState = {
  rawStandings: [],
  isLoading: false,
  error: null,
};

const standingsSlice = createSlice({
  name: 'standings',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStandings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStandings.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.isLoading = false;
        state.rawStandings = action.payload;
      })
      .addCase(fetchStandings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectRawStandings = (state: RootState) => state.standings.rawStandings;
export const selectStandingsLoading = (state: RootState) => state.standings.isLoading;

// === RESELECT: Lógica de Normalización y Consolidación ===
// Evita re-cálculos si rawStandings no ha cambiado

export const selectConsolidatedStandings = createSelector(
  [selectRawStandings],
  (rawStandings) => {
    const filterAndMap = (allowedIds: string[]) => {
      // 1. Filtrar los que pertenecen a la categoría
      const filtered = rawStandings.filter((row) => allowedIds.includes(row.torneo_id));
      
      // 2. Mapear para uniformidad (Incluso si están repetidos, pero sabemos que 1 Club = 1 Torneo)
      const mapped = filtered.map(item => ({
        id: item.club_id || item.id, // ID del club como key fundamental
        nameClub: item.club?.name || "Desconocido",
        logoUrl: item.club?.logo_url,
        pj: item.pj || 0,
        pg: item.pg || 0,
        pe: item.pe || 0,
        pp: item.pp || 0,
        gf: item.gf || 0,
        gc: item.gc || 0,
        gd: item.gd || 0,
        pts: item.pts || 0,
      }));

      // No agruparemos por suma ya que garantizamos que 1 club = 1 torneo
      
      // 3. Ordenamiento: Puntos DESC, Diferencia de Goles DESC
      return mapped.sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        return b.gd - a.gd;
      });
    };

    return {
      masculino: filterAndMap(TOURNAMENT_GROUPS.MASCULINO),
      femenino: filterAndMap(TOURNAMENT_GROUPS.FEMENINO),
      dorados: filterAndMap(TOURNAMENT_GROUPS.DORADOS),
    };
  }
);

export default standingsSlice.reducer;
