import { ReporteMascota } from '../entities/ReporteMascota';
import { PaginatedResult } from '../../ports/PaginatedResult';
import { TipoReporte } from '../entities/TipoReporte';
import { EstadoReporte } from '../entities/EstadoReporte';
import { IReporteMascotaPublicoRepository } from './IReporteMascotaPublicoRepository';
import { IReporteMascotaGestionRepository } from './IReporteMascotaGestionRepository';

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

/**
 * Puerto histórico — mantenido por compatibilidad (Strangler Fig).
 * Extiende los puertos segregados (público + gestión); los consumidores
 * migran al puerto específico y este se elimina cuando nadie lo use.
 */
export interface IReporteMascotaRepository
  extends IReporteMascotaPublicoRepository,
    IReporteMascotaGestionRepository {}

