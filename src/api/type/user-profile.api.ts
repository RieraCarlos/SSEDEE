export type Role = 'admin' | 'dt' | 'jugador' | 'guest'

// Interface for the user profile data based on the database schema
export interface UserProfile {
    id: string;
    created_at?: string;
    id_club?: string;
    email?: string;
    fullname: string;
    role: Role;
    posicion?: string;
    alias?: string;
    altura?: number;
    fecha_nacimiento?: string;
    lugar?: string;
    avatar?: string;
  }
  