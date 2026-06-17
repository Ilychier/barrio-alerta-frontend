import { Alerta } from '../entities/alerta';
import { Evidencia } from '../entities/evidencia';

export interface IAlertaRepository {
  crearAlerta(alerta: Alerta, evidencias?: Evidencia[]): Alerta;
  obtenerTodas(): Alerta[];
  obtenerPorId(id: number): Alerta | undefined;
  obtenerEvidencias(alertaId: number): Evidencia[];
}
