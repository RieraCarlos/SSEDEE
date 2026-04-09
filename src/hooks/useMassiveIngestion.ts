import { useState, useCallback, useRef } from 'react';
import { CsvService } from '@/services/csv.services';
import type { ValidationResult } from '@/services/csv.services';
import { toast } from 'sonner';
import { useAppDispatch } from './useAppDispatch';
import { ingestMassiveData } from '@/store/thunks/ingestionThunks';
import { useAppSelector } from './useAppSelector';
import { finishIngestion } from '@/store/slices/clubsSlice';

/**
 * Hook para gestionar el flujo de ingesta masiva (Fail-Fast)
 */
export function useMassiveIngestion() {
  const [isParsing, setIsParsing] = useState(false);
  const [stagingResult, setStagingResult] = useState<ValidationResult | null>(null);
  const dispatch = useAppDispatch();
  const { isIngesting: isUploading, ingestionStep } = useAppSelector(state => state.clubs);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Procesa el archivo CSV y lo deja en el estado de STAGING para revisión
   */
  const preProcessFile = useCallback(async (file: File) => {
    setIsParsing(true);
    try {
      const result = await CsvService.parseAndValidate(file);
      setStagingResult(result);
      
      if (!result.valid) {
        toast.error(`CSV inválido: ${result.errors.length} errores encontrados.`);
      } else {
        toast.success('CSV validado correctamente. Revisa la previsualización.');
      }
    } catch (error) {
      toast.error('Error procesando el archivo CSV.');
    } finally {
      setIsParsing(false);
    }
  }, []);

  /**
   * Ejecuta la carga final a la base de datos (Redux Thunk Orquestado)
   */
  const confirmIngestion = useCallback(async (tournamentId: string, onSuccess?: () => void) => {
    if (!stagingResult || !stagingResult.valid || !stagingResult.data) {
      toast.error('No hay datos válidos para cargar.');
      return;
    }

    if (!tournamentId) {
      toast.error('ID del torneo no proporcionado.');
      return;
    }

    // Iniciar cancelación gestionada (Redux Thunk maneja el estado)
    abortControllerRef.current = new AbortController();

    try {
      const result = await dispatch(ingestMassiveData({ 
        tournamentId, 
        data: stagingResult.data 
      })).unwrap();
      
      if (result.success) {
        setStagingResult(null);
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      // El error ya es manejado por el thunk (toast y console)
    } finally {
      abortControllerRef.current = null;
    }
  }, [stagingResult, dispatch]);

  /**
   * Cancela la operación en curso
   */
  const cancelIngestion = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      dispatch(finishIngestion());
      toast.info('Carga cancelada por el usuario.');
    }
    setStagingResult(null);
  }, [dispatch]);

  /**
   * Resetea completamente el estado de la ingesta
   */
  const resetIngestion = useCallback(() => {
    setStagingResult(null);
    setIsParsing(false);
    dispatch(finishIngestion());
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
    }
  }, [dispatch]);

  return {
    isParsing,
    isUploading,
    ingestionStep,
    stagingResult,
    preProcessFile,
    confirmIngestion,
    cancelIngestion,
    resetIngestion,
  };
}
