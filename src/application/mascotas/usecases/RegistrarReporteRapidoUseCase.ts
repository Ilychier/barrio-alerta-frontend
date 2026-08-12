import {
  IReporteRapidoRepository,
  RegistrarReporteRapidoCommand,
  ReporteRapidoResult,
} from '../../../domain/mascotas/ports/IReporteRapidoRepository';

export interface RegistrarReporteRapidoRequest {
  phonePersonal: string;
  telefonoContacto: string;
  tipoReporte: 'LOST' | 'FOUND';
  tipoMascotaId: number;
  otroTipoMascota?: string;
  ciudadId: number;
  ubicacion: string;
  descripcion?: string;
  fotoUri?: string;
  fotoMime?: string;
  fotoFile?: any;
}

/**
 * Registro rápido de emergencia (BC Mascotas).
 * Un solo round-trip: registra (o reutiliza) el usuario por su celular y
 * crea el reporte atómicamente. Devuelve el JWT para auto-login cuando el
 * usuario es nuevo o tiene clave temporal.
 */
export class RegistrarReporteRapidoUseCase {
  constructor(private readonly repo: IReporteRapidoRepository) {}

  async execute(request: RegistrarReporteRapidoRequest): Promise<ReporteRapidoResult> {
    const command: RegistrarReporteRapidoCommand = {
      phonePersonal: request.phonePersonal,
      telefonoContacto: request.telefonoContacto,
      tipoReporte: request.tipoReporte,
      tipoMascotaId: request.tipoMascotaId,
      otroTipoMascota: request.otroTipoMascota,
      ciudadId: request.ciudadId,
      ubicacion: request.ubicacion,
      descripcion: request.descripcion,
      fotoUri: request.fotoUri,
      fotoMime: request.fotoMime,
      fotoFile: request.fotoFile,
    };
    return this.repo.registrar(command);
  }
}
