import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../store/slices/authSlice'
import clubsReducer from './slices/clubsSlice'
import userReducer from './slices/userSlice'
import tournamentsReducer from './slices/tournamentsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clubs: clubsReducer,
    user: userReducer,
    tournaments: tournamentsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
