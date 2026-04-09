-- script: nominas_table.sql
-- Creación de la tabla de Nómina de Clubes (Independiente de Auth)

-- 1. Crear tabla de nóminas
CREATE TABLE IF NOT EXISTS public.nominas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_club UUID NOT NULL REFERENCES public.clubes(id) ON DELETE CASCADE,
    fullname TEXT NOT NULL,
    email TEXT, -- Opcional: para referencia o futura vinculación
    role TEXT NOT NULL DEFAULT 'jugador', -- 'dt' o 'jugador'
    posicion TEXT,
    alias TEXT,
    altura NUMERIC,
    fecha_nacimiento DATE,
    avatar TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_nominas_club ON public.nominas(id_club);
CREATE INDEX IF NOT EXISTS idx_nominas_email ON public.nominas(email);

-- 3. Habilitar RLS (Opcional, por ahora permitimos lectura pública y escritura controlada)
ALTER TABLE public.nominas ENABLE ROW LEVEL SECURITY;

-- Política simple: lectura pública para mostrar en el torneo
CREATE POLICY "Lectura pública de nóminas" ON public.nominas
    FOR SELECT USING (true);

-- Política para inserción (puedes ajustarla a administradores luego)
CREATE POLICY "Inserción permitida para roles autenticados" ON public.nominas
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 4. Comentario informativo
COMMENT ON TABLE public.nominas IS 'Almacena la plantilla de jugadores y cuerpo técnico de los clubes para el torneo, sin requerir registro en auth.users.';
