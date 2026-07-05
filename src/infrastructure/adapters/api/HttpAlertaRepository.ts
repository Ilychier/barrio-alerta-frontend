import { isAxiosError } from 'axios';
import { Alerta } from '../../../domain/entities/alerta';
import { Evidencia } from '../../../domain/entities/evidencia';
import { IAlertaRepository } from '../../../domain/ports/IAlertaRepository';
import { HttpGenericService } from './HttpGenericService';

export class HttpAlertaRepository implements IAlertaRepository {
  private readonly http = HttpGenericService.getInstance().getClient();
  
  private readonly endpoints = {
    alertas: '/alertas',
    evidencias: '/evidencias',
    email: '/email/send-email',
  };

  private async getCuadranteTelefonoByUsuarioId(usuarioId: number): Promise<string | undefined> {
    try {
      const userRes = await this.http.get<any>(`/usuarios/${usuarioId}`);
      const barrioId = userRes.data?.barrioId || userRes.data?.barrio_id;
      if (barrioId) {
        const barrioRes = await this.http.get<any>(`/barrios/${barrioId}`);
        const cuadranteId = barrioRes.data?.cuadrante?.id || barrioRes.data?.cuadrante_id;
        if (cuadranteId) {
          const cuadranteRes = await this.http.get<any>(`/cuadrantes/${cuadranteId}`);
          const tel = cuadranteRes.data?.telefonoEmergencia || cuadranteRes.data?.telefono_emergencia;
          if (tel) {
            return tel;
          }
        }
      }
    } catch (error) {
      console.warn('[HttpAlertaRepository] Failed to resolve cuadrante telefono_emergencia:', error);
    }
    return undefined;
  }

  async crearAlerta(alerta: Alerta, evidencias?: Evidencia[]): Promise<Alerta> {
    let toEmail: string | undefined = undefined;
    if (alerta.es_sos) {
      toEmail = await this.getCuadranteTelefonoByUsuarioId(alerta.usuario_id);
    }

    try {
      const response = await this.http.post<any>(this.endpoints.alertas, {
        descripcion: alerta.descripcion,
        esSos: alerta.es_sos,
        usuarioId: alerta.usuario_id,
        categoriaId: alerta.categoria_id,
      });

      const isSos = response.data.esSos !== undefined ? response.data.esSos : response.data.es_sos;
      const createdAlerta = isSos
        ? Alerta.crearEmergenciaSOS(
            response.data.id,
            response.data.descripcion,
            response.data.fechaHora || response.data.fecha_hora || new Date().toISOString(),
            response.data.usuarioId || response.data.usuario_id
          )
        : Alerta.crearDesdeFormulario(
            response.data.id,
            response.data.descripcion,
            response.data.fechaHora || response.data.fecha_hora || new Date().toISOString(),
            response.data.usuarioId || response.data.usuario_id,
            response.data.categoria?.id || response.data.categoriaId || response.data.categoria_id || 10
          );

      if (alerta.es_sos && toEmail) {
        try {
          await this.http.post(this.endpoints.email, {
            toEmail,
            subject: "¡ALERTA S.O.S GENERADA!",
            body: `Se ha activado un botón de S.O.S. Descripción de la alerta: ${createdAlerta.descripcion}`,
          });
        } catch (emailError) {
          console.warn('[HttpAlertaRepository] Failed to send email notification for SOS alert:', emailError);
        }
      }

      if (evidencias && evidencias.length > 0) {
        for (const ev of evidencias) {
          try {
            await this.http.post('/evidencias', {
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
        try {
          await this.http.post(this.endpoints.email, {
            toEmail,
            subject: "¡ALERTA S.O.S GENERADA!",
            body: `Se ha activado un botón de S.O.S. Descripción de la alerta: ${alerta.descripcion}`,
          });
        } catch (emailError) {
          console.warn('[HttpAlertaRepository] Failed to send fallback email notification for SOS alert:', emailError);
        }
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

  async obtenerTodas(): Promise<Alerta[]> {
    try {
      const response = await this.http.get<any>(this.endpoints.alertas);
      const data = response.data && response.data.content ? response.data.content : response.data;
      if (Array.isArray(data)) {
        return data.map((a) => {
          const isSos = a.esSos !== undefined ? a.esSos : a.es_sos;
          return isSos
            ? Alerta.crearEmergenciaSOS(
                a.id,
                a.descripcion,
                a.fechaHora || a.fecha_hora,
                a.usuarioId || a.usuario_id
              )
            : Alerta.crearDesdeFormulario(
                a.id,
                a.descripcion,
                a.fechaHora || a.fecha_hora,
                a.usuarioId || a.usuario_id,
                a.categoria?.id || a.categoriaId || a.categoria_id || 10
              );
        });
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
        const a = response.data;
        const isSos = a.esSos !== undefined ? a.esSos : a.es_sos;
        return isSos
          ? Alerta.crearEmergenciaSOS(
              a.id,
              a.descripcion,
              a.fechaHora || a.fecha_hora,
              a.usuarioId || a.usuario_id
            )
          : Alerta.crearDesdeFormulario(
              a.id,
              a.descripcion,
              a.fechaHora || a.fecha_hora,
              a.usuarioId || a.usuario_id,
              a.categoria?.id || a.categoriaId || a.categoria_id || 10
            );
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
