import { BaseApiService } from '../api/api-client';
import type { ApiResponse } from '../api/api-client';
import type { Club } from '../api/type/clubs.api';

export interface ClubWithPlayers extends Club {
  players: any[];
  dt_name?: string;
  player_count?: number;
}

export interface TeamIngestPayload {
  p_tournament_id?: string;
  p_club_name: string;
  p_club_logo: string;
  p_backgroud_team: string;
  p_color: string;
  p_dt_data: {
    fullname: string;
    email: string;
    avatar?: string;
    fecha_nacimiento?: string;
  };
  p_players_data: Array<{
    fullname: string;
    email: string;
    posicion?: string;
    alias?: string;
    altura?: string;
    fecha_nacimiento?: string;
    avatar?: string;
  }>;
}

/**
 * Servicio para gestión de Clubes y Jugadores
 */
class ClubsApiService extends BaseApiService {
  /**
   * Obtiene todos los clubes con datos administrativos (Optimizado)
   * Resuelve DT (primero) y conteo de jugadores en un solo query.
   */
  async getClubsAdminData(signal?: AbortSignal): Promise<ApiResponse<ClubWithPlayers[]>> {
    // Query optimizada: Trae clubes, el primer nombre de rol 'dt' y el conteo de rol 'jugador'
    const { data: clubs, error } = await this.execute(
      this.supabase
        .from('clubes')
        .select(`
          *,
          nominas!id_club (
            fullname,
            role
          )
        `)
        .abortSignal(signal || new AbortController().signal)
    );

    if (error || !clubs) return { data: [], error };

    // Post-procesamiento ligero para aplanar la estructura del JOIN
    const processedClubs = clubs.map((club: any) => {
      const nominas = club.nominas || [];
      return {
        ...club,
        dt_name: nominas.find((n: any) => n.role === 'dt')?.fullname || 'Sin DT',
        player_count: nominas.filter((n: any) => n.role === 'jugador').length,
      };
    });

    return { data: processedClubs, error: null };
  }

  /**
   * Gestiona la subida de logos a Supabase Storage con limpieza de basura
   */
  async uploadClubLogo(clubId: string, file: File, oldPath?: string): Promise<ApiResponse<string>> {
    const bucket = 'logo_Clubs';
    const fileExt = file.name.split('.').pop();
    const fileName = `logos/${clubId}_${Date.now()}.${fileExt}`;

    try {
      // 1. Limpieza: Eliminar logo anterior si existe en el Storage
      if (oldPath && oldPath.includes(bucket)) {
        // Extraemos el path relativo después del nombre del bucket
        const parts = oldPath.split(`${bucket}/`);
        const oldFileName = parts.length > 1 ? parts[1] : null;
        if (oldFileName) {
          await this.supabase.storage.from(bucket).remove([oldFileName]);
        }
      }

      // 2. Subida: Nuevo logo
      const { error: uploadError } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // 3. Obtener URL Pública
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      // 4. Actualizar Tabla Clubes
      const { error: updateError } = await this.supabase
        .from('clubes')
        .update({ logo_url: publicUrl })
        .eq('id', clubId);

      if (updateError) throw updateError;

      return { data: publicUrl, error: null };
    } catch (error: any) {
      return { data: '', error };
    }
  }

  /**
   * Obtiene todos los clubes con su nómina hidratada (Legacy - Deprecado por getClubsAdminData)
   */
  async getAllClubsWithPlayers(signal?: AbortSignal): Promise<ApiResponse<ClubWithPlayers[]>> {
    return this.getClubsAdminData(signal);
  }

  /**
   * Obtiene un club por nombre
   */
  async getClubByName(name: string): Promise<ApiResponse<Club>> {
    return this.execute(
      this.supabase.from('clubes').select('*').eq('name', name).maybeSingle()
    );
  }

  /**
   * Obtiene un club por ID
   */
  async getClubById(id: string): Promise<ApiResponse<Club>> {
    return this.execute(
      this.supabase.from('clubes').select('*').eq('id', id).single()
    );
  }

  /**
   * Crea un club individual
   */
  async createClub(payload: { name: string; logo_url: string; backgroud_team: string; color: string }): Promise<ApiResponse<Club>> {
    return this.execute(
      this.supabase
        .from('clubes')
        .upsert([payload], { onConflict: 'name' })
        .select()
        .single()
    );
  }

  /**
   * Registra un miembro individual (DT o Jugador) usando el micro-RPC
   */
  async registerSingleMember(payload: {
    p_id_club: string;
    p_full_name: string;
    p_email: string;
    p_role: string;
    p_posicion?: string;
    p_alias?: string;
    p_altura?: number;
    p_fecha_nacimiento?: string;
    p_avatar?: string;
  }): Promise<ApiResponse<any>> {
    const { data, error } = await this.execute(
      this.supabase.rpc('register_single_member_with_auth', payload)
    );

    if (error) return { data: null, error };
    if (data?.status === 'error') return { data: null, error: new Error(data.message) };

    return { data, error: null };
  }

  /**
   * Registra masivamente los miembros en la tabla de NÓMINA (Sin Auth)
   */
  async registerNominas(clubId: string, dt: any, players: any[]): Promise<ApiResponse<any>> {
    const batch = [
      {
        id_club: clubId,
        fullname: dt.fullname,
        email: dt.email?.toLowerCase().trim() || null,
        role: 'dt',
        fecha_nacimiento: dt.fecha_nacimiento || null,
        avatar: dt.avatar || null
      },
      ...players.map(p => ({
        id_club: clubId,
        fullname: p.fullname,
        email: p.email?.toLowerCase().trim() || null,
        role: 'jugador',
        posicion: p.posicion || null,
        alias: p.alias || null,
        altura: p.altura && !isNaN(parseFloat(p.altura)) ? parseFloat(p.altura) : null,
        fecha_nacimiento: p.fecha_nacimiento || null,
        avatar: p.avatar || null
      }))
    ];

    return this.execute(
      this.supabase.from('nominas').insert(batch)
    );
  }

  /**
   * Obtiene la nómina de un club específico
   */
  async getNominaByClubId(clubId: string): Promise<ApiResponse<any[]>> {
    return this.execute(
      this.supabase.from('nominas').select('*').eq('id_club', clubId)
    );
  }

  /**
   * Elimina un club (para Rollback manual)
   */
  async deleteClub(clubId: string): Promise<ApiResponse<any>> {
    return this.execute(
      this.supabase.from('clubes').delete().eq('id', clubId)
    );
  }

  /**
   * Ejecuta la Ingesta Masiva Atómica vía RPC (Postgres Function)
   * ¡Recomendado! Maneja Club, Torneo, Auth y Miembros en una sola transacción.
   */
  async massiveIngest(payload: TeamIngestPayload): Promise<ApiResponse<any>> {
    const { data, error } = await this.execute(
      this.supabase.rpc('ingest_team_data', payload)
    );

    if (error) return { data: null, error };
    if (data?.status === 'error') return { data: null, error: new Error(data.message) };

    return { data, error: null };
  }
}

export const ClubsService = new ClubsApiService();

// Named exports for backward compatibility (Wrappers)
export const getAllClubsWithPlayers = (signal?: AbortSignal) => ClubsService.getAllClubsWithPlayers(signal);
export const getClubById = (id: string) => ClubsService.getClubById(id);
export const massiveIngest = (payload: TeamIngestPayload) => ClubsService.massiveIngest(payload);
