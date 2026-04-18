import Papa from 'papaparse';
import { z } from 'zod';
import type { TeamIngestPayload } from './clubs.services';

/**
 * Esquemas de Validación Zod (Fail-Fast)
 */
export const ClubCsvSchema = z.object({
  role: z.literal('club'),
  name: z.string().min(3, "El nombre del club es muy corto"),
  logo_url: z.string().url("URL de logo inválida").optional().or(z.literal('')),
  background: z.string().optional(),
  color: z.string().optional(),
});

export const DtCsvSchema = z.object({
  role: z.literal('dt'),
  fullname: z.string().min(5, "Nombre completo requerido"),
  email: z.string().email("Email de DT inválido"),
  fecha_nacimiento: z.preprocess((val) => val === "" ? undefined : val, z.string().optional()),
  avatar: z.string().optional().or(z.literal('')),
});

export const PlayerCsvSchema = z.object({
  role: z.literal('jugador'),
  fullname: z.string().min(5, "Nombre de jugador requerido"),
  email: z.string().email("Email de jugador inválido"),
  posicion: z.string().optional(),
  alias: z.string().optional(),
  altura: z.preprocess((val) => val === "" ? undefined : val, z.string().optional()),
  fecha_nacimiento: z.preprocess((val) => val === "" ? undefined : val, z.string().optional()),
});

export const NominaRowCsvSchema = z.object({
  fullname: z.string().min(5, "Nombre de jugador requerido"),
  email: z.string().email("Email de jugador inválido"),
  posicion: z.string().optional(),
  alias: z.string().optional(),
  altura: z.preprocess((val) => val === "" ? undefined : val, z.string().optional()),
  fecha_nacimiento: z.preprocess((val) => val === "" ? undefined : val, z.string().optional()),
});

export const CsvRowSchema = z.discriminatedUnion('role', [
  ClubCsvSchema,
  DtCsvSchema,
  PlayerCsvSchema,
]);

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ row: number; column: string; message: string }>;
  data: TeamIngestPayload | null;
  raw: any[];
}

/**
 * Servicio para el procesamiento y validación de CSV
 */
export const CsvService = {
  /**
   * Parsea un archivo CSV y devuelve los datos validados o errores
   */
  async parseAndValidate(file: File): Promise<ValidationResult> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const raw = results.data as any[];
          const errors: ValidationResult['errors'] = [];

          let club: z.infer<typeof ClubCsvSchema> | null = null;
          let dt: z.infer<typeof DtCsvSchema> | null = null;
          const players: Array<z.infer<typeof PlayerCsvSchema>> = [];

          raw.forEach((row, index) => {
            const validation = CsvRowSchema.safeParse(row);

            if (!validation.success) {
              validation.error.issues.forEach((issue) => {
                errors.push({
                  row: index + 1,
                  column: issue.path.join('.') || 'global',
                  message: issue.message,
                });
              });
              return;
            }

            const data = validation.data;
            if (data.role === 'club') club = data;
            if (data.role === 'dt') dt = data;
            if (data.role === 'jugador') players.push(data);
          });

          // Validaciones de Integridad de Negocio
          if (!club) errors.push({ row: 0, column: 'role', message: 'Falta la fila de tipo "club"' });
          if (!dt) errors.push({ row: 0, column: 'role', message: 'Falta la fila de tipo "dt"' });
          if (players.length === 0) errors.push({ row: 0, column: 'role', message: 'No hay jugadores en el CSV' });

          if (errors.length > 0) {
            resolve({ valid: false, errors, data: null, raw });
          } else {
            // Transformar a Payload de Ingesta
            const payload: TeamIngestPayload = {
              p_club_name: club!.name,
              p_club_logo: club!.logo_url || '',
              p_backgroud_team: club!.background || '#ffffff',
              p_color: club!.color || '#000000',
              p_dt_data: {
                fullname: dt!.fullname,
                email: dt!.email,
                avatar: dt!.avatar,
                fecha_nacimiento: dt!.fecha_nacimiento,
              },
              p_players_data: players.map(p => ({
                fullname: p.fullname,
                email: p.email,
                posicion: p.posicion,
                alias: p.alias,
                altura: p.altura,
                fecha_nacimiento: p.fecha_nacimiento,
              })),
            };
            resolve({ valid: true, errors: [], data: payload, raw });
          }
        },
      });
    });
  },

  /**
   * Parsea un archivo CSV específicamente diseñado para actualizar la Nómina
   * No requiere columna 'role' ni esquema de DT/Club.
   */
  async parseAndValidateNomina(file: File): Promise<{
    valid: boolean;
    errors: Array<{ row: number; column: string; message: string }>;
    data: z.infer<typeof NominaRowCsvSchema>[] | null;
    raw: any[];
  }> {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const raw = results.data as any[];
          const errors: Array<{ row: number; column: string; message: string }> = [];
          const players: Array<z.infer<typeof NominaRowCsvSchema>> = [];

          raw.forEach((row, index) => {
            const validation = NominaRowCsvSchema.safeParse(row);

            if (!validation.success) {
              validation.error.issues.forEach((issue) => {
                errors.push({
                  row: index + 1,
                  column: issue.path.join('.') || 'global',
                  message: issue.message,
                });
              });
            } else {
              players.push(validation.data);
            }
          });

          if (players.length === 0 && errors.length === 0) {
            errors.push({ row: 0, column: 'global', message: 'No hay jugadores en el CSV' });
          }

          if (errors.length > 0) {
            resolve({ valid: false, errors, data: null, raw });
          } else {
            resolve({ valid: true, errors: [], data: players, raw });
          }
        },
        error: (error) => {
          resolve({
            valid: false,
            errors: [{ row: 0, column: 'file', message: error.message }],
            data: null,
            raw: []
          });
        },
      });
    });
  },
};
