import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { DeportesService } from '@/services/deportes.services';
import { CategoriasService } from '@/services/categorias.services';
import type { Deporte } from '@/api/type/deporte.api';
import type { Categoria } from '@/api/type/categoria.api';
import type { RootState } from '@/store/store';

import { getCachedAdministration } from '../middleware/persistence';

interface AdministrationState {
  deportes: Deporte[];
  categorias: Categoria[];
  loading: boolean;
  error: string | null;
}

const cachedData = getCachedAdministration();

const initialState: AdministrationState = {
  deportes: cachedData?.deportes || [],
  categorias: cachedData?.categorias || [],
  loading: false,
  error: null,
};

export const fetchDeportes = createAsyncThunk(
  'administration/fetchDeportes',
  async (_, { rejectWithValue }) => {
    const { data, error } = await DeportesService.getDeportes();
    if (error) return rejectWithValue(error.message);
    return data || [];
  }
);

export const fetchCategorias = createAsyncThunk(
  'administration/fetchCategorias',
  async (deporteId: string, { rejectWithValue }) => {
    const { data, error } = await CategoriasService.getCategoriasByDeporte(deporteId);
    if (error) return rejectWithValue(error.message);
    return data || [];
  }
);

export const fetchAllCategorias = createAsyncThunk(
  'administration/fetchAllCategorias',
  async (_, { rejectWithValue }) => {
    const { data, error } = await CategoriasService.getAllCategorias();
    if (error) return rejectWithValue(error.message);
    return data || [];
  }
);

export const createDeporte = createAsyncThunk(
  'administration/createDeporte',
  async (nombre: string, { rejectWithValue }) => {
    const { data, error } = await DeportesService.createDeporte(nombre);
    if (error || !data) return rejectWithValue(error?.message || 'Failed to create deporte');
    return data;
  }
);

export const createCategoria = createAsyncThunk(
  'administration/createCategoria',
  async ({ nombre, deporteId }: { nombre: string; deporteId: string }, { rejectWithValue }) => {
    const { data, error } = await CategoriasService.createCategoria(nombre, deporteId);
    if (error || !data) return rejectWithValue(error?.message || 'Failed to create categoria');
    return data;
  }
);

const administrationSlice = createSlice({
  name: 'administration',
  initialState,
  reducers: {
    clearCategorias: (state) => {
      state.categorias = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeportes.fulfilled, (state, action) => {
        state.deportes = action.payload;
      })
      .addCase(fetchCategorias.fulfilled, (state, action) => {
        state.categorias = action.payload;
      })
      .addCase(fetchAllCategorias.fulfilled, (state, action) => {
        state.categorias = action.payload;
      })
      .addCase(createDeporte.fulfilled, (state, action) => {
        state.deportes.push(action.payload);
      })
      .addCase(createCategoria.fulfilled, (state, action) => {
        state.categorias.push(action.payload);
      })
      // Global matchers for loading state
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled') || action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          if (action.type.endsWith('/rejected')) {
            state.error = action.payload as string || action.error.message || 'Unknown error';
          }
        }
      );
  },
});

export const { clearCategorias } = administrationSlice.actions;

export const selectDeportes = (state: RootState) => state.administration.deportes;
export const selectSport = (state: RootState) => state.administration.deportes;
export const selectCategories = (state: RootState) => state.administration.categorias;
export const selectAdministrationLoading = (state: RootState) => state.administration.loading;

export default administrationSlice.reducer;
