import { Alerta } from '../entities/alerta';
import { Evidencia } from '../entities/evidencia';

export interface IAlertaRepository {
  crearAlerta(alerta: Alerta, evidencias?: Evidencia[]): Promise<Alerta>;
  obtenerTodas(fecha?: string): Promise<Alerta[]>;
  obtenerPorId(id: number): Promise<Alerta | undefined>;
  obtenerEvidencias(alertaId: number): Promise<Evidencia[]>;
}
