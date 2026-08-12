import { RegistrarReporteRapidoRequest } from '../RegistrarReporteRapidoUseCase';
import { ReporteRapidoResult } from '../../../../domain/mascotas/ports/IReporteRapidoRepository';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface IRegistrarReporteRapidoUseCase {
  execute(request: RegistrarReporteRapidoRequest): Promise<ReporteRapidoResult>;
}
