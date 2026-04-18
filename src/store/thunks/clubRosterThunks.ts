import { createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '@/api/supabaseClient';
import type { ClubPlayer, AvailableUser } from '@/store/slices/clubRosterSlice';
import type { NominaRowCsvSchema } from '@/services/csv.services';
import { z } from 'zod';

/**
 * Obtiene los jugadores de un club desde la tabla de nómina
 */
export const fetchClubPlayers = createAsyncThunk<
  ClubPlayer[],
  { clubId: string; tournamentId?: string },
  { rejectValue: string }
>(
  'clubRoster/fetchClubPlayers',
  async ({ clubId }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('nominas')
        .select(
          'id, id_club, fullname, email, role, posicion, alias, altura, fecha_nacimiento, avatar, created_at, updated_at'
        )
        .eq('id_club', clubId);

      if (error) throw error;

      return (data as any) || [];
    } catch (err: any) {
      return rejectWithValue(
        err.message || 'Error al obtener jugadores del club'
      );
    }
  }
);

/**
 * Obtiene usuarios disponibles sin asignar al club
 */
export const fetchAvailableUsers = createAsyncThunk<
  AvailableUser[],
  { clubId: string; tournamentId?: string },
  { rejectValue: string }
>(
  'clubRoster/fetchAvailableUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('nominas')
        .select(
          'id, id_club, fullname, email, role, posicion, alias, altura, fecha_nacimiento, avatar, created_at, updated_at'
        )
        .is('id_club', null)
        .order('fullname', { ascending: true });

      if (error) throw error;

      return (data as any) || [];
    } catch (err: any) {
      return rejectWithValue(
        err.message || 'Error al obtener usuarios disponibles'
      );
    }
  }
);

/**
 * Actualiza la nómina del club usando la tabla de nómina
 */
export const updateClubNomina = createAsyncThunk<
  ClubPlayer[],
  { clubId: string; tournamentId?: string; playerIds: string[] },
  { rejectValue: string }
>(
  'clubRoster/updateClubNomina',
  async ({ clubId, playerIds }, { rejectWithValue }) => {
    try {
      const { data: currentPlayers, error: fetchError } = await supabase
        .from('nominas')
        .select('id')
        .eq('id_club', clubId);

      if (fetchError) throw fetchError;

      const currentPlayerIds = new Set(
        (currentPlayers as any[])?.map((p) => p.id) || []
      );

      const playersToRemove = (currentPlayers as any[])?.filter(
        (p) => !playerIds.includes(p.id)
      ) || [];

      if (playersToRemove.length > 0) {
        const idsToRemove = playersToRemove.map((p) => p.id);
        const { error: unassignError } = await supabase
          .from('nominas')
          .update({ id_club: null })
          .in('id', idsToRemove);

        if (unassignError) throw unassignError;
      }

      const playersToAdd = playerIds.filter((id) => !currentPlayerIds.has(id));
      if (playersToAdd.length > 0) {
        const { error: assignError } = await supabase
          .from('nominas')
          .update({ id_club: clubId })
          .in('id', playersToAdd);

        if (assignError) throw assignError;
      }

      const { data: updatedPlayers, error: finalError } = await supabase
        .from('nominas')
        .select(
          'id, id_club, fullname, email, role, posicion, alias, altura, fecha_nacimiento, avatar, created_at, updated_at'
        )
        .eq('id_club', clubId);

      if (finalError) throw finalError;

      return (updatedPlayers as any) || [];
    } catch (err: any) {
      return rejectWithValue(
        err.message || 'Error al actualizar la nómina del club'
      );
    }
  }
);

/**
 * Actualiza la nómina de un club a partir de una lista CSV validada
 * Borra a los viejos, inserta/actualiza a los nuevos, arroja error si alguien pertenece a otro equipo.
 */
export const uploadCsvNomina = createAsyncThunk<
  ClubPlayer[],
  { clubId: string; playersData: z.infer<typeof NominaRowCsvSchema>[] },
  { rejectValue: string }
>(
  'clubRoster/uploadCsvNomina',
  async ({ clubId, playersData }, { rejectWithValue }) => {
    try {
      const emails = playersData.map((p) => p.email);

      // Verificamos si los correos existen en DB
      const { data: existingPlayers, error: checkError } = await supabase
        .from('nominas')
        .select('id, email, id_club')
        .in('email', emails);

      if (checkError) throw checkError;

      // Un jugador está en conflicto si ya pertenece a otro club distinto al nuestro
      const conflictingPlayers = (existingPlayers || []).filter(
        (p) => p.id_club !== null && p.id_club !== clubId
      );

      if (conflictingPlayers.length > 0) {
        return rejectWithValue(
          `Error: ${conflictingPlayers.length} jugador(es) (Ej. ${conflictingPlayers[0].email}) ya pertenecen a otro club.`
        );
      }

      // Vaciamos la asignación de este club (borra los anteriores de este club)
      const { error: unassignError } = await supabase
        .from('nominas')
        .update({ id_club: null })
        .eq('id_club', clubId);

      if (unassignError) throw unassignError;

      // Preparamos los datos para ser insertados o actualizados
      const existingEmailsMap = new Map((existingPlayers || []).map(p => [p.email, p.id]));
      
      const toUpsert = playersData.map((p) => {
         const existingId = existingEmailsMap.get(p.email);
         const playerData = {
           id_club: clubId,
           fullname: p.fullname,
           email: p.email,
           role: 'jugador',
           posicion: p.posicion || null,
           alias: p.alias || null,
           altura: p.altura ? parseFloat(p.altura) : null,
           fecha_nacimiento: p.fecha_nacimiento || null
         };
         return existingId ? { id: existingId, ...playerData } : playerData;
      });

      // Upsert: Si mandamos 'id' actualiza esa fila, si no mandamos, la crea nueva.
      const { data: upsertedPlayers, error: upsertError } = await supabase
        .from('nominas')
        .upsert(toUpsert)
        .select(
          'id, id_club, fullname, email, role, posicion, alias, altura, fecha_nacimiento, avatar, created_at, updated_at'
        );

      if (upsertError) throw upsertError;

      return (upsertedPlayers as any[]) || [];
    } catch (err: any) {
      return rejectWithValue(err.message || 'Error procesando el CSV contra Base de Datos');
    }
  }
);

