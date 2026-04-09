-- script: user_claiming_trigger.sql
-- Actualiza el trigger handle_new_user para soportar "Profile Claiming" por email.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_existing_id UUID;
BEGIN
  -- 1. Buscar si ya existe un perfil con este email (creado por ingesta masiva)
  SELECT id INTO v_existing_id 
  FROM public.usuarios 
  WHERE email = new.email 
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    -- 2. "RECLAMAR PERFIL": Actualizamos el perfil existente con el nuevo ID de auth.
    -- Esto une los datos cargados por el admin con el login real del usuario.
    UPDATE public.usuarios
    SET id = new.id
    WHERE id = v_existing_id;
  ELSE
    -- 3. "NUEVO PERFIL": Si no existe, creamos la entrada base como de costumbre.
    INSERT INTO public.usuarios (id, email, fullname, avatar, role)
    VALUES (
      new.id, 
      new.email, 
      COALESCE(new.raw_user_meta_data->>'fullname', ''), 
      COALESCE(new.raw_user_meta_data->>'avatar_url', ''),
      COALESCE(new.raw_user_meta_data->>'role', 'jugador')
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Asegurarse de que el trigger esté vinculado a auth.users
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
