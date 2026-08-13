import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { EstadoReporte } from '../../../domain/mascotas/entities/EstadoReporte';
import { ActualizarReporteMascotaCommand } from '../../../domain/mascotas/ports/IReporteMascotaRepository';
import { IReporteMascotaGestionRepository } from '../../../domain/mascotas/ports/IReporteMascotaGestionRepository';
import { PaginatedResult } from '../../../domain/ports/PaginatedResult';

export interface ActualizarReporteMascotaRequest {
  id: number;
  ubicacion: string;
  telefono: string;
  descripcion?: string;
}

/**
 * Gestión de reportes propios (usuario autenticado):
 * listar, actualizar, cambiar estado (rescate) y eliminar (soft delete).
 */
export class GestionarMisReportesMascotaUseCase {
  constructor(private readonly reporteRepo: IReporteMascotaGestionRepository) {}

  async listarMios(usuarioId: number, page = 0, size = 30): Promise<PaginatedResult<ReporteMascota>> {
    return this.reporteRepo.listarMios(usuarioId, page, size);
  }

  async actualizar(request: ActualizarReporteMascotaRequest): Promise<ReporteMascota> {
    const command: ActualizarReporteMascotaCommand = {
      ubicacion: request.ubicacion,
      telefono: request.telefono,
      descripcion: request.descripcion,
    };
    return this.reporteRepo.actualizar(request.id, command);
  }

  /** Marca como rescatado (o cambia a cualquier estado permitido). */
  async cambiarEstado(id: number, estado: EstadoReporte): Promise<ReporteMascota> {
    return this.reporteRepo.cambiarEstado(id, estado);
  }

  /** Soft delete: el backend marca estado = DELETED. */
  async eliminar(id: number): Promise<void> {
    return this.reporteRepo.eliminar(id);
  }
}
