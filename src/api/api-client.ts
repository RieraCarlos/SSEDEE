import { supabase } from './supabaseClient';
import { PostgrestError } from '@supabase/supabase-js';

// Tipado de Respuesta Estándar
export interface ApiResponse<T> {
  data: T | null;
  error: ApiError | null;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

/**
 * Cliente Base para Servicios API
 * Provee manejo centralizado de errores, AbortController y tipado estricto.
 */
export class BaseApiService {
  protected supabase = supabase;

  /**
   * Mapea errores de Postgrest a nuestro formato de dominio
   */
  protected handleError(error: PostgrestError | Error | unknown): ApiError {
    if ((error as PostgrestError).code) {
      const pgError = error as PostgrestError;
      return {
        message: pgError.message,
        code: pgError.code,
        details: pgError.details,
      };
    }
    
    return {
      message: (error as Error).message || 'An unexpected error occurred',
    };
  }

  /**
   * Crea un AbortController para peticiones cancelables
   */
  public createAbortController(): AbortController {
    return new AbortController();
  }

  /**
   * Wrapper para ejecutar queries con manejo de errores centralizado
   */
  protected async execute<T>(
    promise: PromiseLike<{ data: T | null; error: PostgrestError | null }>
  ): Promise<ApiResponse<T>> {
    try {
      const { data, error } = await promise;
      
      if (error) {
        return { data: null, error: this.handleError(error) };
      }
      
      return { data, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }
}

// Singleton global si se requiere un cliente base instanciado
export const apiClient = new BaseApiService();
