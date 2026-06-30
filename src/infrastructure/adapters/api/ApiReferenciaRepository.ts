import { isAxiosError } from 'axios';
import { IReferenciaRepository } from '../../../domain/ports/IReferenciaRepository';
import { Usuario } from '../../../domain/entities/usuario';
import { Barrio } from '../../../domain/entities/barrio';
import { Cuadrante } from '../../../domain/entities/cuadrante';
import { Categoria } from '../../../domain/entities/categoria';
import { InMemoryReferenciaRepository } from '../memory/InMemoryReferenciaRepository';
import { HttpGenericService } from './HttpGenericService';

export class ApiReferenciaRepository implements IReferenciaRepository {
  private readonly fallback = new InMemoryReferenciaRepository();
  private readonly http = HttpGenericService.getInstance().getClient();

  async getUsuarioById(id: number): Promise<Usuario | undefined> {
    try {
      const response = await this.http.get<any>(`/usuarios/${id}`);
      if (response.data) {
        // Resolve the user's barrio relationship from the new /usuarios-barrios endpoint
        let barrioId = 1; // Default fallback as used in mock data
        try {
          const ubResponse = await this.http.get<any>('/usuarios-barrios');
          const list = ubResponse.data?.content || [];
          const association = list.find((item: any) => item.usuario?.id === id);
          if (association && association.barrio) {
            barrioId = association.barrio.id;
          }
        } catch (ubError) {
          console.warn('[ApiReferenciaRepository] Failed to fetch user-barrio association, falling back to default 1:', ubError);
        }

        return new Usuario(
          response.data.id,
          response.data.name || response.data.nombre || 'Usuario',
          response.data.email,
          barrioId
        );
      }
      return undefined;
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[ApiReferenciaRepository] Failed to getUsuarioById(${id}) [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn(`[ApiReferenciaRepository] Failed to getUsuarioById(${id}). Falling back to local data:`, error);
      }
      return this.fallback.getUsuarioById(id);
    }
  }

  async getBarrioById(id: number): Promise<Barrio | undefined> {
    try {
      const response = await this.http.get<any>(`/barrios/${id}`);
      if (response.data) {
        return new Barrio(
          response.data.id,
          response.data.nombre,
          response.data.cuadrante?.id || response.data.cuadrante_id
        );
      }
      return undefined;
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[ApiReferenciaRepository] Failed to getBarrioById(${id}) [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn(`[ApiReferenciaRepository] Failed to getBarrioById(${id}). Falling back to local data:`, error);
      }
      return this.fallback.getBarrioById(id);
    }
  }

  async getCuadranteById(id: number): Promise<Cuadrante | undefined> {
    try {
      const response = await this.http.get<any>(`/cuadrantes/${id}`);
      if (response.data) {
        return new Cuadrante(
          response.data.id,
          response.data.nombreUnidad || response.data.nombre_unidad,
          response.data.telefonoEmergencia || response.data.telefono_emergencia
        );
      }
      return undefined;
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[ApiReferenciaRepository] Failed to getCuadranteById(${id}) [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn(`[ApiReferenciaRepository] Failed to getCuadranteById(${id}). Falling back to local data:`, error);
      }
      return this.fallback.getCuadranteById(id);
    }
  }

  async getCategorias(): Promise<Categoria[]> {
    try {
      const response = await this.http.get<any[]>('/categorias');
      const data = response.data && (response.data as any).content ? (response.data as any).content : response.data;
      if (Array.isArray(data)) {
        return data.map(
          (c) => new Categoria(c.id, c.nombre, c.iconoReferencia || c.icono_referencia)
        );
      }
      return [];
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[ApiReferenciaRepository] Failed to getCategorias() [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn('[ApiReferenciaRepository] Failed to getCategorias(). Falling back to local data:', error);
      }
      return this.fallback.getCategorias();
    }
  }

  async getCategoriaById(id: number): Promise<Categoria | undefined> {
    try {
      const response = await this.http.get<any>(`/categorias/${id}`);
      if (response.data) {
        return new Categoria(
          response.data.id,
          response.data.nombre,
          response.data.iconoReferencia || response.data.icono_referencia
        );
      }
      return undefined;
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[ApiReferenciaRepository] Failed to getCategoriaById(${id}) [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn(`[ApiReferenciaRepository] Failed to getCategoriaById(${id}). Falling back to local data:`, error);
      }
      return this.fallback.getCategoriaById(id);
    }
  }
}
