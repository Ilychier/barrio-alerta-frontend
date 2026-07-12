import { isAxiosError } from 'axios';
import { Barrio } from '../../../domain/entities/barrio';
import { Categoria } from '../../../domain/entities/categoria';
import { CategoriaDescripcion } from '../../../domain/entities/categoriaDescripcion';
import { Cuadrante } from '../../../domain/entities/cuadrante';
import { Usuario } from '../../../domain/entities/usuario';
import { IReferenciaRepository } from '../../../domain/ports/IReferenciaRepository';
import { InMemoryReferenciaRepository } from '../memory/InMemoryReferenciaRepository';
import { HttpGenericService } from './HttpGenericService';

export class ApiReferenciaRepository implements IReferenciaRepository {
  private readonly fallback = new InMemoryReferenciaRepository();
  private readonly http = HttpGenericService.getInstance().getClient();

  async getUsuarioById(id: number): Promise<Usuario | undefined> {
    try {
      const response = await this.http.get<any>(`/usuarios/${id}`);
      if (response.data) {
        return new Usuario(
          response.data.id,
          response.data.name || response.data.nombre || 'Usuario',
          response.data.email,
          response.data.barrioId || response.data.barrio_id || 1
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

  async getBarrios(): Promise<Barrio[]> {
    try {
      const response = await this.http.get<any>('/barrios');
      const data = response.data && response.data.content ? response.data.content : response.data;
      if (Array.isArray(data)) {
        return data.map(
          (b) => new Barrio(
            b.id,
            b.nombre,
            b.cuadrante?.id || b.cuadrante_id
          )
        );
      }
      return [];
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[ApiReferenciaRepository] Failed to getBarrios() [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn('[ApiReferenciaRepository] Failed to getBarrios(). Falling back to local data:', error);
      }
      return this.fallback.getBarrios();
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

  async getDescripcionesPorCategoria(categoriaId: number): Promise<CategoriaDescripcion[]> {
    try {
      const response = await this.http.get<any>(`/categoria-descripciones?categoriaId=${categoriaId}`);
      const data = response.data && response.data.content ? response.data.content : response.data;
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          id: item.id,
          descripcion: item.descripcion,
          categoriaId: item.categoriaId,
          imagenUrl: item.imagenUrl || item.imagen_url || '',
        }));
      }
      return [];
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[ApiReferenciaRepository] Failed to getDescripcionesPorCategoria(${categoriaId}) [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn(`[ApiReferenciaRepository] Failed to getDescripcionesPorCategoria(${categoriaId}). Falling back to local data:`, error);
      }
      return this.fallback.getDescripcionesPorCategoria(categoriaId);
    }
  }
}
