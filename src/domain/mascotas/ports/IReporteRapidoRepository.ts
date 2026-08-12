import { ReporteMascota } from '../entities/ReporteMascota';

/**
 * Resultado del registro rápido de emergencia (BC Mascotas).
 * - token: JWT para auto-login (nuevo o temporal). null si el usuario
 *   existente tiene clave real (debe loguear manualmente).
 * - passwordTemporal: true si debe cambiar la clave en el primer acceso.
 * - esNuevo: true si el usuario se creó en esta llamada.
 */
export interface ReporteRapidoResult {
  reporte: ReporteMascota;
  token: string | null;
  passwordTemporal: boolean;
  esNuevo: boolean;
}

/**
 * Command del registro rápido: celular personal (llave del usuario) +
 * teléfono de contacto de la mascota (puede diferir) + datos del animalito.
 */
export interface RegistrarReporteRapidoCommand {
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
 * Puerto de salida del registro rápido (público, sin auth).
 * Un solo round-trip: registra (o reutiliza) el usuario por su celular y
 * crea el reporte atómicamente (Facade transaccional en el backend).
 */
export interface IReporteRapidoRepository {
  registrar(command: RegistrarReporteRapidoCommand): Promise<ReporteRapidoResult>;
}
