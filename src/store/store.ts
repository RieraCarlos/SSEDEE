import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../store/slices/authSlice'
import clubsReducer from './slices/clubsSlice'
import userReducer from './slices/userSlice'
import tournamentsReducer from './slices/tournamentsSlice'
import liveMatchReducer from './slices/liveMatchSlice'
import administrationReducer from './slices/administrationSlice'
import calendarReducer from './slices/calendarSlice'
import { persistenceMiddleware } from './middleware/persistence'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    clubs: clubsReducer,
    user: userReducer,
    tournaments: tournamentsReducer,
    liveMatch: liveMatchReducer,
    administration: administrationReducer,
    calendar: calendarReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(persistenceMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
