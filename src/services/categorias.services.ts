import { BaseApiService } from '../api/api-client';
import type { ApiResponse } from '../api/api-client';
import type { Categoria } from '../api/type/categoria.api';

class CategoriasApiService extends BaseApiService {
  async getCategoriasByDeporte(deporteId: string, signal?: AbortSignal): Promise<ApiResponse<Categoria[]>> {
    return this.execute(
      this.supabase
        .from("categorias")
        .select("*")
        .eq("id_deporte", deporteId)
        .abortSignal(signal || new AbortController().signal)
    );
  }

  async getAllCategorias(signal?: AbortSignal): Promise<ApiResponse<Categoria[]>> {
    return this.execute(
      this.supabase
        .from("categorias")
        .select("*")
        .abortSignal(signal || new AbortController().signal)
    );
  }

  async createCategoria(nombre: string, deporteId: string): Promise<ApiResponse<Categoria>> {
    return this.execute(
      this.supabase.from('categorias').insert([{ nombre, id_deporte: deporteId }]).select().single()
    );
  }
}

export const CategoriasService = new CategoriasApiService();
