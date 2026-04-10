/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_ID_TOURNAMENT_FUTBOL: string
  readonly VITE_ID_TOURNAMENT_BASKETBALL: string
  readonly VITE_ID_TOURNAMENT_VOLEY: string
  readonly VITE_ID_TOURNAMENT_FUTSAL: string
  readonly VITE_ID_TOURNAMENT_NATACION: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
