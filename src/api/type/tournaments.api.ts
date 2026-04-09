export interface Tournament {
  id: string;
  name: string;
  equipos: string[] | null;
  n_equipos: number;
  fecha: string[];
  id_user: string;
  id_categoria: string;
  tipo: string;
  created_at?: string;
}
