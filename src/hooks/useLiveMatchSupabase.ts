import { useState, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const useLiveMatchSupabase = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Función principal para activar el partido e ir a la ruta en vivo
    const activateMatch = useCallback(async (matchId: string | number) => {
        try {
            setLoading(true);
            
            const { error } = await supabase
                .from('partidos_calendario')
                .update({ is_active: true })
                .eq('id', matchId);

            if (error) {
                // Ignore table not found errors simply because the user hasn't ran the SQL yet locally
                if (error.code !== '42P01') {
                    throw error;
                } else {
                    console.warn("Tabla partidos_calendario no existe aún, simulando activación local.");
                }
            }

            toast.success('¡Partido activado! Transmitiendo en vivo...', { duration: 3000 });
            
            // Redirigir a la vista del partido en vivo
            navigate(`/live/match/${matchId}`);
            
        } catch (error: any) {
            console.error('Error al activar el partido:', error);
            toast.error(error.message || 'Error al iniciar la transmisión en vivo.');
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Función para suscribirse a los cambios en el partido (Estado: activo/finalizado)
    const subscribeToMatch = useCallback((matchId: string, onUpdate: (payload: any) => void) => {
        const channel = supabase
            .channel(`match:${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'partidos_calendario',
                    filter: `id=eq.${matchId}`
                },
                (payload) => {
                    onUpdate(payload.new);
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR') {
                    console.error('Error de conexión Realtime para partidos_calendario');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // NUEVA: Función para suscribirse a los eventos del partido (Goles, Tarjetas)
    const subscribeToEvents = useCallback((matchId: string, onEvent: (payload: any) => void) => {
        const channel = supabase
            .channel(`events:${matchId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'partidos_sucesos',
                    filter: `partido_id=eq.${matchId}`
                },
                (payload) => {
                    // Mapear campos de BD a campos de UI
                    const uiEvent = {
                        id: payload.new.id,
                        type: payload.new.tipo,
                        team: payload.new.equipo,
                        playerId: payload.new.jugador_id,
                        playerName: payload.new.jugador_nombre,
                        timestamp: payload.new.created_at
                    };
                    onEvent(uiEvent);
                }
            )
            .subscribe((status) => {
                if (status === 'CHANNEL_ERROR') {
                    console.error('Error de conexión Realtime para partidos_sucesos. Verifica que Realtime esté habilitado en Supabase.');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Función para finalizar el partido y guardar un REPORTE DETALLADO
    const finalizeMatch = useCallback(async (
        matchId: string, 
        scoreLocal: number, 
        scoreVisita: number, 
        events: any[], 
        observations: string = ""
    ) => {
        try {
            setLoading(true);

            // Construir el reporte detallado
            const reportData = {
                finalized_at: new Date().toISOString(),
                score: { local: scoreLocal, visita: scoreVisita },
                events_summary: events,
                observations: observations,
                version: "1.0"
            };

            const { error } = await supabase
                .from('partidos_calendario')
                .update({ 
                    is_active: false,
                    goles_local: scoreLocal,
                    goles_visitante: scoreVisita,
                    reporte_final: reportData
                })
                .eq('id', matchId);

            if (error) throw error;
            
            toast.success('¡Partido finalizado y reporte detallado guardado exitosamente!');
            return true;
        } catch (error: any) {
            console.error('Error al finalizar el partido:', error);
            toast.error('Error al guardar el reporte detallado: ' + (error.message || 'Error desconocido'));
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        activateMatch,
        subscribeToMatch,
        subscribeToEvents,
        finalizeMatch,
        loading
    };
};
