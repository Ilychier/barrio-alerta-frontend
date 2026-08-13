import {
  IReporteRapidoRepository,
  RegistrarReporteRapidoCommand,
  ReporteRapidoResult,
} from '../../../../domain/mascotas/ports/IReporteRapidoRepository';
import { InMemoryReporteMascotaRepository } from './InMemoryReporteMascotaRepository';
import { TipoReporte, tipoReporteFromString } from '../../../../domain/mascotas/entities/TipoReporte';

/**
 * Adaptador in-memory del registro rápido de emergencia.
 * Reutiliza InMemoryReporteMascotaRepository para la persistencia simulada.
 * Devuelve token null (el usuario existente debe loguear manualmente).
 */
export class InMemoryReporteRapidoRepository implements IReporteRapidoRepository {
  private readonly repo = new InMemoryReporteMascotaRepository();

  async registrar(command: RegistrarReporteRapidoCommand): Promise<ReporteRapidoResult> {
    const reporte = await this.repo.crear({
      tipoReporte: tipoReporteFromString(command.tipoReporte) as TipoReporte,
      tipoMascotaId: command.tipoMascotaId,
      otroTipoMascota: command.otroTipoMascota,
      ciudadId: command.ciudadId,
      ubicacion: command.ubicacion,
      telefono: command.telefonoContacto,
      descripcion: command.descripcion,
      fotoUri: command.fotoUri,
      fotoMime: command.fotoMime,
      fotoFile: command.fotoFile,
      usuarioId: 0, // registro rápido: el usuario se registra por celular en el backend
    });
    return {
      reporte,
      token: null,
      passwordTemporal: false,
      esNuevo: true,
    };
  }
}
