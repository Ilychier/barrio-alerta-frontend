import { ReporteMascota } from '../entities/ReporteMascota';
import { PaginatedResult } from '../../ports/PaginatedResult';
import { FiltrosReporteMascota } from './IReporteMascotaRepository';

/**
 * Lectura pública de reportes de mascotas (sin autenticación).
 * Segregado de IReporteMascotaRepository (ISP): el feed público solo
 * necesita estos 3 métodos, no el CRUD autenticado.
 */
export interface IReporteMascotaPublicoRepository {
  listarPublico(filtros: FiltrosReporteMascota, page: number, size: number): Promise<PaginatedResult<ReporteMascota>>;
  listarRescatados(page: number, size: number): Promise<PaginatedResult<ReporteMascota>>;
  obtenerPublico(id: number): Promise<ReporteMascota | undefined>;
}
