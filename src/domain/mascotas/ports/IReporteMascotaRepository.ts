import { ReporteMascota } from '../entities/ReporteMascota';
import { PaginatedResult } from '../../ports/PaginatedResult';
import { TipoReporte } from '../entities/TipoReporte';
import { EstadoReporte } from '../entities/EstadoReporte';

/** Filtros del feed público de reportes de mascotas. Todos opcionales. */
export interface FiltrosReporteMascota {
  estado?: EstadoReporte;
  tipoReporte?: TipoReporte;
  ciudadId?: number;
  /** Texto libre: cada palabra debe coincidir en descripcion o ubicacion (AND entre palabras). */
  busqueda?: string;
}

/** Command para crear un reporte (usuario autenticado). */
export interface CrearReporteMascotaCommand {
  tipoReporte: TipoReporte;
  tipoMascotaId: number;
  otroTipoMascota?: string;
  ciudadId: number;
  ubicacion: string;
  telefono: string;
  descripcion?: string;
  usuarioId: number;
  /** URI local de la foto (expo-image-picker, mobile). Se envía como multipart. */
  fotoUri?: string;
  /** MIME real del asset (image/jpeg, image/heic...). El backend valida por bytes mágicos. */
  fotoMime?: string;
  /** File nativo (expo-image-picker en web devuelve asset.file). */
  fotoFile?: any;
}

/** Command para actualizar campos editables. */
export interface ActualizarReporteMascotaCommand {
  ubicacion: string;
  telefono: string;
  descripcion?: string;
}

export interface IReporteMascotaRepository {
  // Públicos (sin auth)
  listarPublico(filtros: FiltrosReporteMascota, page: number, size: number): Promise<PaginatedResult<ReporteMascota>>;
  listarRescatados(page: number, size: number): Promise<PaginatedResult<ReporteMascota>>;
  obtenerPublico(id: number): Promise<ReporteMascota | undefined>;

  // Autenticados
  crear(command: CrearReporteMascotaCommand): Promise<ReporteMascota>;
  listarMios(usuarioId: number, page: number, size: number): Promise<PaginatedResult<ReporteMascota>>;
  obtenerPorId(id: number): Promise<ReporteMascota | undefined>;
  actualizar(id: number, command: ActualizarReporteMascotaCommand): Promise<ReporteMascota>;
  cambiarEstado(id: number, estado: EstadoReporte): Promise<ReporteMascota>;
  eliminar(id: number): Promise<void>;
}
