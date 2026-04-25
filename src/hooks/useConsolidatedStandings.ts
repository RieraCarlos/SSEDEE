import { useEffect } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { fetchStandings } from '../store/thunks/tournamentsThunks';
import { selectConsolidatedStandings, selectStandingsLoading } from '../store/slices/standingsSlice';

export function useConsolidatedStandings() {
  const dispatch = useAppDispatch();
  const consolidated = useAppSelector(selectConsolidatedStandings);
  const isLoading = useAppSelector(selectStandingsLoading);

  // Inicialización (opcional si se hace a nivel vista, pero asegura que estén cargados)
  useEffect(() => {
    dispatch(fetchStandings());
  }, [dispatch]);

  return {
    standings: consolidated,
    isLoading
  };
}
