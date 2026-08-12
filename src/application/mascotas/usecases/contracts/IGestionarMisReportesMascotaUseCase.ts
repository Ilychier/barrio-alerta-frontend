import { ReporteMascota } from '../../../../domain/mascotas/entities/ReporteMascota';
import { EstadoReporte } from '../../../../domain/mascotas/entities/EstadoReporte';
import { PaginatedResult } from '../../../../domain/ports/IReferenciaRepository';
import { ActualizarReporteMascotaRequest } from '../GestionarMisReportesMascotaUseCase';

/** Contrato del use case (OCP: el container retorna la interfaz, no la clase concreta). */
export interface IGestionarMisReportesMascotaUseCase {
  listarMios(usuarioId: number, page?: number, size?: number): Promise<PaginatedResult<ReporteMascota>>;
  actualizar(request: ActualizarReporteMascotaRequest): Promise<ReporteMascota>;
  cambiarEstado(id: number, estado: EstadoReporte): Promise<ReporteMascota>;
  eliminar(id: number): Promise<void>;
}
