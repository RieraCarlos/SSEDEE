import { createAsyncThunk } from "@reduxjs/toolkit";
import { supabase } from "@/api/supabaseClient";
import type { UserProfile } from "@/api/type/user-profile.api";

// Thunk to fetch the user profile
export const fetchUserProfile = createAsyncThunk<UserProfile, string>(
  "user/fetchProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // PostgREST error for no rows found
          throw new Error("User profile not found.");
        }
        throw error;
      }
      
      return data as UserProfile;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Thunk to create a new user profile
export const createUserProfile = createAsyncThunk<
  UserProfile,
  {
    id: string; // The Supabase auth user ID
    id_club: string;
    email: string;
    fullname: string;
    role: string;
    posicion: string;
    alias: string;
    altura: number;
    fecha_nacimiento: string;
    avatar: string;
  }
>(
  "user/createUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .insert([profileData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data as UserProfile;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);


// Thunk to update the user profile
export const updateUserProfile = createAsyncThunk<UserProfile, { userId: string; updates: Partial<UserProfile> }>(
  "user/updateProfile",
  async ({ userId, updates }, { rejectWithValue }) => {
    try {
      // Use the updates object directly to ensure id_club is included in the update
      const updatePayload = updates;
      const { data, error } = await supabase
        .from("usuarios")
        .update(updatePayload)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Supabase update error:", error); // Added detailed logging
        throw error;
      }

      return data as UserProfile;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

