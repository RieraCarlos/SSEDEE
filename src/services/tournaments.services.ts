import { BaseApiService } from '../api/api-client';
import type { ApiResponse } from '../api/api-client';
import type { Tournament } from '../api/type/tournaments.api';

/**
 * Servicio para gestión de Torneos
 */
class TournamentsApiService extends BaseApiService {
  /**
   * Obtiene todos los torneos registrados
   */
  async getTournaments(signal?: AbortSignal): Promise<ApiResponse<Tournament[]>> {
    return this.execute(
      this.supabase.from('torneos').select('*').abortSignal(signal || new AbortController().signal)
    );
  }

  /**
   * Crea un nuevo torneo
   */
  async createTournament(tournamentData: {
    name: string;
    n_equipos: number;
    fecha: string[];
    id_user: string;
    tipo: string;
  }): Promise<ApiResponse<Tournament>> {
    return this.execute(
      this.supabase
        .from('torneos')
        .insert([
          {
            ...tournamentData,
            equipos: [] 
          },
        ])
        .select()
        .single()
    );
  }

  /**
   * Actualiza la lista de equipos participantes en un torneo
   */
  async updateTournamentTeams(tournamentId: string, teams: string[]): Promise<ApiResponse<Tournament>> {
    return this.execute(
      this.supabase
        .from('torneos')
        .update({ equipos: teams })
        .eq('id', tournamentId)
        .select()
        .single()
    );
  }

  /**
   * Añade un único equipo al array del torneo (Atomic Append vía RPC)
   */
  async appendTeam(tournamentId: string, clubId: string): Promise<ApiResponse<any>> {
    return this.execute(
      this.supabase.rpc('append_team_to_tournament', {
        p_tournament_id: tournamentId,
        p_club_id: clubId
      })
    );
  }
}

export const TournamentsService = new TournamentsApiService();
