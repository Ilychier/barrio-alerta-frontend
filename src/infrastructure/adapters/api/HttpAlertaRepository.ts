import { isAxiosError } from 'axios';
import { IAlertaRepository } from '../../../domain/ports/IAlertaRepository';
import { Alerta } from '../../../domain/entities/alerta';
import { Evidencia } from '../../../domain/entities/evidencia';
import { HttpGenericService } from './HttpGenericService';
import { InMemoryAlertaRepository } from '../memory/InMemoryAlertaRepository';

export class HttpAlertaRepository implements IAlertaRepository {
  private readonly fallback = new InMemoryAlertaRepository();
  private readonly http = HttpGenericService.getInstance().getClient();
  
  private readonly endpoints = {
    alertas: '/alertas',
    evidencias: '/evidencias',
  };

  async crearAlerta(alerta: Alerta, evidencias?: Evidencia[]): Promise<Alerta> {
    try {
      const response = await this.http.post<any>(this.endpoints.alertas, {
        descripcion: alerta.descripcion,
        esSos: alerta.es_sos,
        usuarioId: alerta.usuario_id,
        categoriaId: alerta.categoria_id,
      });

      const createdAlerta = new Alerta(
        response.data.id,
        response.data.descripcion,
        response.data.esSos !== undefined ? response.data.esSos : response.data.es_sos,
        response.data.fechaHora || response.data.fecha_hora || new Date().toISOString(),
        response.data.usuarioId || response.data.usuario_id,
        response.data.categoria?.id || response.data.categoriaId || response.data.categoria_id || 10
      );

      if (evidencias && evidencias.length > 0) {
        for (const ev of evidencias) {
          try {
            await this.http.post('/evidencias', {
              archivoUrl: ev.url_archivo || (ev as any).url || ev.archivoUrl,
              alertaId: createdAlerta.id,
            });
          } catch (evError) {
            console.warn('[HttpAlertaRepository] Failed to upload evidence associated with alert:', evError);
          }
        }
      }

      return createdAlerta;
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[HttpAlertaRepository] Failed to crearAlerta [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn('[HttpAlertaRepository] Failed to crearAlerta. Falling back to local data:', error);
      }
      return this.fallback.crearAlerta(alerta, evidencias);
    }
  }

  async obtenerTodas(): Promise<Alerta[]> {
    try {
      const response = await this.http.get<any>(this.endpoints.alertas);
      const data = response.data && response.data.content ? response.data.content : response.data;
      if (Array.isArray(data)) {
        return data.map(
          (a) => new Alerta(
            a.id,
            a.descripcion,
            a.esSos !== undefined ? a.esSos : a.es_sos,
            a.fechaHora || a.fecha_hora,
            a.usuarioId || a.usuario_id,
            a.categoria?.id || a.categoriaId || a.categoria_id || 10
          )
        );
      }
      return [];
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[HttpAlertaRepository] Failed to obtenerTodas [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn('[HttpAlertaRepository] Failed to obtenerTodas. Falling back to local data:', error);
      }
      return this.fallback.obtenerTodas();
    }
  }

  async obtenerPorId(id: number): Promise<Alerta | undefined> {
    try {
      const response = await this.http.get<any>(`${this.endpoints.alertas}/${id}`);
      if (response.data) {
        const a = response.data;
        return new Alerta(
          a.id,
          a.descripcion,
          a.esSos !== undefined ? a.esSos : a.es_sos,
          a.fechaHora || a.fecha_hora,
          a.usuarioId || a.usuario_id,
          a.categoria?.id || a.categoriaId || a.categoria_id || 10
        );
      }
      return undefined;
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[HttpAlertaRepository] Failed to obtenerPorId(${id}) [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn(`[HttpAlertaRepository] Failed to obtenerPorId(${id}). Falling back to local data:`, error);
      }
      return this.fallback.obtenerPorId(id);
    }
  }

  async obtenerEvidencias(alertaId: number): Promise<Evidencia[]> {
    try {
      const response = await this.http.get<Evidencia[]>(`${this.endpoints.evidencias}?alertaId=${alertaId}`);
      const data = response.data && (response.data as any).content ? (response.data as any).content : response.data;
      if (Array.isArray(data)) {
        return data.map(
          (e) => new Evidencia(e.id, e.alerta_id || e.alertaId, e.url_archivo || e.archivoUrl || (e as any).url, e.tipo_archivo)
        );
      }
      return [];
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[HttpAlertaRepository] Failed to obtenerEvidencias(${alertaId}) [Status: ${error.response?.status}]. Falling back to local data.`
        );
      } else {
        console.warn(`[HttpAlertaRepository] Failed to obtenerEvidencias(${alertaId}). Falling back to local data:`, error);
      }
      return this.fallback.obtenerEvidencias(alertaId);
    }
  }
}
