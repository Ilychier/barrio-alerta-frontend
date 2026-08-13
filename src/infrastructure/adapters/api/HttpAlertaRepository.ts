import { isAxiosError } from 'axios';
import { Alerta } from '../../../domain/entities/alerta';
import { Evidencia } from '../../../domain/entities/evidencia';
import { IAlertaRepository } from '../../../domain/ports/IAlertaRepository';
import { CATEGORIA_SOS } from '../../../domain/constants/categoriasReservadas';
import { HttpGenericService } from './HttpGenericService';
import { mapAlertaResponse } from './mappers/AlertaMapper';
import { HttpNotificacionEmailService } from './HttpNotificacionEmailService';

/**
 * Adaptador HTTP del puerto IAlertaRepository.
 * Responsabilidad única: CRUD de alertas via REST.
 * La notificación por email y las evidencias se delegan a servicios propios (SRP).
 */
export class HttpAlertaRepository implements IAlertaRepository {
  private readonly http = HttpGenericService.getInstance().getClient();
  private readonly notificador = new HttpNotificacionEmailService();

  private readonly endpoints = {
    alertas: '/alertas',
    evidencias: '/evidencias',
  };

  private async getCuadranteEmailByUsuarioId(usuarioId: number): Promise<string | undefined> {
    try {
      const userRes = await this.http.get<any>(`/usuarios/${usuarioId}`);
      const barrioId = userRes.data?.barrio?.id || userRes.data?.barrioId || userRes.data?.barrio_id;
      if (barrioId) {
        const barrioRes = await this.http.get<any>(`/barrios/${barrioId}`);
        const cuadranteId = barrioRes.data?.cuadranteId ?? barrioRes.data?.cuadrante_id ?? barrioRes.data?.cuadrante?.id;
        if (cuadranteId) {
          const cuadranteRes = await this.http.get<any>(`/cuadrantes/${cuadranteId}`);
          const email = cuadranteRes.data?.emailEmergencia || cuadranteRes.data?.email_emergencia;
          if (email) {
            return email;
          }
        }
      }
    } catch (error) {
      console.warn('[HttpAlertaRepository] Failed to resolve cuadrante email:', error);
    }
    return undefined;
  }

  private async notificarCuadrante(alerta: Alerta, categoriaId: number, esSos: boolean, toEmail: string): Promise<void> {
    try {
      await this.notificador.enviarEmailAlerta({
        id: alerta.id,
        descripcion: alerta.descripcion,
        esSos,
        fechaHora: alerta.fecha_hora,
        emailDestino: toEmail,
        categoriaId,
        baseUrl: HttpGenericService.getInstance().getBaseUrl(),
      });
    } catch (emailError) {
      console.warn('[HttpAlertaRepository] Failed to send email notification:', emailError);
    }
  }

  async crearAlerta(alerta: Alerta, evidencias?: Evidencia[]): Promise<Alerta> {
    const toEmail: string | undefined = await this.getCuadranteEmailByUsuarioId(alerta.usuario_id);
    try {
      const response = await this.http.post<any>(this.endpoints.alertas, {
        descripcion: alerta.descripcion,
        esSos: alerta.es_sos,
        usuarioId: alerta.usuario_id,
        categoriaId: alerta.es_sos ? CATEGORIA_SOS : alerta.categoria_id,
      });

      const isSos = response.data.esSos !== undefined ? response.data.esSos : response.data.es_sos;
      const createdCategoriaId = response.data.categoria?.id || response.data.categoriaId || response.data.categoria_id || alerta.categoria_id || CATEGORIA_SOS;
      const createdAlerta = mapAlertaResponse(response.data);

      if (toEmail) {
        await this.notificarCuadrante(createdAlerta, createdCategoriaId, isSos, toEmail);
      }

      if (evidencias && evidencias.length > 0) {
        for (const ev of evidencias) {
          try {
            await this.http.post(this.endpoints.evidencias, {
              archivoUrl: ev.url_archivo || (ev as any).url || (ev as any).archivoUrl,
              alertaId: createdAlerta.id,
            });
          } catch (evError) {
            console.warn('[HttpAlertaRepository] Failed to upload evidence associated with alert:', evError);
          }
        }
      }

      return createdAlerta;
    } catch (error) {
      if (alerta.es_sos && toEmail) {
        await this.notificarCuadrante(
          alerta,
          4,
          true,
          toEmail,
        );
      }

      if (isAxiosError(error)) {
        console.warn(
          `[HttpAlertaRepository] Failed to crearAlerta [Status: ${error.response?.status}].`
        );
      } else {
        console.warn('[HttpAlertaRepository] Failed to crearAlerta:', error);
      }
      throw error;
    }
  }

  async obtenerTodas(fecha?: string, barrioId?: number): Promise<Alerta[]> {
    try {
      const params: string[] = [];
      if (fecha) params.push(`fecha=${fecha}`);
      if (barrioId !== undefined && barrioId !== null) params.push(`barrioId=${barrioId}`);

      const queryString = params.join('&');
      const url = queryString ? `${this.endpoints.alertas}?${queryString}` : this.endpoints.alertas;
      const response = await this.http.get<any>(url);
      const data = response.data && response.data.content ? response.data.content : response.data;
      if (Array.isArray(data)) {
        return data.map(mapAlertaResponse);
      }
      return [];
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[HttpAlertaRepository] Failed to obtenerTodas [Status: ${error.response?.status}].`
        );
      } else {
        console.warn('[HttpAlertaRepository] Failed to obtenerTodas:', error);
      }
      throw error;
    }
  }

  async obtenerPorId(id: number): Promise<Alerta | undefined> {
    try {
      const response = await this.http.get<any>(`${this.endpoints.alertas}/${id}`);
      if (response.data) {
        return mapAlertaResponse(response.data);
      }
      return undefined;
    } catch (error) {
      if (isAxiosError(error)) {
        console.warn(
          `[HttpAlertaRepository] Failed to obtenerPorId(${id}) [Status: ${error.response?.status}].`
        );
      } else {
        console.warn(`[HttpAlertaRepository] Failed to obtenerPorId(${id}):`, error);
      }
      throw error;
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
          `[HttpAlertaRepository] Failed to obtenerEvidencias(${alertaId}) [Status: ${error.response?.status}].`
        );
      } else {
        console.warn(`[HttpAlertaRepository] Failed to obtenerEvidencias(${alertaId}):`, error);
      }
      throw error;
    }
  }
}
