import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { TipoReporte, tipoReporteFromString } from '../../../domain/mascotas/entities/TipoReporte';
import {
  CrearReporteMascotaCommand,
} from '../../../domain/mascotas/ports/IReporteMascotaRepository';
import { IReporteMascotaGestionRepository } from '../../../domain/mascotas/ports/IReporteMascotaGestionRepository';

export interface CrearReporteMascotaRequest {
  tipoReporte: 'LOST' | 'FOUND';
  tipoMascotaId: number;
  otroTipoMascota?: string;
  ciudadId: number;
  ubicacion: string;
  telefono: string;
  descripcion?: string;
  fotoUri?: string;
  fotoMime?: string;
  fotoFile?: any;
  usuarioId: number;
}

/**
 * Crea un reporte de mascota (usuario autenticado).
 * El backend asigna el id y los timestamps; el frontend no genera IDs.
 */
export class CrearReporteMascotaUseCase {
  constructor(private readonly reporteRepo: IReporteMascotaGestionRepository) {}

  async execute(request: CrearReporteMascotaRequest): Promise<ReporteMascota> {
    const command: CrearReporteMascotaCommand = {
      tipoReporte: tipoReporteFromString(request.tipoReporte) as TipoReporte,
      tipoMascotaId: request.tipoMascotaId,
      otroTipoMascota: request.otroTipoMascota,
      ciudadId: request.ciudadId,
      ubicacion: request.ubicacion,
      telefono: request.telefono,
      descripcion: request.descripcion,
      fotoUri: request.fotoUri,
      fotoMime: request.fotoMime,
      fotoFile: request.fotoFile,
      usuarioId: request.usuarioId,
    };
    return this.reporteRepo.crear(command);
  }
}
