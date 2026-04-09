import { useState, useCallback } from 'react';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { 
  createDeporte, 
  createCategoria, 
  fetchCategorias,
  clearCategorias 
} from '@/store/slices/administrationSlice';
import { createTournament } from '@/store/thunks/tournamentsThunks';
import { toast } from 'sonner';

export type Step = 'sport' | 'category' | 'details';

export const useTournamentFactory = (userId: string, onSuccess: () => void) => {
  const dispatch = useAppDispatch();
  const { deportes, categorias, loading } = useAppSelector(state => state.administration);
  
  const [currentStep, setCurrentStep] = useState<Step>('sport');
  const [selection, setSelection] = useState({
    sportId: '',
    categoryId: '',
    name: '',
    type: 'institucional',
    startDate: '',
    endDate: '',
    teams: 8
  });

  const handleSportSelect = useCallback(async (id: string, isNew: boolean = false) => {
    let finalId = id;
    if (isNew) {
      const result = await dispatch(createDeporte(id)).unwrap();
      finalId = result.id;
    }
    setSelection(prev => ({ ...prev, sportId: finalId, categoryId: '' }));
    dispatch(clearCategorias());
    dispatch(fetchCategorias(finalId));
    setCurrentStep('category');
  }, [dispatch]);

  const handleCategorySelect = useCallback(async (id: string, isNew: boolean = false) => {
    let finalId = id;
    if (isNew) {
      const result = await dispatch(createCategoria({ nombre: id, deporteId: selection.sportId })).unwrap();
      finalId = result.id;
    }
    setSelection(prev => ({ ...prev, categoryId: finalId }));
    setCurrentStep('details');
  }, [dispatch, selection.sportId]);

  const handleFinalSubmit = useCallback(async () => {
    if (!selection.name || !selection.startDate || !selection.endDate) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    if (new Date(selection.startDate) > new Date(selection.endDate)) {
      toast.error("La fecha de inicio no puede ser posterior a la fecha de fin");
      return;
    }

    try {
      await dispatch(createTournament({
        name: selection.name,
        n_equipos: selection.teams,
        fecha: [selection.startDate, selection.endDate],
        id_user: userId,
        tipo: selection.type,
        // @ts-ignore - id_categoria is part of our new schema
        id_categoria: selection.categoryId
      })).unwrap();
      
      toast.success("Torneo creado exitosamente");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || "Error al crear el torneo");
    }
  }, [dispatch, selection, userId, onSuccess]);

  const reset = useCallback(() => {
    setCurrentStep('sport');
    setSelection({
      sportId: '',
      categoryId: '',
      name: '',
      type: 'institucional',
      startDate: '',
      endDate: '',
      teams: 8
    });
  }, []);

  return {
    currentStep,
    setCurrentStep,
    selection,
    setSelection,
    deportes,
    categorias,
    loading,
    handleSportSelect,
    handleCategorySelect,
    handleFinalSubmit,
    reset
  };
};
