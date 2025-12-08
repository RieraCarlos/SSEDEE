// src/services/tournaments.services.ts
import { supabase } from '@/api/supabaseClient';
import type { Tournament } from '@/api/type/tournaments.api';

export const TournamentsService = {
  async getTournaments(): Promise<Tournament[] | null> {
    const { data, error } = await supabase
      .from('toneos') // Using the exact table name from the error message
      .select('id, name');

    if (error) {
      console.error('Error fetching tournaments:', error);
      throw error;
    }

    return data;
  },
};
