import { IAlertaRepository } from '../../../domain/ports/IAlertaRepository';
import { Alerta } from '../../../domain/entities/alerta';
import { Evidencia } from '../../../domain/entities/evidencia';
import { HttpGenericService } from '../api/HttpGenericService';

const INITIAL_ALERTAS: Alerta[] = [
  new Alerta(
    801,
    'Robo de autopartes detectado en la calle 15',
    false,
    '2026-06-10T14:30:00Z',
    1,
    11,
  ),
  new Alerta(
    802,
    'Persona merodeando locales comerciales en actitud sospechosa',
    false,
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

    if (alerta.es_sos) {
      try {
        await this.http.post('/email/send-email', {
          toEmail: "jherreraah93@gmail.com",
          subject: "¡ALERTA S.O.S GENERADA!",
          body: `Se ha activado un botón de S.O.S. Descripción de la alerta: ${alerta.descripcion}`,
        });
      } catch (emailError) {
        console.warn('[InMemoryAlertaRepository] Failed to send email notification for SOS alert:', emailError);
      }
    }

    return alerta;
  }

  async obtenerTodas(): Promise<Alerta[]> {
    return this.alertas;
  }

  async obtenerPorId(id: number): Promise<Alerta | undefined> {
    return this.alertas.find((a) => a.id === id);
  }

  async obtenerEvidencias(alertaId: number): Promise<Evidencia[]> {
    return this.evidencias.filter((e) => e.alerta_id === alertaId);
  }
}
