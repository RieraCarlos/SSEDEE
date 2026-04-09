-- Esta función permite añadir un club al array de equipos de un torneo sin sobrescribir el resto.
-- Ejecutar en el SQL Editor de Supabase:

CREATE OR REPLACE FUNCTION append_team_to_tournament(p_tournament_id UUID, p_club_id TEXT)
RETURNS void AS $$
BEGIN
  UPDATE torneos
  SET equipos = array_append(COALESCE(equipos, ARRAY[]::TEXT[]), p_club_id)
  WHERE id = p_tournament_id;
END;
$$ LANGUAGE plpgsql;
