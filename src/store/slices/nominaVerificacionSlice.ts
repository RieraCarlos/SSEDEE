import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '@/api/supabaseClient';

export type PlayerStatus = 'presente' | 'atrasado' | 'inasistencia' | 'unassigned';

interface ValidationPayload {
  partidoId: string;
  presentes: string[];
  atrasados: string[];
  faltantes: string[];
}

interface NominaVerificacionState {
  status: 'pending' | 'completed';
  selections: Record<string, PlayerStatus>; // key: playerId, value: status
  isLoading: boolean;
  error: string | null;
  readOnly: boolean;
}

const initialState: NominaVerificacionState = {
  status: 'pending',
  selections: {},
  isLoading: false,
  error: null,
  readOnly: false,
};

// Thunk to push the data directly into Supabase and unlock the pre-game UI
export const saveNominaVerificacionThunk = createAsyncThunk(
  'nominaVerificacion/save',
  async (payload: ValidationPayload, { rejectWithValue }) => {
    try {
      const dbPayload = {
        partido_id: payload.partidoId,
        presentes: payload.presentes,
        atrasados: payload.atrasados,
        faltantes: payload.faltantes
      };

      console.log('Starting raw upsert for match:', payload.partidoId);
      console.log('Payload counts:', {
        presentes: payload.presentes.length,
        atrasados: payload.atrasados.length,
        faltantes: payload.faltantes.length
      });

      // Operación mínima sin select posterior para evitar bloqueos por RLS
      const { error } = await supabase
        .from('nomina_verificacion')
        .upsert(dbPayload, { onConflict: 'partido_id' });

      if (error) {
        console.error('Supabase Upsert Error:', error);
        throw error;
      }
      
      console.log('Save Confirmed by Supabase');
      return dbPayload;
    } catch (err: any) {
      console.error('Thunk Catch Error:', err);
      return rejectWithValue(err.message || 'Error guardando verificación de nómina');
    }
  }
);

// Optional: thunk to check if the match already has a completed status from earlier
export const checkNominaVerificacionThunk = createAsyncThunk(
  'nominaVerificacion/check',
  async (partidoId: string, { rejectWithValue }) => {
    try {
      console.log('Checking Nomina Status for:', partidoId);
      const { data, error } = await supabase
        .from('nomina_verificacion')
        .select('*')
        .eq('partido_id', partidoId)
        .maybeSingle();

      if (error) throw error;
      return data; // null if not found
    } catch (err: any) {
      console.error('Thunk Check Error:', err);
      return rejectWithValue(err.message);
    }
  }
);

const nominaVerificacionSlice = createSlice({
  name: 'nominaVerificacion',
  initialState,
  reducers: {
    setPlayerSelection: (state, action: PayloadAction<{ playerId: string; status: PlayerStatus }>) => {
      state.selections[action.payload.playerId] = action.payload.status;
    },
    setAllSelections: (state, action: PayloadAction<Record<string, PlayerStatus>>) => {
      state.selections = action.payload;
    },
    resetVerificacionState: (state) => {
      state.status = 'pending';
      state.selections = {};
      state.isLoading = false;
      state.error = null;
      state.readOnly = false;
    },
    unlockEditMode: (state) => {
      state.readOnly = false;
    }
  },
  extraReducers: (builder) => {
    // Save operation
    builder
      .addCase(saveNominaVerificacionThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveNominaVerificacionThunk.fulfilled, (state) => {
        state.isLoading = false;
        state.status = 'completed';
        state.readOnly = true; // Locks the UI by default
      })
      .addCase(saveNominaVerificacionThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Check operation
    builder
      .addCase(checkNominaVerificacionThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkNominaVerificacionThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.status = 'completed';
          state.readOnly = true;
          // Reconstruct selections from arrays
          const { presentes, atrasados, faltantes } = action.payload as any;
          presentes.forEach((id: string) => state.selections[id] = 'presente');
          atrasados.forEach((id: string) => state.selections[id] = 'atrasado');
          faltantes.forEach((id: string) => state.selections[id] = 'inasistencia');
        }
      })
      .addCase(checkNominaVerificacionThunk.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export const { setPlayerSelection, setAllSelections, resetVerificacionState, unlockEditMode } = nominaVerificacionSlice.actions;
export const selectNominaVerificacion = (state: any) => state.nominaVerificacion;
export default nominaVerificacionSlice.reducer;
