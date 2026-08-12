import { ListarReportesMascotaRequest } from '../ListarReportesMascotaUseCase';
import { PaginatedResult } from '../../../../domain/ports/IReferenciaRepository';
import { ReporteMascota } from '../../../../domain/mascotas/entities/ReporteMascota';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface IListarReportesMascotaUseCase {
  execute(request: ListarReportesMascotaRequest): Promise<PaginatedResult<ReporteMascota>>;
}
