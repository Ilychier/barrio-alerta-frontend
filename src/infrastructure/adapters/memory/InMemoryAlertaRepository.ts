import { Alerta } from '../../../domain/entities/alerta';
import { Evidencia } from '../../../domain/entities/evidencia';
import { IAlertaRepository } from '../../../domain/ports/IAlertaRepository';
import { HttpGenericService } from '../api/HttpGenericService';

const INITIAL_ALERTAS: Alerta[] = [
  Alerta.crearDesdeFormulario(
    801,
    'Robo de autopartes detectado en la calle 15',
    '2026-06-10T14:30:00Z',
    1,
    11,
  ),
  Alerta.crearDesdeFormulario(
    802,
    'Persona merodeando locales comerciales en actitud sospechosa',
    '2026-06-10T19:45:00Z',
    502,
    10,
  ),
];

const INITIAL_EVIDENCIAS: Evidencia[] = [
  new Evidencia(
    901,
    801,
    'https://images.unsplash.com/photo-1558441719-ff34b0524a24?w=400',
    'image/jpeg',
  ),
];

export class InMemoryAlertaRepository implements IAlertaRepository {
  private alertas: Alerta[] = [...INITIAL_ALERTAS];
  private evidencias: Evidencia[] = [...INITIAL_EVIDENCIAS];
  private readonly http = HttpGenericService.getInstance().getClient();

  async crearAlerta(alerta: Alerta, evidencias?: Evidencia[]): Promise<Alerta> {
    this.alertas = [alerta, ...this.alertas];
    if (evidencias && evidencias.length > 0) {
      this.evidencias = [...this.evidencias, ...evidencias];
    }

    /*if (alerta.es_sos) {
      try {
        await this.http.post('/email/send-email', {
          toEmail: "juliancamilohah@gmail.com",
          subject: "¡ALERTA S.O.S GENERADA!",
          body: `Se ha activado un botón de S.O.S. Descripción de la alerta: ${alerta.descripcion}`,
        });
      } catch (emailError) {
        console.warn('[InMemoryAlertaRepository] Failed to send email notification for SOS alert:', emailError);
      }
    } */

    return alerta;
  }

  async obtenerTodas(fecha?: string, barrioId?: number): Promise<Alerta[]> {
    let list = this.alertas;
    if (fecha) {
      list = list.filter((a) => {
        try {
          const datePart = a.fecha_hora.includes('T')
            ? a.fecha_hora.split('T')[0]
            : new Date(a.fecha_hora).toISOString().split('T')[0];
          return datePart === fecha;
        } catch {
          return false;
        }
      });
    }
    if (barrioId !== undefined && barrioId !== null) {
      list = list.filter((a) => {
        // Users 1, 32, and 502 belong to barrio 1 in memory mock data.
        const creatorId = a.usuario_id;
        const creatorBarrioId = (creatorId === 1 || creatorId === 32 || creatorId === 502) ? 1 : barrioId;
        return creatorBarrioId === barrioId;
      });
    }
    return list;
  }

  async obtenerPorId(id: number): Promise<Alerta | undefined> {
    return this.alertas.find((a) => a.id === id);
  }

  async obtenerEvidencias(alertaId: number): Promise<Evidencia[]> {
    return this.evidencias.filter((e) => e.alerta_id === alertaId);
  }
}
