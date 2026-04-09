-- script: db_cleanup_orphans.sql
-- ELIMINA perfiles en 'public.usuarios' que no tienen una cuenta real en 'auth.users'.
-- Esto es CRÍTICO para arreglar la base de datos después de pruebas con IDs falsos.

DELETE FROM public.usuarios
WHERE id NOT IN (SELECT id FROM auth.users);

-- Verificación: Esto debería devolver 0
SELECT COUNT(*) FROM public.usuarios WHERE id NOT IN (SELECT id FROM auth.users);
