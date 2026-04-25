import { createSlice, type PayloadAction, createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { MatchEvent, DisciplineConfig } from '@/core/disciplines';

// MatchEvent is now imported from @/core/disciplines

export interface NominaMember {
  id: string;
  id_club: string;
  fullname: string;
  role: string;
  posicion?: string;
  alias?: string;
  altura?: number;
  fecha_nacimiento?: string;
  avatar?: string;
}

interface LiveMatchState {
  activeMatchId: string | null;
  disciplineId: string | null;
  config: DisciplineConfig | null;
  localName: string;
  localId: string | null;
  localLogoUrl: string | null;
  visitaName: string;
  visitaId: string | null;
  visitaLogoUrl: string | null;
  localRoster: NominaMember[];
  visitaRoster: NominaMember[];
  events: MatchEvent[];
  currentPeriod: number;
  accumulatedFouls: { local: number, visita: number };
  isLoading: boolean;
  error: string | null;
}

const initialState: LiveMatchState = {
  activeMatchId: null,
  disciplineId: null,
  config: null,
  localName: "Equipo Local",
  localId: null,
  localLogoUrl: null,
  visitaName: "Equipo Visitante",
  visitaId: null,
  visitaLogoUrl: null,
  localRoster: [],
  visitaRoster: [],
  events: [],
  currentPeriod: 1,
  accumulatedFouls: { local: 0, visita: 0 },
  isLoading: false,
  error: null,
};

const liveMatchSlice = createSlice({
  name: 'liveMatch',
  initialState,
  reducers: {
    setActiveMatch(state, action: PayloadAction<{ 
      id: string, 
      disciplineId?: string,
      config?: DisciplineConfig,
      local: string, 
      localId: string,
      visita: string, 
      visitaId: string,
      localLogo?: string, 
      visitaLogo?: string,
      localRoster?: NominaMember[],
      visitaRoster?: NominaMember[]
    }>) {
      state.activeMatchId = action.payload.id;
      state.disciplineId = action.payload.disciplineId || null;
      state.config = action.payload.config || null;
      state.localName = action.payload.local;
      state.localId = action.payload.localId;
      state.visitaName = action.payload.visita;
      state.visitaId = action.payload.visitaId;
      state.localLogoUrl = action.payload.localLogo || null;
      state.visitaLogoUrl = action.payload.visitaLogo || null;
      state.localRoster = action.payload.localRoster || [];
      state.visitaRoster = action.payload.visitaRoster || [];
      state.events = [];
      state.currentPeriod = 1;
      state.accumulatedFouls = { local: 0, visita: 0 };
    },
    addLiveEvent(state, action: PayloadAction<MatchEvent>) {
      const exists = state.events.some(e => e.id === action.payload.id);
      if (!exists) {
        state.events.push(action.payload);
      }
    },
    removeLiveEvent(state, action: PayloadAction<string>) {
      state.events = state.events.filter(e => e.id !== action.payload);
    },
    setLiveEvents(state, action: PayloadAction<MatchEvent[]>) {
      state.events = action.payload;
    },
    setLiveRosters(state, action: PayloadAction<{ local: NominaMember[], visita: NominaMember[] }>) {
      state.localRoster = action.payload.local;
      state.visitaRoster = action.payload.visita;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setDisciplineConfig(state, action: PayloadAction<DisciplineConfig>) {
      state.config = action.payload;
      state.disciplineId = action.payload.id;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setCurrentPeriod(state, action: PayloadAction<number>) {
      state.currentPeriod = action.payload;
    },
    updateAccumulatedFouls(state, action: PayloadAction<{ local?: number, visita?: number }>) {
      if (action.payload.local !== undefined) state.accumulatedFouls.local = action.payload.local;
      if (action.payload.visita !== undefined) state.accumulatedFouls.visita = action.payload.visita;
    }
  },
});

export const { 
  setActiveMatch, 
  addLiveEvent, 
  removeLiveEvent,
  setLiveEvents, 
  setLiveRosters, 
  setLoading,
  setDisciplineConfig,
  setError,
  setCurrentPeriod,
  updateAccumulatedFouls
} = liveMatchSlice.actions;

// Selectores
export const selectLiveMatchState = (state: RootState) => state.liveMatch;

export const selectLiveScores = createSelector(
  [selectLiveMatchState],
  (live) => {
    if (!live.config) return { scoreLocal: 0, scoreVisita: 0 };
    
    // Scoring logic based on discipline points
    const scoreRules = live.config.scoreRules;
    
    let scoreLocal = 0;
    let scoreVisita = 0;

    live.events.forEach(event => {
      const rule = scoreRules.find(r => r.id === event.type);
      if (rule) {
        // Special logic: EcuaVoley resets points per set (period)
        // Others (Soccer, Basketball) are cumulative
        const isSetBased = live.config?.id === 'ecuavoley';
        const shouldCount = !isSetBased || event.periodo === live.currentPeriod;

        if (shouldCount) {
          if (event.team === 'local') scoreLocal += rule.points;
          else scoreVisita += rule.points;
        }
      }
    });

    return { scoreLocal, scoreVisita };
  }
);

export const selectLiveStatsSummary = createSelector(
  [selectLiveMatchState],
  (live) => {
    const stats = {
      faltas_local: 0,
      faltas_visita: 0,
      amarillas_local: 0,
      amarillas_visita: 0,
      rojas_local: 0,
      rojas_visita: 0,
      periodo: live.currentPeriod
    };

    live.events.forEach(e => {
      if (e.type === 'falta') {
        if (e.team === 'local') stats.faltas_local++;
        else stats.faltas_visita++;
      } else if (e.type === 'amarilla') {
        if (e.team === 'local') stats.amarillas_local++;
        else stats.amarillas_visita++;
      } else if (e.type === 'roja') {
        if (e.team === 'local') stats.rojas_local++;
        else stats.rojas_visita++;
      }
    });

    return stats;
  }
);

export default liveMatchSlice.reducer;
