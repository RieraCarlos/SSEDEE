/**
 * Configuraciones y constantes maestras del sistema.
 */

// IDs de Grupos y Torneos (Mapeo por Categoría Consolidada)
export const TOURNAMENT_GROUPS = {
  // Masculino
  MASCULINO: [
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_1,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_2,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_3,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_4,
  ].filter(Boolean) as string[],

  // Femenino
  FEMENINO: [
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_1F,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_2F,
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_3F,
  ].filter(Boolean) as string[],

  // Años Dorados
  DORADOS: [
    import.meta.env.VITE_ID_TOURNAMENT_Grupo_Anos_Dorados,
  ].filter(Boolean) as string[],
};
