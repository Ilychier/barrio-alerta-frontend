import { isAxiosError } from 'axios';
import { ReporteMascota } from '../../../../domain/mascotas/entities/ReporteMascota';
import { TipoReporte } from '../../../../domain/mascotas/entities/TipoReporte';
import { EstadoReporte } from '../../../../domain/mascotas/entities/EstadoReporte';
import {
  IReporteMascotaRepository,
  CrearReporteMascotaCommand,
  ActualizarReporteMascotaCommand,
  FiltrosReporteMascota,
} from '../../../../domain/mascotas/ports/IReporteMascotaRepository';
import { PaginatedResult } from '../../../../domain/ports/PaginatedResult';
import { HttpGenericService } from '../../../adapters/api/HttpGenericService';
import { mapReporteMascota } from '../mappers';

export class HttpReporteMascotaRepository implements IReporteMascotaRepository {
  private readonly http = HttpGenericService.getInstance().getClient();

  // ============ PÚBLICOS (sin auth) ============

  async listarPublico(
    filtros: FiltrosReporteMascota,
    page: number,
    size: number,
  ): Promise<PaginatedResult<ReporteMascota>> {
    try {
      const params: Record<string, any> = { page, size };
      if (filtros.estado) params.estado = filtros.estado;
      if (filtros.tipoReporte) params.tipoReporte = filtros.tipoReporte;
      if (filtros.ciudadId) params.ciudadId = filtros.ciudadId;
      if (filtros.busqueda?.trim()) params.busqueda = filtros.busqueda.trim();
      const response = await this.http.get<any>('/mascotas/public/reportes', { params });
      return this.toPaginated(response.data, page, size);
    } catch (error) {
      this.warn('[HttpReporteMascotaRepository] listarPublico', error);
      throw error;
    }
  }

  async listarRescatados(page: number, size: number): Promise<PaginatedResult<ReporteMascota>> {
    try {
      const response = await this.http.get<any>('/mascotas/public/reportes/rescatados', {
        params: { page, size },
      });
      return this.toPaginated(response.data, page, size);
    } catch (error) {
      this.warn('[HttpReporteMascotaRepository] listarRescatados', error);
      throw error;
    }
  }

  async obtenerPublico(id: number): Promise<ReporteMascota | undefined> {
    try {
      const response = await this.http.get<any>(`/mascotas/public/reportes/${id}`);
      return response.data ? mapReporteMascota(response.data) : undefined;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return undefined;
      }
      this.warn('[HttpReporteMascotaRepository] obtenerPublico', error);
      throw error;
    }
  }

  // ============ AUTENTICADOS (JWT via interceptor) ============

  async crear(command: CrearReporteMascotaCommand): Promise<ReporteMascota> {
    try {
      const form = new FormData();
      form.append('datos', JSON.stringify({
        tipoReporte: command.tipoReporte,
        tipoMascotaId: command.tipoMascotaId,
        otroTipoMascota: command.otroTipoMascota,
        ciudadId: command.ciudadId,
        ubicacion: command.ubicacion,
        telefono: command.telefono,
        descripcion: command.descripcion,
        usuarioId: command.usuarioId,
      }) as any);
      if (command.fotoFile) {
        // Web: expo-image-picker devuelve un File nativo listo para FormData
        form.append('foto', command.fotoFile);
      } else if (command.fotoUri) {
        // Mobile: se envía el archivo local con nombre y tipo
        const mime = command.fotoMime ?? 'image/jpeg';
        const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'image/gif' ? 'gif' : mime === 'image/heic' ? 'heic' : mime === 'image/heif' ? 'heif' : 'jpg';
        form.append('foto', {
          uri: command.fotoUri,
          name: `foto.${ext}`,
          type: mime,
        } as any);
      }
      const response = await this.http.post<any>('/mascotas/reportes', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return mapReporteMascota(response.data);
    } catch (error) {
      this.warn('[HttpReporteMascotaRepository] crear', error);
      throw error;
    }
  }

  async listarMios(usuarioId: number, page: number, size: number): Promise<PaginatedResult<ReporteMascota>> {
    try {
      const response = await this.http.get<any>('/mascotas/reportes/mios', {
        params: { usuarioId, page, size },
      });
      return this.toPaginated(response.data, page, size);
    } catch (error) {
      this.warn('[HttpReporteMascotaRepository] listarMios', error);
      throw error;
    }
  }

  async obtenerPorId(id: number): Promise<ReporteMascota | undefined> {
    try {
      const response = await this.http.get<any>(`/mascotas/reportes/${id}`);
      return response.data ? mapReporteMascota(response.data) : undefined;
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        return undefined;
      }
      this.warn('[HttpReporteMascotaRepository] obtenerPorId', error);
      throw error;
    }
  }

  async actualizar(id: number, command: ActualizarReporteMascotaCommand): Promise<ReporteMascota> {
    try {
      const response = await this.http.put<any>(`/mascotas/reportes/${id}`, {
        ubicacion: command.ubicacion,
        telefono: command.telefono,
        descripcion: command.descripcion,
      });
      return mapReporteMascota(response.data);
    } catch (error) {
      this.warn('[HttpReporteMascotaRepository] actualizar', error);
      throw error;
    }
  }

  async cambiarEstado(id: number, estado: EstadoReporte): Promise<ReporteMascota> {
    try {
      const response = await this.http.patch<any>(`/mascotas/reportes/${id}/estado`, {
        estado,
      });
      return mapReporteMascota(response.data);
    } catch (error) {
      this.warn('[HttpReporteMascotaRepository] cambiarEstado', error);
      throw error;
    }
  }

  async eliminar(id: number): Promise<void> {
    try {
      await this.http.delete(`/mascotas/reportes/${id}`);
    } catch (error) {
      this.warn('[HttpReporteMascotaRepository] eliminar', error);
      throw error;
    }
  }

  // ============ helpers ============

  private toPaginated(body: any, page: number, size: number): PaginatedResult<ReporteMascota> {
    const items = Array.isArray(body?.content) ? body.content : Array.isArray(body) ? body : [];
    return {
      items: items.map(mapReporteMascota),
      totalElements: body?.totalElements ?? items.length,
      totalPages: body?.totalPages ?? 1,
      page: body?.page ?? page,
      size: body?.size ?? size,
    };
  }

  private warn(contexto: string, error: unknown): void {
    if (isAxiosError(error)) {
      console.warn(`${contexto} [Status: ${error.response?.status}]`, error.response?.data);
    } else {
      console.warn(`${contexto}:`, error);
    }
  }
}

// Re-export para consistencia con la API del frontend (evita imports rotos)
export type { TipoReporte };
