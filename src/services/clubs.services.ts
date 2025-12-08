import { supabase } from '../api/supabaseClient';
import type { Club } from '../api/type/clubs.api';
import type { UserProfile } from '../api/type/user.api';

export interface ClubWithPlayers extends Club {
  players: UserProfile[];
}

export const getAllClubsWithPlayers = async (): Promise<ClubWithPlayers[]> => {
  try {
    const { data: clubsData, error: clubsError } = await supabase
      .from('clubes')
      .select('*');

    if (clubsError) {
      console.error('Error fetching clubs:', clubsError);
      return [];
    }

    if (!clubsData) {
      return [];
    }

    const clubsWithPlayers: ClubWithPlayers[] = [];

    for (const club of clubsData) {
      const { data: playersData, error: playersError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id_club', club.id);

      if (playersError) {
        console.error(`Error fetching players for club ${club.name}:`, playersError);
        // Continue without players for this club or handle as needed
      }

      clubsWithPlayers.push({
        ...club,
        players: playersData || [],
      });
    }

    return clubsWithPlayers;
  } catch (error) {
    console.error('Unexpected error in getAllClubsWithPlayers:', error);
    return [];
  }
};

export const getClubById = async (id: string): Promise<Club | null> => {
  try {
    const { data, error } = await supabase
      .from('clubes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching club by ID:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Unexpected error in getClubById:', error);
    return null;
  }
};
