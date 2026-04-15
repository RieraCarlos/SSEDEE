/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  // Torneos habilitados
  readonly VITE_ID_TOURNAMENT_Grupo_Años_Dorados: string
  readonly VITE_ID_TOURNAMENT_Grupo_4: string
  readonly VITE_ID_TOURNAMENT_Grupo_3: string
  readonly VITE_ID_TOURNAMENT_Grupo_2: string
  readonly VITE_ID_TOURNAMENT_Grupo_1: string
  readonly VITE_ID_TOURNAMENT_Grupo_1F: string
  readonly VITE_ID_TOURNAMENT_Grupo_2F: string
  readonly VITE_ID_TOURNAMENT_Grupo_3F: string
  readonly VITE_ID_TOURNAMENT_Prueba_1: string
  // Deportes
  readonly VITE_ID_SPORT_FUTBOL: string
  readonly VITE_ID_SPORT_BASKETBALL: string
  readonly VITE_ID_SPORT_VOLEY: string
  readonly VITE_ID_SPORT_FUTSAL: string
  readonly VITE_ID_SPORT_NATACION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
