import { TipoReporte } from './TipoReporte';
import { EstadoReporte } from './EstadoReporte';

/**
 * Reporte de mascota perdida (LOST) o encontrada/vista (FOUND).
 *
 * `telefono` y `descripcion` son opcionales porque en el response público
 * el backend oculta el teléfono cuando estado = RESCUED (Ley 1581 de 2012),
 * y la descripción es opcional (fricción baja de entrada).
 */
export class ReporteMascota {
  constructor(
    public readonly id: number,
    public readonly tipoReporte: TipoReporte,
    public readonly tipoMascotaId: number,
    public readonly otroTipoMascota: string | null,
    public readonly fotoUrl: string | null,
    public readonly ciudadId: number,
    public readonly ubicacion: string,
    public readonly telefono: string | null,
    public readonly descripcion: string | null,
    public readonly estado: EstadoReporte,
    public readonly createdAt: string,
    public readonly updatedAt: string | null,
    public readonly usuarioId: number,
  ) {}
}
