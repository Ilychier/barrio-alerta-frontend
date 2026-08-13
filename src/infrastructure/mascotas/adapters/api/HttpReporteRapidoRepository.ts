import { isAxiosError } from 'axios';
import {
  IReporteRapidoRepository,
  RegistrarReporteRapidoCommand,
  ReporteRapidoResult,
} from '../../../../domain/mascotas/ports/IReporteRapidoRepository';
import { HttpGenericService } from '../../../adapters/api/HttpGenericService';
import { mapReporteMascota } from '../mappers';

/**
 * Adapter HTTP del registro rápido de emergencia (público, sin auth).
 * Envía multipart (part "datos" JSON + part "foto" opcional) al endpoint
 * /mascotas/public/reportes/rapido — hereda la exclusión del AuthInterceptor.
 */
export class HttpReporteRapidoRepository implements IReporteRapidoRepository {
  private readonly http = HttpGenericService.getInstance().getClient();

  async registrar(command: RegistrarReporteRapidoCommand): Promise<ReporteRapidoResult> {
    try {
      const form = new FormData();
      form.append('datos', JSON.stringify({
        phonePersonal: command.phonePersonal,
        telefonoContacto: command.telefonoContacto,
        tipoReporte: command.tipoReporte,
        tipoMascotaId: command.tipoMascotaId,
        otroTipoMascota: command.otroTipoMascota,
        ciudadId: command.ciudadId,
        ubicacion: command.ubicacion,
        descripcion: command.descripcion,
      }) as any);
      if (command.fotoFile) {
        form.append('foto', command.fotoFile);
      } else if (command.fotoUri) {
        const mime = command.fotoMime ?? 'image/jpeg';
        const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'image/gif' ? 'gif' : mime === 'image/heic' ? 'heic' : mime === 'image/heif' ? 'heif' : 'jpg';
        form.append('foto', {
          uri: command.fotoUri,
          name: `foto.${ext}`,
          type: mime,
        } as any);
      }
      const response = await this.http.post<any>('/mascotas/public/reportes/rapido', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return {
        reporte: mapReporteMascota(response.data.reporte),
        token: response.data.token ?? null,
        passwordTemporal: response.data.passwordTemporal ?? false,
        esNuevo: response.data.esNuevo ?? false,
      };
    } catch (error) {
      if (isAxiosError(error)) {
        throw new Error(error.response?.data?.error || 'No se pudo registrar el reporte');
      }
      throw error;
    }
  }
}
