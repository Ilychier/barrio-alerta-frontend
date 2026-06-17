import { IAlertaRepository } from '../../../domain/ports/IAlertaRepository';
import { Alerta } from '../../../domain/entities/alerta';
import { Evidencia } from '../../../domain/entities/evidencia';

const INITIAL_ALERTAS: Alerta[] = [
  new Alerta(
    801,
    'Robo de autopartes detectado en la calle 15',
    false,
    '2026-06-10T14:30:00Z',
    501,
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

  crearAlerta(alerta: Alerta, evidencias?: Evidencia[]): Alerta {
    this.alertas = [alerta, ...this.alertas];
    if (evidencias && evidencias.length > 0) {
      this.evidencias = [...this.evidencias, ...evidencias];
    }
    return alerta;
  }

  obtenerTodas(): Alerta[] {
    return this.alertas;
  }

  obtenerPorId(id: number): Alerta | undefined {
    return this.alertas.find((a) => a.id === id);
  }

  obtenerEvidencias(alertaId: number): Evidencia[] {
    return this.evidencias.filter((e) => e.alerta_id === alertaId);
  }
}
