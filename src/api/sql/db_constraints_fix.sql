-- script: db_constraints_fix.sql
-- Paso 1: Limpiar duplicados accidentales antes de aplicar restricciones (Opcional)
-- Esto mantiene solo el registro más reciente en caso de existir duplicados.

DELETE FROM clubes
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER(PARTITION BY name ORDER BY created_at DESC) as row_num
        FROM clubes
    ) t
    WHERE t.row_num > 1
);

DELETE FROM usuarios
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
        ROW_NUMBER() OVER(PARTITION BY email ORDER BY created_at DESC) as row_num
        FROM usuarios
    ) t
    WHERE t.row_num > 1
);

-- Paso 2: Añadir restricciones UNIQUE
-- Esto es necesario para que el comando ON CONFLICT funcione en los RPCs.

ALTER TABLE clubes 
ADD CONSTRAINT clubes_name_unique UNIQUE (name);

ALTER TABLE usuarios 
ADD CONSTRAINT usuarios_email_unique UNIQUE (email);
