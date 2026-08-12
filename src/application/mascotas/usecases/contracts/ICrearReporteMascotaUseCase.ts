import { CrearReporteMascotaRequest } from '../CrearReporteMascotaUseCase';
import { ReporteMascota } from '../../../../domain/mascotas/entities/ReporteMascota';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface ICrearReporteMascotaUseCase {
  execute(request: CrearReporteMascotaRequest): Promise<ReporteMascota>;
}
