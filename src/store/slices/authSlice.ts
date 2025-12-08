// src/store/slices/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser } from '@/api/type/auth.api'
import type { RootState } from '@/store/store'

interface AuthState {
  user: AuthUser | null
  loading: boolean
  error?: string | null
}

const initialState: AuthState = {
  user: null,
  // Start as "loading" while initAuth runs on app mount so
  // ProtectedRoute doesn't redirect before we hydrate the session.
  loading: true,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload
    },
    setAuthUser(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload
      state.error = null
    },
    setAuthError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    clearAuth(state) {
      state.user = null
      state.loading = false
      state.error = null
    },
  },
})
export const selectAuthUser = (state: RootState) => state.auth.user
export const { setAuthLoading, setAuthUser, setAuthError, clearAuth } = authSlice.actions
export default authSlice.reducer
