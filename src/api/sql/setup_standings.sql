-- 1. Tabla de Resultados Oficiales
CREATE TABLE IF NOT EXISTS public.resultados_partidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partido_id UUID REFERENCES public.partidos_calendario(id) ON DELETE CASCADE,
    goles_local INTEGER DEFAULT 0,
    goles_visitante INTEGER DEFAULT 0,
    ganador_id UUID REFERENCES public.clubes(id), -- Null si es empate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(partido_id)
);

-- 2. Tabla de Posiciones (Si no existe)
CREATE TABLE IF NOT EXISTS public.tabla_posiciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    torneo_id UUID REFERENCES public.torneos(id) ON DELETE CASCADE,
    club_id UUID REFERENCES public.clubes(id) ON DELETE CASCADE,
    pj INTEGER DEFAULT 0, -- Partidos Jugados
    pg INTEGER DEFAULT 0, -- Partidos Ganados
    pe INTEGER DEFAULT 0, -- Partidos Empatados
    pp INTEGER DEFAULT 0, -- Partidos Perdidos
    gf INTEGER DEFAULT 0, -- Goles a Favor
    gc INTEGER DEFAULT 0, -- Goles en Contra
    gd INTEGER DEFAULT 0, -- Diferencia de Goles
    pts INTEGER DEFAULT 0, -- Puntos
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(torneo_id, club_id)
);

-- 3. Función Trigger para actualizar posiciones
CREATE OR REPLACE FUNCTION public.update_tournament_standings()
RETURNS TRIGGER AS $$
DECLARE
    curr_torneo_id UUID;
    local_id UUID;
    visita_id UUID;
BEGIN
    -- Obtener torneo_id y IDs de equipos del partido
    SELECT torneo_id, equipo_local_id, equipo_visitante_id 
    INTO curr_torneo_id, local_id, visita_id
    FROM public.partidos_calendario 
    WHERE id = NEW.partido_id;

    -- Asegurar que existan filas en tabla_posiciones para ambos equipos
    INSERT INTO public.tabla_posiciones (torneo_id, club_id)
    VALUES (curr_torneo_id, local_id)
    ON CONFLICT (torneo_id, club_id) DO NOTHING;

    INSERT INTO public.tabla_posiciones (torneo_id, club_id)
    VALUES (curr_torneo_id, visita_id)
    ON CONFLICT (torneo_id, club_id) DO NOTHING;

    -- Actualizar Local
    UPDATE public.tabla_posiciones 
    SET 
        pj = pj + 1,
        gf = gf + NEW.goles_local,
        gc = gc + NEW.goles_visitante,
        gd = gd + (NEW.goles_local - NEW.goles_visitante),
        pg = pg + (CASE WHEN NEW.goles_local > NEW.goles_visitante THEN 1 ELSE 0 END),
        pe = pe + (CASE WHEN NEW.goles_local = NEW.goles_visitante THEN 1 ELSE 0 END),
        pp = pp + (CASE WHEN NEW.goles_local < NEW.goles_visitante THEN 1 ELSE 0 END),
        pts = pts + (CASE 
            WHEN NEW.goles_local > NEW.goles_visitante THEN 3 
            WHEN NEW.goles_local = NEW.goles_visitante THEN 1 
            ELSE 0 END),
        updated_at = now()
    WHERE torneo_id = curr_torneo_id AND club_id = local_id;

    -- Actualizar Visitante
    UPDATE public.tabla_posiciones 
    SET 
        pj = pj + 1,
        gf = gf + NEW.goles_visitante,
        gc = gc + NEW.goles_local,
        gd = gd + (NEW.goles_visitante - NEW.goles_local),
        pg = pg + (CASE WHEN NEW.goles_visitante > NEW.goles_local THEN 1 ELSE 0 END),
        pe = pe + (CASE WHEN NEW.goles_visitante = NEW.goles_local THEN 1 ELSE 0 END),
        pp = pp + (CASE WHEN NEW.goles_visitante < NEW.goles_local THEN 1 ELSE 0 END),
        pts = pts + (CASE 
            WHEN NEW.goles_visitante > NEW.goles_local THEN 3 
            WHEN NEW.goles_visitante = NEW.goles_local THEN 1 
            ELSE 0 END),
        updated_at = now()
    WHERE torneo_id = curr_torneo_id AND club_id = visita_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Crear el Trigger
DROP TRIGGER IF EXISTS tr_update_standings ON public.resultados_partidos;
CREATE TRIGGER tr_update_standings
AFTER INSERT ON public.resultados_partidos
FOR EACH ROW
EXECUTE FUNCTION public.update_tournament_standings();
