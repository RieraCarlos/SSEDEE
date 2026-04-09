import type { Middleware } from '@reduxjs/toolkit';

const CACHE_KEY = 'sse_app_cache';
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

interface CachedData {
  timestamp: number;
  data: any;
}

export const persistenceMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);

  // Persistir solo al completar acciones específicas
  if (
    action.type === 'administration/fetchDeportes/fulfilled' ||
    action.type === 'administration/fetchAllCategorias/fulfilled'
  ) {
    const state = store.getState();
    const cache: CachedData = {
      timestamp: Date.now(),
      data: {
        deportes: state.administration.deportes,
        categorias: state.administration.categorias,
      },
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }

  return result;
};

export const getCachedAdministration = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;

  try {
    const parsed: CachedData = JSON.parse(cached);
    if (Date.now() - parsed.timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch (e) {
    return null;
  }
};
