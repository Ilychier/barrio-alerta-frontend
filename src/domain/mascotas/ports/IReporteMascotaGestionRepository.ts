import { ReporteMascota } from '../entities/ReporteMascota';
import { PaginatedResult } from '../../ports/PaginatedResult';
import { EstadoReporte } from '../entities/EstadoReporte';
import {
  CrearReporteMascotaCommand,
  ActualizarReporteMascotaCommand,
} from './IReporteMascotaRepository';

/**
 * Gestión de reportes de mascotas (usuario autenticado): CRUD + estado.
 * Segregado de IReporteMascotaRepository (ISP): los flujos autenticados
 * (mis reportes, crear, admin) dependen solo de este puerto.
 */
export interface IReporteMascotaGestionRepository {
  crear(command: CrearReporteMascotaCommand): Promise<ReporteMascota>;
  listarMios(usuarioId: number, page: number, size: number): Promise<PaginatedResult<ReporteMascota>>;
  obtenerPorId(id: number): Promise<ReporteMascota | undefined>;
  actualizar(id: number, command: ActualizarReporteMascotaCommand): Promise<ReporteMascota>;
  cambiarEstado(id: number, estado: EstadoReporte): Promise<ReporteMascota>;
  eliminar(id: number): Promise<void>;
}
