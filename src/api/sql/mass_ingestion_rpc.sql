-- script: mass_ingestion_rpc.sql
-- Ingesta Masiva Atómica con Registro en Auth (Senior Architect version)
-- v2: Incluye sanitización de emails y depuración extendida.

CREATE OR REPLACE FUNCTION ingest_team_data(
  p_tournament_id UUID,
  p_club_name TEXT,
  p_club_logo TEXT,
  p_backgroud_team TEXT,
  p_color TEXT,
  p_dt_data JSONB,
  p_players_data JSONB[]
) RETURNS JSONB AS $$
DECLARE
  v_club_id UUID;
  v_user_id UUID;
  v_player JSONB;
  v_email TEXT;
  v_response JSONB;
  v_dummy_pwd TEXT := '$2a$10$7Z/m1n2v3b4n5m6k7l8o9p0q1r2s3t4u5v6w7x8y9z0a1b2c3d4e5';
BEGIN
  -- 1. Insertar o Actualizar el Club
  INSERT INTO public.clubes (name, logo_url, backgroud_team, color)
  VALUES (TRIM(p_club_name), p_club_logo, p_backgroud_team, p_color)
  ON CONFLICT (name) DO UPDATE SET 
    logo_url = EXCLUDED.logo_url,
    backgroud_team = EXCLUDED.backgroud_team,
    color = EXCLUDED.color
  RETURNING id INTO v_club_id;
  
  -- 1.1 Vincular al Torneo (Array Append)
  PERFORM public.append_team_to_tournament(p_tournament_id, v_club_id::TEXT);

  -- 2. Procesar Director Técnico
  v_email := LOWER(TRIM(p_dt_data->>'email'));
  
  -- Intentar crear en auth.users si no existe
  INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
  VALUES (
    '00000000-0000-0000-0000-000000000000', 
    gen_random_uuid(), 
    'authenticated', 
    'authenticated', 
    v_email, 
    v_dummy_pwd, 
    now(), 
    '{"provider":"email","providers":["email"]}', 
    jsonb_build_object('fullname', p_dt_data->>'fullname'), 
    now(), 
    now()
  )
  ON CONFLICT (email) DO NOTHING;

  -- Obtener el ID del usuario (nuevo o existente)
  SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = v_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'ERROR_AUTH_LINK: No se pudo crear/encontrar cuenta Auth para el DT (%)', v_email;
  END IF;

  -- Perfil en public.usuarios
  INSERT INTO public.usuarios (id, fullname, email, role, id_club, avatar, fecha_nacimiento)
  VALUES (v_user_id, p_dt_data->>'fullname', v_email, 'dt', v_club_id, COALESCE(p_dt_data->>'avatar', ''), (p_dt_data->>'fecha_nacimiento')::DATE)
  ON CONFLICT (id) DO UPDATE SET
    id_club = EXCLUDED.id_club,
    fullname = EXCLUDED.fullname,
    email = EXCLUDED.email,
    avatar = EXCLUDED.avatar,
    fecha_nacimiento = EXCLUDED.fecha_nacimiento;

  -- 3. Procesar Jugadores
  FOREACH v_player IN ARRAY p_players_data LOOP
    v_email := LOWER(TRIM(v_player->>'email'));

    -- Crear en auth.users si no existe
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (
      '00000000-0000-0000-0000-000000000000', 
      gen_random_uuid(), 
      'authenticated', 
      'authenticated', 
      v_email, 
      v_dummy_pwd, 
      now(), 
      '{"provider":"email","providers":["email"]}', 
      jsonb_build_object('fullname', v_player->>'fullname'), 
      now(), 
      now()
    )
    ON CONFLICT (email) DO NOTHING;

    -- Obtener ID
    SELECT id INTO v_user_id FROM auth.users WHERE LOWER(email) = v_email;

    IF v_user_id IS NULL THEN
      RAISE EXCEPTION 'ERROR_AUTH_LINK: No se pudo crear/encontrar cuenta Auth para jugador (%)', v_email;
    END IF;

    -- Perfil
    INSERT INTO public.usuarios (id, fullname, email, role, id_club, posicion, alias, altura, fecha_nacimiento, avatar)
    VALUES (
      v_user_id, 
      v_player->>'fullname', 
      v_email, 
      'jugador', 
      v_club_id, 
      COALESCE(v_player->>'posicion', ''), 
      COALESCE(v_player->>'alias', ''), 
      COALESCE((v_player->>'altura')::NUMERIC, 0), 
      (v_player->>'fecha_nacimiento')::DATE, 
      COALESCE(v_player->>'avatar', '')
    )
    ON CONFLICT (id) DO UPDATE SET
      id_club = EXCLUDED.id_club,
      fullname = EXCLUDED.fullname,
      email = EXCLUDED.email,
      posicion = EXCLUDED.posicion,
      alias = EXCLUDED.alias,
      altura = EXCLUDED.altura,
      fecha_nacimiento = EXCLUDED.fecha_nacimiento,
      avatar = EXCLUDED.avatar;
  END LOOP;

  v_response := jsonb_build_object(
    'status', 'success',
    'message', 'Ingesta exitosa: Club, perfiles y cuentas auth operativas.',
    'club_id', v_club_id
  );

  RETURN v_response;

EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'status', 'error',
    'message', SQLERRM,
    'detail', SQLSTATE,
    'hint', 'Verifica permisos de SECURITY DEFINER y la tabla auth.users'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
