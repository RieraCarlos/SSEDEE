import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store/store';
import { generateCalendar, type CalendarAlgorithmResult, type CalendarGenerationConfig, type CalendarMatch } from '@/core/calendars/CalendarEngine';

interface CalendarState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  matches: CalendarMatch[];
  rounds: CalendarAlgorithmResult['rounds'];
  byeMapping: CalendarAlgorithmResult['byeMapping'];
}

const initialState: CalendarState = {
  status: 'idle',
  error: null,
  matches: [],
  rounds: [],
  byeMapping: {},
};

export const generateCalendarThunk = createAsyncThunk<
  CalendarAlgorithmResult,
  CalendarGenerationConfig,
  { rejectValue: string }
>('calendar/generate', async (config, { rejectWithValue }) => {
  try {
    return generateCalendar(config);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Error en la generación del calendario');
  }
});

const calendarSlice = createSlice({
  name: 'calendar',
  initialState,
  reducers: {
    setCalendarMatches(state, action: PayloadAction<CalendarMatch[]>) {
      state.matches = action.payload;
      state.status = 'succeeded';
      state.error = null;
    },
    resetCalendar(state) {
      state.status = 'idle';
      state.error = null;
      state.matches = [];
      state.rounds = [];
      state.byeMapping = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateCalendarThunk.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(generateCalendarThunk.fulfilled, (state, action: PayloadAction<CalendarAlgorithmResult>) => {
        state.status = 'succeeded';
        state.matches = action.payload.matches;
        state.rounds = action.payload.rounds;
        state.byeMapping = action.payload.byeMapping;
        state.error = null;
      })
      .addCase(generateCalendarThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Error al generar el calendario';
      });
  },
});

export const { setCalendarMatches, resetCalendar } = calendarSlice.actions;

export const selectCalendarState = (state: RootState) => state.calendar;
export const selectCalendarMatches = (state: RootState) => state.calendar.matches;
export const selectCalendarStatus = (state: RootState) => state.calendar.status;
export const selectCalendarError = (state: RootState) => state.calendar.error;
export const selectCalendarRounds = (state: RootState) => state.calendar.rounds;
export const selectCalendarByeMapping = (state: RootState) => state.calendar.byeMapping;

export default calendarSlice.reducer;
