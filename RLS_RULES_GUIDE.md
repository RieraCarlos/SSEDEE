# Guía de Reglas RLS (Row Level Security) para Supabase

## ¿Qué es RLS?
RLS (Row Level Security) es un mecanismo de seguridad en Supabase que controla qué filas de datos puede ver, insertar, actualizar o eliminar cada usuario basándose en políticas que defines.

---

## Casos de Uso para tu Aplicación

### 1. **Tabla: `usuarios`**

#### Caso 1.1: Usuarios leen su propio perfil
```sql
-- Política SELECT: Cada usuario solo ve su propio registro
CREATE POLICY "Usuarios ven su propio perfil"
  ON usuarios FOR SELECT
  USING (auth.uid() = id);
```
**Cuándo aplicar**: Cuando quieres que cada jugador solo vea sus propios datos (nombre, email, posición, etc.)

---

#### Caso 1.2: DT lee jugadores de su club
```sql
-- Política SELECT: DT ve todos los jugadores de su club
CREATE POLICY "DT ve jugadores de su club"
  ON usuarios FOR SELECT
  USING (
    -- El usuario autenticado es DT del club
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = usuarios.id_club
      AND clubes.id_dt = auth.uid()
    )
  );
```
**Cuándo aplicar**: Cuando quieres que el DT vea todos los jugadores de su club.

---

#### Caso 1.3: Admin ve todos los usuarios
```sql
-- Política SELECT: Admin ve todos
CREATE POLICY "Admin ve todos los usuarios"
  ON usuarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
```
**Cuándo aplicar**: Cuando necesitas que los administradores vean toda la base de datos de usuarios.

---

#### Caso 1.4: Usuario actualiza solo su perfil
```sql
-- Política UPDATE: Cada usuario solo puede actualizar su propio registro
CREATE POLICY "Usuarios actualizan su propio perfil"
  ON usuarios FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```
**Cuándo aplicar**: Cuando quieres que los usuarios cambien su email, teléfono, etc., pero no sus datos de rol/club.

---

### 2. **Tabla: `clubes`**

#### Caso 2.1: Club visible para sus miembros y DT
```sql
-- Política SELECT: Ver club si eres miembro o DT
CREATE POLICY "Ver club si eres miembro"
  ON clubes FOR SELECT
  USING (
    id_dt = auth.uid()
    OR EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id_club = clubes.id
      AND usuarios.id = auth.uid()
    )
  );
```
**Cuándo aplicar**: Cuando solo miembros del club y su DT deben ver los datos del club.

---

#### Caso 2.2: DT actualiza datos de su club
```sql
-- Política UPDATE: DT actualiza solo su club
CREATE POLICY "DT actualiza su club"
  ON clubes FOR UPDATE
  USING (id_dt = auth.uid())
  WITH CHECK (id_dt = auth.uid());
```
**Cuándo aplicar**: Cuando el DT debe poder cambiar nombre, logo, etc. del club.

---

### 3. **Tabla: `fecha_horarios`**

#### Caso 3.1: DT ve y edita fechas de su club
```sql
-- Política SELECT: DT ve fechas de su club
CREATE POLICY "DT ve fechas de su club"
  ON fecha_horarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = fecha_horarios.id_club
      AND clubes.id_dt = auth.uid()
    )
  );

-- Política UPDATE: DT actualiza fechas de su club
CREATE POLICY "DT actualiza fechas de su club"
  ON fecha_horarios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = fecha_horarios.id_club
      AND clubes.id_dt = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = fecha_horarios.id_club
      AND clubes.id_dt = auth.uid()
    )
  );
```
**Cuándo aplicar**: **ESTE ES TU CASO** — Cuando el DT edita fechas de su club (FormularioEditFecha).

---

#### Caso 3.2: Jugadores ven fechas de su club
```sql
-- Política SELECT: Jugadores ven fechas de su club
CREATE POLICY "Jugadores ven fechas de su club"
  ON fecha_horarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id_club = fecha_horarios.id_club
      AND usuarios.id = auth.uid()
    )
  );
```
**Cuándo aplicar**: Cuando jugadores necesitan ver cuándo son los partidos.

---

### 4. **Tabla: `partidos`**

#### Caso 4.1: DT ve y edita nómina de su club
```sql
-- Política SELECT: DT ve partidos de su club
CREATE POLICY "DT ve partidos de su club"
  ON partidos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = partidos.id_club
      AND clubes.id_dt = auth.uid()
    )
  );

-- Política UPDATE: DT actualiza nómina de su club
CREATE POLICY "DT actualiza nomina de su club"
  ON partidos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = partidos.id_club
      AND clubes.id_dt = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = partidos.id_club
      AND clubes.id_dt = auth.uid()
    )
  );
```
**Cuándo aplicar**: Cuando el DT asigna/elimina jugadores de la nómina.

---

#### Caso 4.2: Jugador ve partidos de su club y su nómina
```sql
-- Política SELECT: Jugador ve partidos de su club
CREATE POLICY "Jugador ve partidos de su club"
  ON partidos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id_club = partidos.id_club
      AND usuarios.id = auth.uid()
    )
  );
```
**Cuándo aplicar**: Cuando jugadores necesitan ver si están en la nómina.

---

#### Caso 4.3: Jugador se auto-asigna a nómina
```sql
-- Política UPDATE: Jugador actualiza su asignación (INSERT a array)
CREATE POLICY "Jugador se asigna a nomina"
  ON partidos FOR UPDATE
  USING (
    -- Solo puede actualizar si es jugador del club
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id_club = partidos.id_club
      AND usuarios.id = auth.uid()
    )
  )
  WITH CHECK (
    -- Validar que sigue siendo jugador del club
    EXISTS (
      SELECT 1 FROM usuarios
      WHERE usuarios.id_club = partidos.id_club
      AND usuarios.id = auth.uid()
    )
  );
```
**Cuándo aplicar**: Cuando jugadores cliquez "Solicitar cupo" (assignCupoToPlayer).

---

## Paso a Paso: Aplicar RLS en Supabase

### 1. **Ir a tu proyecto en Supabase**
   - Dashboard → Selecciona tu proyecto
   - Sidebar → SQL Editor

### 2. **Habilitar RLS en tablas**
   ```sql
   -- Para cada tabla
   ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
   ALTER TABLE clubes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE fecha_horarios ENABLE ROW LEVEL SECURITY;
   ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
   ```

### 3. **Crear políticas**
   - Copia uno de los casos arriba
   - Pégalo en SQL Editor
   - Clic en "Run" (▶)

### 4. **Probar con tu app**
   - Asegúrate que `matchDates` y otros selects funcionen
   - Si ves error 403, la política está bloqueando → revisa la lógica

---

## Solución para tu Error Actual (updateMatchDates)

Tu error `Cannot read properties of null` sucede porque:

1. **El UPDATE se ejecuta** ✅
2. **Pero el `.select()` devuelve NULL** ❌ (RLS bloquea la lectura del resultado)

**Solución — Aplica esta política:**

```sql
-- Habilitar RLS
ALTER TABLE fecha_horarios ENABLE ROW LEVEL SECURITY;

-- Política de SELECT (para que la fila actualizada se pueda leer)
CREATE POLICY "DT lee fechas de su club"
  ON fecha_horarios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = fecha_horarios.id_club
      AND clubes.id_dt = auth.uid()
    )
  );

-- Política de UPDATE
CREATE POLICY "DT actualiza fechas de su club"
  ON fecha_horarios FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = fecha_horarios.id_club
      AND clubes.id_dt = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clubes
      WHERE clubes.id = fecha_horarios.id_club
      AND clubes.id_dt = auth.uid()
    )
  );
```

---

## Checklist de Seguridad

- [ ] Tabla `usuarios`: RLS habilitado + políticas de SELECT/UPDATE por rol
- [ ] Tabla `clubes`: RLS habilitado + política DT puede actualizar su club
- [ ] Tabla `fecha_horarios`: RLS habilitado + política DT puede actualizar fechas
- [ ] Tabla `partidos`: RLS habilitado + políticas para asignar/ver nómina
- [ ] **Importante**: Verifica que `auth.uid()` retorna el ID correcto del usuario

---

## Debugging

Si la política bloquea cuando no debería:

1. **Verifica el schema de tu tabla**
   ```sql
   SELECT * FROM information_schema.columns 
   WHERE table_name = 'fecha_horarios';
   ```

2. **Revisa los ID del usuario vs club**
   ```sql
   -- En Supabase Dashboard → Auth → Users
   -- Copia el UUID del usuario
   
   -- Luego en SQL Editor
   SELECT id, email FROM usuarios WHERE id = 'TU_UUID';
   SELECT id, id_dt FROM clubes WHERE id = 'ID_CLUB';
   ```

3. **Prueba la política manualmente**
   ```sql
   -- Como tu usuario DT
   SELECT * FROM fecha_horarios 
   WHERE id_club = 'TU_CLUB_ID';
   ```

---

## Resumen Rápido para Tu App

| Tabla | Acción | Quién | Política |
|-------|--------|-------|----------|
| `usuarios` | SELECT | Usuario mismo | `auth.uid() = id` |
| `usuarios` | UPDATE | Usuario mismo | `auth.uid() = id` |
| `clubes` | SELECT | DT o jugador del club | `id_dt = auth.uid() OR miembro` |
| `clubes` | UPDATE | DT | `id_dt = auth.uid()` |
| `fecha_horarios` | SELECT | DT o jugador del club | `EXISTS (SELECT... id_dt = auth.uid())` |
| `fecha_horarios` | UPDATE | DT | `EXISTS (SELECT... id_dt = auth.uid())` |
| `partidos` | SELECT | DT o jugador del club | `EXISTS (SELECT... id_dt = auth.uid())` |
| `partidos` | UPDATE | DT o jugador | Ambos con `EXISTS` |

---

## Notas Finales

- **RLS es obligatorio** si quieres que Supabase sea seguro en producción.
- **Sin RLS**, cualquier usuario autenticado puede leer/escribir todo.
- **`auth.uid()`** siempre devuelve el UUID del usuario autenticado actual.
- **`WITH CHECK`** en UPDATE valida que los datos nuevos cumplan la regla también.
