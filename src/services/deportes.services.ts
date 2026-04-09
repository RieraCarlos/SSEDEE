import { BaseApiService } from '../api/api-client';
import type { ApiResponse } from '../api/api-client';
import type { Deporte } from '../api/type/deporte.api';

class DeportesApiService extends BaseApiService {
  async getDeportes(signal?: AbortSignal): Promise<ApiResponse<Deporte[]>> {
    return this.execute(
      this.supabase.from('deportes').select('*').abortSignal(signal || new AbortController().signal)
    );
  }

  async createDeporte(nombre: string): Promise<ApiResponse<Deporte>> {
    return this.execute(
      this.supabase.from('deportes').insert([{ nombre }]).select().single()
    );
  }
}

export const DeportesService = new DeportesApiService();
