import { useState, useCallback } from 'react';
import { CsvService } from '@/services/csv.services';
import type { NominaRowCsvSchema } from '@/services/csv.services';
import { toast } from 'sonner';
import { useAppDispatch } from './useAppDispatch';
import { uploadCsvNomina } from '@/store/thunks/clubRosterThunks';
import { useAppSelector } from './useAppSelector';
import { selectRosterUpdateLoading } from '@/store/slices/clubRosterSlice';
import { z } from 'zod';

/**
 * Hook para gestionar la carga masiva exclusiva de una Nómina (Reemplazo total)
 */
export function useNominaCsv() {
  const [isParsing, setIsParsing] = useState(false);
  const [stagingData, setStagingData] = useState<{
    valid: boolean;
    errors: Array<{ row: number; column: string; message: string }>;
    data: z.infer<typeof NominaRowCsvSchema>[] | null;
    raw: any[];
  } | null>(null);

  const dispatch = useAppDispatch();
  const isUploading = useAppSelector(selectRosterUpdateLoading);

  /**
   * Procesa el archivo CSV y lo deja en staging
   */
  const preProcessFile = useCallback(async (file: File) => {
    setIsParsing(true);
    try {
      const result = await CsvService.parseAndValidateNomina(file);
      setStagingData(result);
      
      if (!result.valid) {
        toast.error(`CSV inválido: ${result.errors.length} errores encontrados.`);
      } else {
        toast.success('CSV válido. Revisa los jugadores detectados antes de confirmar.');
      }
    } catch (error) {
      toast.error('Error parseando el archivo CSV de la nómina.');
    } finally {
      setIsParsing(false);
    }
  }, []);

  /**
   * Dispara el subimiento final mediante Redux
   */
  const confirmUpload = useCallback(async (clubId: string, onSuccess?: () => void) => {
    if (!stagingData || !stagingData.valid || !stagingData.data) {
      toast.error('No hay datos válidos para subir.');
      return;
    }

    try {
      await dispatch(uploadCsvNomina({ 
        clubId, 
        playersData: stagingData.data 
      })).unwrap();
      
      toast.success('Nómina actualizada exitosamente.');
      setStagingData(null);
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error || 'Hubo un problema actualizando la nómina.');
    }
  }, [stagingData, dispatch]);

  const cancelUpload = useCallback(() => {
    setStagingData(null);
  }, []);

  const resetState = useCallback(() => {
    setStagingData(null);
    setIsParsing(false);
  }, []);

  return {
    isParsing,
    isUploading,
    stagingData,
    preProcessFile,
    confirmUpload,
    cancelUpload,
    resetState,
  };
}
