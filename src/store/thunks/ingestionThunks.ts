import { createAsyncThunk } from '@reduxjs/toolkit';
import { ClubsService } from '@/services/clubs.services';
import { TournamentsService } from '@/services/tournaments.services';
import { setIngestionStep, startIngestion, finishIngestion } from '../slices/clubsSlice';
import { fetchClubs } from './clubsThunks';
import { fetchTournaments } from './tournamentsThunks';
import { toast } from 'sonner';

/**
 * Thunk orquestador para Ingesta Masiva con Atomicidad y Feedback en Tiempo Real
 */
export const ingestMassiveData = createAsyncThunk(
  'clubs/ingestMassiveData',
  async (
    { tournamentId, data : payload }: { tournamentId: string; data: any },
    { dispatch }
  ) => {
    dispatch(startIngestion());
    let clubId: string | null = null;

    try {
      // 1. CREAR CLUB
      dispatch(setIngestionStep('1/3: Creando Club...'));
      const clubPayload = {
        name: payload.p_club_name,
        logo_url: payload.p_club_logo,
        backgroud_team: payload.p_backgroud_team,
        color: payload.p_color
      };
      
      const { data: createdClub, error: clubError } = await ClubsService.createClub(clubPayload);
      if (clubError || !createdClub) throw new Error(`Error creando club: ${clubError?.message}`);
      
      clubId = createdClub.id;

      // 2. VINCULAR TORNEO
      dispatch(setIngestionStep('2/3: Vinculando al Torneo...'));
      const { error: linkError } = await TournamentsService.appendTeam(tournamentId, clubId);
      if (linkError) throw new Error(`Error vinculando al torneo: ${linkError.message}`);

      // 3. REGISTRAR NÓMINA (Sin Auth - Inserción Masiva)
      dispatch(setIngestionStep('3/3: Registrando Nómina...'));
      const { error: nominaError } = await ClubsService.registerNominas(
        clubId, 
        payload.p_dt_data, 
        payload.p_players_data
      );

      if (nominaError) throw new Error(`Error registrando nómina: ${nominaError.message}`);

      // FINALIZACIÓN - Revalidación de datos para reactividad instantánea
      await Promise.all([
        dispatch(fetchClubs()),
        dispatch(fetchTournaments())
      ]);
      
      toast.success('¡Ingesta de nómina completada con éxito!');

      return { success: true, clubId };

    } catch (error: any) {
      console.error('Error en Ingesta de Nómina:', error);
      toast.error(error.message || 'Error crítico en la ingesta');
      throw error;
    } finally {
      dispatch(finishIngestion());
    }
  }
);
