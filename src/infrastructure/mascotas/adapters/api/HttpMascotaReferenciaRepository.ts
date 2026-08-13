import { isAxiosError } from 'axios';
import { Ciudad } from '../../../../domain/mascotas/entities/Ciudad';
import { TipoMascota } from '../../../../domain/mascotas/entities/TipoMascota';
import { IMascotaReferenciaRepository } from '../../../../domain/mascotas/ports/IMascotaReferenciaRepository';
import { PaginatedResult } from '../../../../domain/ports/PaginatedResult';
import { HttpGenericService } from '../../../adapters/api/HttpGenericService';
import { mapCiudad, mapTipoMascota } from '../mappers';

export class HttpMascotaReferenciaRepository implements IMascotaReferenciaRepository {
  private readonly http = HttpGenericService.getInstance().getClient();

  async getCiudades(page: number, size: number): Promise<PaginatedResult<Ciudad>> {
    try {
      const response = await this.http.get<any>('/mascotas/public/ciudades', {
        params: { page, size },
      });
      const body = response.data;
      const items = Array.isArray(body?.content)
        ? body.content.map(mapCiudad)
        : Array.isArray(body)
          ? body.map(mapCiudad)
          : [];
      return {
        items,
        totalElements: body?.totalElements ?? items.length,
        totalPages: body?.totalPages ?? 1,
        page: body?.page ?? page,
        size: body?.size ?? size,
      };
    } catch (error) {
      this.warn('[HttpMascotaReferenciaRepository] getCiudades', error);
      throw error;
    }
  }

  async getCiudadesTodas(): Promise<Ciudad[]> {
    // El catálogo tiene 1.156 registros; paginamos de a 200 hasta agotar.
    // Los datos geográficos cambian muy rara vez; el controller cachea en memoria.
    try {
      const todas: Ciudad[] = [];
      const size = 200;
      let page = 0;
      let totalPages = 1;
      do {
        const pagina = await this.getCiudades(page, size);
        todas.push(...pagina.items);
        totalPages = pagina.totalPages;
        page += 1;
      } while (page < totalPages);
      return todas;
    } catch (error) {
      this.warn('[HttpMascotaReferenciaRepository] getCiudadesTodas', error);
      throw error;
    }
  }

  async getTiposMascota(): Promise<TipoMascota[]> {
    try {
      const response = await this.http.get<any>('/mascotas/public/tipos-mascota');
      const data = response.data;
      if (Array.isArray(data)) {
        return data.map(mapTipoMascota);
      }
      return [];
    } catch (error) {
      this.warn('[HttpMascotaReferenciaRepository] getTiposMascota', error);
      throw error;
    }
  }

  private warn(contexto: string, error: unknown): void {
    if (isAxiosError(error)) {
      console.warn(`${contexto} [Status: ${error.response?.status}]`, error.response?.data);
    } else {
      console.warn(`${contexto}:`, error);
    }
  }
}
