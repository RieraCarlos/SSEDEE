-- script: register_single_member_with_auth.sql
-- Micro-RPC para registro individual de miembros con sincronización Auth-Perfil

CREATE OR REPLACE FUNCTION register_single_member_with_auth(
  p_id_club UUID,
  p_full_name TEXT,
  p_email TEXT,
  p_role TEXT,
  p_posicion TEXT DEFAULT NULL,
  p_alias TEXT DEFAULT NULL,
  p_altura NUMERIC DEFAULT NULL,
  p_fecha_nacimiento DATE DEFAULT NULL,
  p_avatar TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_dummy_pwd TEXT := '$2a$10$7Z/m1n2v3b4n5m6k7l8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5'; -- Contraseña por defecto (debe ser cambiada por el usuario)
BEGIN
  -- 1. Intentar crear o recuperar el usuario en auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = LOWER(TRIM(p_email)) LIMIT 1;
  
  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      LOWER(TRIM(p_email)),
      v_dummy_pwd,
      now(),
      '{"provider":"email","providers":["email"]}',
      jsonb_build_object('fullname', p_full_name),
      now(),
      now()
    );
  END IF;

  -- 2. Upsert en public.usuarios (Sincronizado con el ID de Auth)
  -- NOTA: El trigger handle_new_user ya podría haber creado el perfil base, por eso usamos UPSERT manual.
  IF EXISTS (SELECT 1 FROM public.usuarios WHERE email = LOWER(TRIM(p_email))) THEN
    UPDATE public.usuarios SET
      id = v_user_id,
      id_club = p_id_club,
      fullname = p_full_name,
      role = p_role,
      posicion = COALESCE(p_posicion, posicion),
      alias = COALESCE(p_alias, alias),
      altura = COALESCE(p_altura, altura),
      fecha_nacimiento = COALESCE(p_fecha_nacimiento, fecha_nacimiento),
      avatar = COALESCE(p_avatar, avatar)
    WHERE email = LOWER(TRIM(p_email));
  ELSE
    INSERT INTO public.usuarios (id, email, fullname, role, id_club, posicion, alias, altura, fecha_nacimiento, avatar)
    VALUES (
      v_user_id,
      LOWER(TRIM(p_email)),
      p_full_name,
      p_role,
      p_id_club,
      p_posicion,
      p_alias,
      p_altura,
      p_fecha_nacimiento,
      p_avatar
    );
  END IF;

  RETURN jsonb_build_object(
    'status', 'success', 
    'user_id', v_user_id, 
    'email', p_email
  );

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'status', 'error', 
    'message', SQLERRM, 
    'email', p_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
