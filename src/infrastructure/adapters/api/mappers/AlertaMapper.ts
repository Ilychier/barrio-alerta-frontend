import { Alerta } from '../../../../domain/entities/alerta';
import { CATEGORIA_SOS } from '../../../../domain/constants/categoriasReservadas';

/**
 * Mapea responses HTTP crudos a la entidad de dominio Alerta.
 * Acepta variantes de naming del backend (esSos/es_sos, usuarioId/usuario_id, etc.)
 * para ser tolerante a cambios de contrato (KISS: un solo lugar para mapear).
 */
export function mapAlertaResponse(a: any): Alerta {
  const isSos = a.esSos !== undefined ? a.esSos : a.es_sos;
  const fecha = a.fechaHora || a.fecha_hora;
  const usuarioId = a.usuarioId || a.usuario_id;

  if (isSos) {
    return Alerta.crearEmergenciaSOS(a.id, a.descripcion, fecha, usuarioId);
  }
  return Alerta.crearDesdeFormulario(
    a.id,
    a.descripcion,
    fecha,
    usuarioId,
    a.categoria?.id || a.categoriaId || a.categoria_id || CATEGORIA_SOS,
  );
}
