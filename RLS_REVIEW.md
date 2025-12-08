# Revisión de tu RLS actual

## ❌ PROBLEMA IDENTIFICADO

Tu política actual:
```sql
alter policy "update_fecha_horario"
on "public"."fecha_horarios"
to public
using (
  ((auth.uid() ->> 'role'::text) = 'dt'::text)
);
```

### Problemas:

1. **`auth.uid() ->> 'role'`** ❌
   - `auth.uid()` devuelve un **UUID (string)**, no un JSON object
   - El operador `->>` es para extraer propiedades JSON, pero `auth.uid()` no es JSON
   - **Esto NUNCA será verdadero** → bloqueará todos los updates

2. **Falta validar el club** ❌
   - No verifica si el DT pertenece al club que está editando
   - Cualquier DT podría editar fechas de cualquier club

3. **`to public`** ⚠️
   - Está abierto a todos los usuarios autenticados, pero después bloquea con `using`
   - Es redundante

---

## ✅ SOLUCIÓN CORRECTA

### Opción 1: Si el `role` está en la tabla `usuarios`

```sql
-- DROP la política antigua
DROP POLICY IF EXISTS "update_fecha_horario" ON "public"."fecha_horarios";

-- Crear la nueva política correcta
CREATE POLICY "DT actualiza fechas de su club"
  ON "public"."fecha_horarios"
  FOR UPDATE
  TO authenticated
  USING (
    -- El usuario autenticado debe ser DT del club
    EXISTS (
      SELECT 1 FROM "public"."usuarios" u
      JOIN "public"."clubes" c ON u.id_club = c.id
      WHERE u.id = auth.uid()
      AND u.role = 'dt'
      AND c.id = fecha_horarios.id_club
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."usuarios" u
      JOIN "public"."clubes" c ON u.id_club = c.id
      WHERE u.id = auth.uid()
      AND u.role = 'dt'
      AND c.id = fecha_horarios.id_club
    )
  );
```

---

### Opción 2: Si el `id_dt` está en la tabla `clubes` (RECOMENDADO)

```sql
-- DROP la política antigua
DROP POLICY IF EXISTS "update_fecha_horario" ON "public"."fecha_horarios";

-- Crear la nueva política correcta
CREATE POLICY "DT actualiza fechas de su club"
  ON "public"."fecha_horarios"
  FOR UPDATE
  TO authenticated
  USING (
    -- El usuario autenticado es el DT del club
    EXISTS (
      SELECT 1 FROM "public"."clubes" c
      WHERE c.id = fecha_horarios.id_club
      AND c.id_dt = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."clubes" c
      WHERE c.id = fecha_horarios.id_club
      AND c.id_dt = auth.uid()
    )
  );
```

---

### Opción 3: Si el `role` está en `auth.users` (tabla de autenticación de Supabase)

```sql
-- DROP la política antigua
DROP POLICY IF EXISTS "update_fecha_horario" ON "public"."fecha_horarios";

-- Crear la nueva política correcta
CREATE POLICY "DT actualiza fechas de su club"
  ON "public"."fecha_horarios"
  FOR UPDATE
  TO authenticated
  USING (
    -- El usuario autenticado es DT y pertenece al club
    EXISTS (
      SELECT 1 FROM "public"."usuarios" u
      WHERE u.id = auth.uid()
      AND u.role = 'dt'
      AND u.id_club = fecha_horarios.id_club
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "public"."usuarios" u
      WHERE u.id = auth.uid()
      AND u.role = 'dt'
      AND u.id_club = fecha_horarios.id_club
    )
  );
```

---

## ¿Cuál Opción Usar?

| Opción | Caso | Cuándo Usar |
|--------|------|------------|
| **Opción 1** | Role en usuarios + club_id en usuarios | Si tienes una tabla `usuarios` con `role` y `id_club` |
| **Opción 2** | ID del DT en clubes | Si la tabla `clubes` tiene `id_dt` (mejor rendimiento) |
| **Opción 3** | Role en usuarios + club_id en usuarios | Combinado con Opción 1, más restrictivo |

---

## ✅ Pasos para Aplicar:

1. **Copia uno de los SQLs arriba** (elige la opción según tu estructura)
2. **Ve a Supabase Dashboard → SQL Editor**
3. **Pega el SQL y ejecuta**
4. **Prueba desde tu app** (FormularioEditFecha)

---

## 🧪 Test después de aplicar:

```sql
-- Como DT, prueba:
SELECT * FROM fecha_horarios 
WHERE id_club = 'TU_CLUB_ID'; -- Debe devolver filas

-- Intenta UPDATE
UPDATE fecha_horarios 
SET fechas = '2025-12-01'
WHERE id_club = 'TU_CLUB_ID'; -- Debe funcionar

-- Como jugador (no DT), prueba:
UPDATE fecha_horarios 
SET fechas = '2025-12-01'
WHERE id_club = 'TU_CLUB_ID'; -- Debe rechazar (403)
```

---

## Resumen del error

Tu política intentaba hacer:
```
auth.uid() = "550e8400-e29b-41d4-a716-446655440000" (UUID)
auth.uid() ->> 'role' = "dt" ← esto es inválido
```

Correcto sería:
```
EXISTS (
  SELECT 1 FROM usuarios
  WHERE usuarios.id = auth.uid()
  AND usuarios.role = 'dt'
  AND usuarios.id_club = fecha_horarios.id_club
)
```

¿Cuál es tu estructura de tablas? ¿`clubes` tiene `id_dt` o el `role` está en `usuarios`?
