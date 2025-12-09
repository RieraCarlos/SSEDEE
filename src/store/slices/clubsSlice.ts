import {createSlice, type PayloadAction, createSelector} from '@reduxjs/toolkit'
import {fetchClubs, createClub, fetchClubPlayers, fetchNominaCupos, assignCupoToPlayer, removeCupoFromPlayer, editMatchDate, editCupoSelectionTime, fetchMatchDate, updateMatchDates, updateMatchHours, updateClubHorario, updateTeamsPlayers, getTeamsPlayers, fetchGuardadoMatches, toggleMatchDateState, saveMatchResult, assignPlayerToChaleco, fetchChalecoPlayer, updatePartidoUbicacion, fetchPartidoUbicacion, fetchClubNameById, fetchClub } from '@/store/thunks/clubsThunks'
import type { Club } from '@/api/type/clubs.api';
import type { RootState } from '../store';
import { selectAuthUser } from './authSlice';

interface MatchDate {
    id: string;
    recordId?: string; // id of fecha_horarios record
    id_club: string;
    fecha: string;
    horario: string[] | string;
    estado: 'habilitado' | 'deshabilitado' | 'guardado';
    partidoId?: string | null;
}

interface ClubState{
    clubs: Club[]
    loading: boolean
    error?: string | null
    players: any[]
    nomina: string[] | null
    matchDates: MatchDate[]
    guardadoHistory: any[]
    chalecoPlayerName: string | null; // New field for chaleco player
    ubicacion: string | null; // New field for court location
    clubName: string | null;
    backgroundClub:string | null;
    currentClub: Club | null;
}

const initialState: ClubState = {
    clubs: [],
    loading: false,
    error: null, 
    players: [],
    nomina: null,
    matchDates: [],
    guardadoHistory: [],
    chalecoPlayerName: null,
    ubicacion: null, // Initialize ubicacion
    clubName: null,
    backgroundClub:null,
    currentClub: null,
}

const clubsSlice = createSlice({
    name: 'clubs',
    initialState,
    reducers:{
        setClubLoading(state, action: PayloadAction<boolean>){
            state.loading = action.payload;
        },
        setClubs(state, action:PayloadAction<Club[]>){
            state.clubs = action.payload;
            state.error = null;
        },
        setClubError(state, action:PayloadAction<string | null>){
            state.error = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchClubs.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(fetchClubs.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false
            state.clubs = action.payload || []
        })
        .addCase(fetchClubs.rejected, (state, action) => {
            state.loading = false
            state.error = action.error?.message ?? 'Error fetching clubs'
        })
        .addCase(createClub.fulfilled, (state, action: PayloadAction<any>) => {
            // append the created club
            state.clubs.unshift(action.payload)
        })
        .addCase(fetchClubPlayers.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(fetchClubPlayers.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false
            state.players = action.payload || []
        })
        .addCase(fetchClubPlayers.rejected, (state, action) => {
            state.loading = false
            state.error = action.error?.message ?? 'Error fetching club players'
        })
        .addCase(fetchNominaCupos.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(fetchNominaCupos.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false
            state.nomina = action.payload ?? null
        })
        .addCase(fetchNominaCupos.rejected, (state, action) => {
            state.loading = false
            state.error = action.error?.message ?? 'Error fetching nomina'
        })
        .addCase(assignCupoToPlayer.pending, (state) => {
            state.loading = true
            state.error = null
        })
        .addCase(assignCupoToPlayer.fulfilled, (state, action) => {
            state.loading = false;
            const { playerId } = action.meta.arg;
            if (state.nomina && !state.nomina.includes(playerId)) {
                state.nomina.push(playerId);
            }
        })
        .addCase(assignCupoToPlayer.rejected, (state, action) => {
            state.loading = false
            state.error = action.error?.message ?? 'Error assigning cupo'
        })
        .addCase(removeCupoFromPlayer.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(removeCupoFromPlayer.fulfilled, (state, action) => {
            state.loading = false;
            const { playerId } = action.meta.arg;
            if (state.nomina) {
                state.nomina = state.nomina.filter(id => id !== playerId);
            }
        })
        .addCase(removeCupoFromPlayer.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error removing cupo';
        })
        .addCase(fetchMatchDate.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchMatchDate.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // action.payload is the flattened list of { id, recordId, id_club, fecha, horario, estado, partidoId }
            state.matchDates = Array.isArray(action.payload) ? action.payload : [];
        })
        .addCase(fetchMatchDate.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error fetching match date';
        })
        // toggleMatchDateState
        .addCase(toggleMatchDateState.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(toggleMatchDateState.fulfilled, (state) => {
            state.loading = false;
            // We don't mutate matchDates here; caller should refetch via fetchMatchDate.
        })
        .addCase(toggleMatchDateState.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error?.message ?? 'Error toggling match state';
        })
        // fetchGuardadoMatches
        .addCase(fetchGuardadoMatches.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchGuardadoMatches.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.guardadoHistory = Array.isArray(action.payload) ? action.payload : [];
        })
        .addCase(fetchGuardadoMatches.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error?.message ?? 'Error fetching guardado history';
        })
        .addCase(editMatchDate.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(editMatchDate.fulfilled, (state) => {
            state.loading = false;
        })
        .addCase(editMatchDate.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error editing match date';
        })
        .addCase(editCupoSelectionTime.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(editCupoSelectionTime.fulfilled, (state) => {
            state.loading = false;
        })
        .addCase(editCupoSelectionTime.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error editing cupo selection time';
        })
        .addCase(updateMatchDates.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateMatchDates.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Update the specific record in matchDates array
            const updatedRecord = action.payload;
            if (updatedRecord && updatedRecord.id) {
                const index = state.matchDates.findIndex(md => md.id === updatedRecord.id);
                if (index !== -1) {
                    state.matchDates[index] = updatedRecord;
                }
            }
        })
        .addCase(updateMatchDates.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error updating match dates';
        })
        .addCase(updateMatchHours.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateMatchHours.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Update the specific record in matchDates array
            const updatedRecord = action.payload;
            if (updatedRecord && updatedRecord.id) {
                const index = state.matchDates.findIndex(md => md.id === updatedRecord.id);
                if (index !== -1) {
                    state.matchDates[index] = updatedRecord;
                }
            }
        })
        .addCase(updateMatchHours.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error updating match hours';
        })
        .addCase(updateClubHorario.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateClubHorario.fulfilled, (state) => {
            state.loading = false;
            // No need to update state directly, caller should refetch match dates
        })
        .addCase(updateClubHorario.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error updating club horario';
        })
        .addCase(updateTeamsPlayers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateTeamsPlayers.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Update the specific record in matchDates array
            const updatedRecord = action.payload;
            if (updatedRecord && updatedRecord.id) {
                const index = state.matchDates.findIndex(md => md.id === updatedRecord.id);
                if (index !== -1) {
                    state.matchDates[index] = updatedRecord;
                }
            }
        })
        .addCase(updateTeamsPlayers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error updating match hours';
        })
        .addCase(getTeamsPlayers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(getTeamsPlayers.fulfilled, (state, action: PayloadAction<any>) => {
            state.loading = false;
            // Update the specific record in matchDates array
            const updatedRecord = action.payload;
            if (updatedRecord && updatedRecord.id) {
                const index = state.matchDates.findIndex(md => md.id === updatedRecord.id);
                if (index !== -1) {
                    state.matchDates[index] = updatedRecord;
                }
            }
        })
        .addCase(getTeamsPlayers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error updating match hours';
        })
        .addCase(saveMatchResult.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(saveMatchResult.fulfilled, (state) => {
            state.loading = false;
            // Optionally, update the state with the saved match result
        })
        .addCase(saveMatchResult.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error saving match result';
        })
        // New cases for assignPlayerToChaleco and fetchChalecoPlayer
        .addCase(assignPlayerToChaleco.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(assignPlayerToChaleco.fulfilled, (state, action) => {
            state.loading = false;
            // Update chalecoPlayerName in state after successful assignment
            // The action.meta.arg contains the original arguments passed to the thunk
            state.chalecoPlayerName = action.meta.arg.playerName;
        })
        .addCase(assignPlayerToChaleco.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error assigning player to chaleco';
        })
        .addCase(fetchChalecoPlayer.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchChalecoPlayer.fulfilled, (state, action: PayloadAction<string | null>) => {
            state.loading = false;
            state.chalecoPlayerName = action.payload;
        })
        .addCase(fetchChalecoPlayer.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error fetching chaleco player';
        })
        // New cases for ubicacion
        .addCase(updatePartidoUbicacion.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updatePartidoUbicacion.fulfilled, (state, action) => {
            state.loading = false;
            state.ubicacion = action.meta.arg.ubicacion; // Update ubicacion from the thunk's argument
        })
        .addCase(updatePartidoUbicacion.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error updating ubicacion';
        })
        .addCase(fetchPartidoUbicacion.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchPartidoUbicacion.fulfilled, (state, action: PayloadAction<string | null>) => {
            state.loading = false;
            state.ubicacion = action.payload;
        })
        .addCase(fetchPartidoUbicacion.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error fetching ubicacion';
        })
        .addCase(fetchClubNameById.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.clubName = null;
        })
        .addCase(fetchClubNameById.fulfilled, (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.clubName = action.payload;
        })
        .addCase(fetchClubNameById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error fetching club name';
        })
        .addCase(fetchClub.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.backgroundClub = null;
            state.currentClub = null; // Clear currentClub on pending
        })
        .addCase(fetchClub.fulfilled, (state, action: PayloadAction<Club>) => {
            state.loading = false;
            state.currentClub = action.payload; // Store the full club object
            state.backgroundClub = action.payload.backgroud_team;
            state.clubName = action.payload.name; // Also update clubName
        })
        .addCase(fetchClub.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message ?? 'Error fetching club details';
            state.currentClub = null;
        })
        ;

    }
});

export const {setClubLoading, setClubs, setClubError} = clubsSlice.actions;

// --- Selectors ---

// Base selector for the clubs slice
const selectClubsState = (state: RootState) => state.clubs;

const selectAllClubPlayers = createSelector(
  [selectClubsState],
  (clubs) => clubs.players
);

export const backgroundClubTeam = createSelector(
    [selectClubsState],
    (clubs) => clubs.backgroundClub   
)

export const selectNominaPlayerIds = createSelector(
  [selectClubsState],
  (clubs) => clubs.nomina ?? []
);

export const selectMatchDates = createSelector(
  [selectClubsState],
  (clubs) => clubs.matchDates ?? []
);

export const selectAssignedPlayers = createSelector(
  [selectAllClubPlayers, selectNominaPlayerIds],
  (allClubPlayers, nominaPlayerIds) => {
    if (!Array.isArray(allClubPlayers) || !Array.isArray(nominaPlayerIds)) return [];

    const nominaSet = new Set(nominaPlayerIds.map(id => String(id).trim().toLowerCase()));

    return allClubPlayers
      .filter(player => nominaSet.has(String(player.id).trim().toLowerCase()))
      .map(player => ({
        id: player.id,
        name: player.fullname,
        posicion: player.posicion || 'N/A',
        isAssigned: true,
      }));
  }
);

export const selectIsCurrentUserAssigned = createSelector(
  [selectNominaPlayerIds, selectAuthUser],
  (nominaPlayerIds, user) => user ? nominaPlayerIds.includes(user.id.toString()) : false
);

export const selectTeamData = createSelector(
  [selectAssignedPlayers],
  (assignedPlayers) => ([
    { title: 'Nómina del partido', players: assignedPlayers },
  ])
);

export const selectChalecoPlayerName = createSelector(
    [selectClubsState],
    (clubs) => clubs.chalecoPlayerName
);

export const selectUbicacion = createSelector(
    [selectClubsState],
    (clubs) => clubs.ubicacion
);

export const selectClubName = createSelector(
    [selectClubsState],
    (clubs) => clubs.clubName
);

export const selectCurrentClub = createSelector(
    [selectClubsState],
    (clubs) => clubs.currentClub
);

export const selectCurrentClubLogoUrl = createSelector(
    [selectCurrentClub],
    (currentClub) => currentClub?.logo_url || null
);

export default clubsSlice.reducer;