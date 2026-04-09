import { useState, useEffect } from 'react';
import { getDisciplineConfig, type DisciplineConfig } from '@/core/disciplines';
import { useAppDispatch } from './useAppDispatch';
import { setDisciplineConfig } from '@/store/slices/liveMatchSlice';

export function useDisciplineConfig(disciplineId: string | null) {
    const [config, setConfig] = useState<DisciplineConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dispatch = useAppDispatch();

    useEffect(() => {
        async function loadConfig() {
            if (!disciplineId) return;
            
            setLoading(true);
            try {
                const conf = await getDisciplineConfig(disciplineId);
                if (conf) {
                    setConfig(conf);
                    dispatch(setDisciplineConfig(conf));
                } else {
                    setError(`Configuración no encontrada para: ${disciplineId}`);
                }
            } catch (err: any) {
                setError(err.message || 'Error al cargar la configuración');
            } finally {
                setLoading(false);
            }
        }

        loadConfig();
    }, [disciplineId, dispatch]);

    return { config, loading, error };
}
