-- Crear la tabla para registrar sucesos de los partidos (Goles, Tarjetas)
CREATE TABLE IF NOT EXISTS public.partidos_sucesos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partido_id UUID NOT NULL REFERENCES public.partidos_calendario(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('gol', 'amarilla', 'roja')),
    equipo TEXT NOT NULL CHECK (equipo IN ('local', 'visita')),
    jugador_id TEXT NOT NULL, -- ID del jugador (habitualmente de la tabla nominas)
    jugador_nombre TEXT NOT NULL, -- Nombre para visualización rápida
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.partidos_sucesos ENABLE ROW LEVEL SECURITY;

-- Políticas de Seguridad (Lectura Pública, Escritura para Autenticados o Admin según tu flujo)
CREATE POLICY "Permitir lectura pública de sucesos" 
ON public.partidos_sucesos FOR SELECT 
USING (true);

CREATE POLICY "Permitir inserción a usuarios autenticados" 
ON public.partidos_sucesos FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Índice para búsqueda rápida por partido
CREATE INDEX IF NOT EXISTS idx_sucesos_partido_id ON public.partidos_sucesos(partido_id);
