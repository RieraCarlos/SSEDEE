export type Role = 'admin' | 'dt' | 'jugador' | 'guest'

export interface SignUpData {
  email: string;
  password: string;
  role: Role;
  id_club?: string;
  fullname: string;
  posicion: string;
  alias: string;
  altura: string;
  fecha_nacimiento: string;
  lugar?: string; // Added lugar field
  avatar: string;
}

export interface AuthUser {
  id: string
  email?: string
  role: Role
  id_club?: string | null
  fullname: string
}
