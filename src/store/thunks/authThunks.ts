// src/store/thunks/authThunks.ts
import { createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '@/api/supabaseClient'
import { AuthService } from '@/services/auth.services'
import { setAuthLoading, setAuthUser, setAuthError, clearAuth } from '../slices/authSlice'
import type { AppDispatch } from '@/store/store'
import type { AuthUser, SignUpData } from '@/api/type/auth.api'

// 1) Inicializar sesión (al cargar la app) — mapear usuario en tabla `users`
export const initAuth = () => async (dispatch: AppDispatch) => {
  dispatch(setAuthLoading(true));
  try {
    const sessionRes = await AuthService.getSession();
    const userId = sessionRes?.user?.id
    if (userId) {
      const { data: profile } = await AuthService.getProfile(userId);
      if (profile) {
        dispatch(setAuthUser(profile as AuthUser))
        // NO redirigir aquí — dejar que el usuario navegue libremente
      } else {
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
      if (profile) {
        dispatch(setAuthUser(profile as AuthUser))
        // NO redirigir aquí — solo actualizar el estado
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
      const userEmail = data?.session?.user?.email
      const userRole = data?.session?.user?.role
      if (!userId) throw new Error('No se obtuvo id de usuario')
      const { data: profile } = await AuthService.getProfile(userId)
      // If profile doesn't exist in usuarios table, use auth user data as fallback
      const userProfile = profile || { id: userId, email: userEmail, role: userRole, id_club: null }
      dispatch(setAuthUser(userProfile as AuthUser))
      
      return userProfile
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
      //    Estos datos se almacenarán en `raw_user_meta_data` y un trigger los usará.
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
        // Incluimos el email aquí para que el trigger pueda insertarlo en `usuarios`.
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
      //    Ahora obtenemos ese perfil para guardarlo en el estado de Redux.
      const { data: userProfile, error: profileError } = await AuthService.getProfile(userId);

      if (profileError) {
        // Si hay un error aquí, puede que el trigger no exista o haya fallado.
        console.error("Error fetching profile after sign up, check DB trigger:", profileError);
        throw profileError;
      }

      if (!userProfile) {
        throw new Error("No se encontró el perfil de usuario después del registro. Asegúrate de que el trigger 'handle_new_user' esté funcionando correctamente en tu base de datos.");
      }
      
      dispatch(setAuthUser(userProfile as AuthUser));

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
