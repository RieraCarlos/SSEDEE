import { useState, useCallback, useEffect } from 'react';
import { ClubsService } from '@/services/clubs.services';
import { useAppDispatch } from './useAppDispatch';
import { updateClubLogoUrl } from '@/store/slices/clubsSlice';
import { toast } from 'sonner';

/**
 * Hook Especializado para Gestión de Media de Equipos
 * Centraliza validación, subida y limpieza de assets (SRP).
 */
export function useTeamAssets() {
  const dispatch = useAppDispatch();
  const [uploadingMap, setUploadingMap] = useState<Record<string, boolean>>({});
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Cleanup de URLs temporales para evitar fugas de memoria
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  /**
   * Procesa la subida del logo con validaciones y updates optimistas
   */
  const uploadLogo = useCallback(async (clubId: string, file: File, currentLogoUrl?: string) => {
    // 1. Validaciones Técnicas
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, PNG o WEBP.');
      return;
    }

    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Archivo demasiado grande. Máximo 2MB.');
      return;
    }

    // 2. Estado de Carga
    setUploadingMap(prev => ({ ...prev, [clubId]: true }));
    
    // 3. Previsualización Optimista Local
    const tempUrl = URL.createObjectURL(file);
    setPreviewUrls(prev => [...prev, tempUrl]);
    dispatch(updateClubLogoUrl({ clubId, logoUrl: tempUrl }));

    try {
      const { data: newUrl, error } = await ClubsService.uploadClubLogo(clubId, file, currentLogoUrl);
      
      if (error || !newUrl) throw error || new Error('Error al obtener URL del logo');

      // 4. Update Final (URL Real)
      dispatch(updateClubLogoUrl({ clubId, logoUrl: newUrl }));
      toast.success('Escudo actualizado correctamente');
      return newUrl;

    } catch (error: any) {
      // Rollback en caso de error
      if (currentLogoUrl) {
        dispatch(updateClubLogoUrl({ clubId, logoUrl: currentLogoUrl }));
      }
      toast.error('Error al subir el escudo', { description: error.message });
      return null;
    } finally {
      setUploadingMap(prev => ({ ...prev, [clubId]: false }));
    }
  }, [dispatch]);

  const isUploading = (clubId: string) => !!uploadingMap[clubId];

  return {
    uploadLogo,
    isUploading
  };
}
