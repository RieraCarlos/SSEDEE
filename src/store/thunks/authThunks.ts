// src/store/thunks/authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '@/api/supabaseClient'
import { AuthService } from '@/services/auth.services'
import { setAuthLoading, setAuthUser, setAuthError, clearAuth } from '../slices/authSlice'
import type { AppDispatch } from '@/store/store'
import type { AuthUser, SignUpData } from '@/api/type/auth.api'

// Helper function to validate and transform profile to AuthUser
const validateAndCreateAuthUser = (profile: any): AuthUser | null => {
  if (profile && profile.id && profile.email && profile.fullname && profile.role) {
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role,
      id_club: profile.id_club || null,
      fullname: profile.fullname,
    };
  }
  return null;
};


// 1) Inicializar sesión (al cargar la app) — mapear usuario en tabla `users`
export const initAuth = () => async (dispatch: AppDispatch) => {
  dispatch(setAuthLoading(true));
  try {
    const sessionRes = await AuthService.getSession();
    const userId = sessionRes?.user?.id
    if (userId) {
      const { data: profile } = await AuthService.getProfile(userId);
      const authUser = validateAndCreateAuthUser(profile);
      if (authUser) {
        dispatch(setAuthUser(authUser))
      } else {
        // Profile is incomplete or missing, treat as logged out
        dispatch(clearAuth())
      }
    } else {
      dispatch(clearAuth())
    }
  } catch (err: any) {
    dispatch(setAuthError(err?.message ?? 'Error inicializando auth'))
  } finally {
    dispatch(setAuthLoading(false))
  }

  // Subscribir cambios de auth (login/logout) y actualizar store
  supabase.auth.onAuthStateChange(async (_event, session) => {
    if (session?.user) {
      const userId = session.user.id
      const { data: profile } = await AuthService.getProfile(userId)
      const authUser = validateAndCreateAuthUser(profile);
      if (authUser) {
        dispatch(setAuthUser(authUser))
      } else {
        dispatch(clearAuth())
      }
    } else {
      dispatch(clearAuth())
    }
  })
}

// 2) Login
export const signIn = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string; password: string }, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setAuthLoading(true))
      const { error, data } = await AuthService.signIn(email, password)
      if (error) throw error
      const userId = data?.session?.user?.id
      if (!userId) throw new Error('No se obtuvo id de usuario')

      const { data: profile } = await AuthService.getProfile(userId)
      const authUser = validateAndCreateAuthUser(profile);

      if (!authUser) {
        // This case can happen if the DB trigger failed for an old user.
        // We log them out to prevent an inconsistent state.
        await AuthService.signOut();
        dispatch(clearAuth());
        throw new Error('Tu perfil de usuario está incompleto o dañado. Por favor, contacta a soporte.');
      }
      
      dispatch(setAuthUser(authUser))
      
      return authUser
    } catch (err: any) {
      dispatch(setAuthError(err?.message ?? 'Error en inicio de sesión'))
      return rejectWithValue(err?.message ?? 'Error en inicio de sesión')
    } finally {
      dispatch(setAuthLoading(false))
    }
  }
)

// 3) Register (registro simple — puedes crear entry en `users` con trigger en DB)
export const signUp = createAsyncThunk(
  "auth/signUp",
  async (
    {
      email,
      password,
      role,
      id_club,
      fullname,
      posicion,
      alias,
      altura,
      fecha_nacimiento,
      lugar,
      avatar,
    }: SignUpData,
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setAuthLoading(true));

      // 1. Prepara los datos del perfil que se pasarán a Supabase.
      const profileData = {
        role,
        id_club: id_club || null,
        fullname: fullname || null,
        posicion: posicion || null,
        alias: alias || null,
        altura: altura || null,
        fecha_nacimiento: fecha_nacimiento || null,
        lugar: lugar || null,
        avatar: avatar || null,
        email: email,
      };

      // 2. Llama a signUp pasando los datos del perfil en las opciones.
      const { error, data } = await AuthService.signUp(email, password, profileData);
      
      if (error) {
        throw error;
      }

      const userId = data?.user?.id;
      if (!userId) {
        throw new Error('No se obtuvo id de usuario después del registro.');
      }

      // 3. Después del registro, el trigger en la DB ya debió crear el perfil.
      const { data: userProfile, error: profileError } = await AuthService.getProfile(userId);

      if (profileError) {
        console.error("Error fetching profile after sign up, check DB trigger:", profileError);
        throw profileError;
      }

      const authUser = validateAndCreateAuthUser(userProfile);
      if (!authUser) {
        throw new Error("No se pudo validar el perfil de usuario después del registro. Asegúrate de que el trigger 'handle_new_user' esté funcionando y guardando el email.");
      }
      
      dispatch(setAuthUser(authUser));

      return data;
    } catch (err: any) {
      console.error("signUp thunk caught an error:", err);
      dispatch(setAuthError(err?.message ?? 'Error en registro'));
      return rejectWithValue(err?.message ?? 'Error en registro');
    } finally {
      dispatch(setAuthLoading(false));
    }
  }
);

// 4) Logout
export const signOut = createAsyncThunk('auth/signOut', async (_, { dispatch }) => {
  await AuthService.signOut()
  dispatch(clearAuth())
})
