import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { FiltrosReporteMascota } from '../../../domain/mascotas/ports/IReporteMascotaRepository';
import { IReporteMascotaPublicoRepository } from '../../../domain/mascotas/ports/IReporteMascotaPublicoRepository';
import { PaginatedResult } from '../../../domain/ports/PaginatedResult';

export const PAGE_SIZE_DEFAULT = 30;

export interface ListarReportesMascotaRequest {
  filtros: FiltrosReporteMascota;
  page?: number;
  size?: number;
}

/**
 * Feed público de reportes de mascotas (sin autenticación).
 * El backend pagina; el frontend percibe una lista continua
 * cargando la página siguiente al hacer scroll (carga progresiva).
 */
export class ListarReportesMascotaUseCase {
  constructor(private readonly reporteRepo: IReporteMascotaPublicoRepository) {}

  async execute(request: ListarReportesMascotaRequest): Promise<PaginatedResult<ReporteMascota>> {
    return this.reporteRepo.listarPublico(
      request.filtros,
      request.page ?? 0,
      request.size ?? PAGE_SIZE_DEFAULT,
    );
  }
}
