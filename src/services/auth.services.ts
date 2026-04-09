import { BaseApiService } from '../api/api-client';
import type { ApiResponse } from '../api/api-client';
import type { SignUpData } from '../api/type/auth.api';

/**
 * Servicio para gestión de Autenticación y Perfiles
 */
class AuthApiService extends BaseApiService {
  /**
   * Inicia sesión con email y password
   */
  async signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  /**
   * Registra un nuevo usuario con metadata extendida
   */
  async signUp(data: SignUpData): Promise<any> {
    return this.supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: data.role,
          fullname: data.fullname,
          id_club: data.id_club,
          posicion: data.posicion,
          alias: data.alias,
          altura: data.altura,
          fecha_nacimiento: data.fecha_nacimiento,
          avatar: data.avatar,
        }
      }
    });
  }

  /**
   * Cierra la sesión actual
   */
  async signOut() {
    return this.supabase.auth.signOut();
  }

  /**
   * Obtiene el perfil de un usuario desde la tabla 'usuarios'
   */
  async getProfile(userId: string): Promise<ApiResponse<any>> {
    if (!userId) {
      return { data: null, error: { message: 'Missing userId' } };
    }
    
    return this.execute(
      this.supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
    );
  }

  /**
   * Obtiene la sesión actual
   */
  async getSession() {
    const { data } = await this.supabase.auth.getSession();
    return data?.session ?? null;
  }
}

export const AuthService = new AuthApiService();
