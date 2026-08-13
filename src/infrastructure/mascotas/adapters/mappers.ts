import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { Ciudad } from '../../../domain/mascotas/entities/Ciudad';
import { TipoMascota } from '../../../domain/mascotas/entities/TipoMascota';

export function mapReporteMascota(raw: any): ReporteMascota {
  return new ReporteMascota(
    raw.id,
    raw.tipoReporte === 'LOST' || raw.tipoReporte === 'FOUND' ? raw.tipoReporte : 'LOST',
    raw.tipoMascotaId ?? raw.tipo_mascota_id ?? 0,
    raw.otroTipoMascota ?? raw.otro_tipo_mascota ?? null,
    raw.fotoUrl ?? raw.foto_url ?? null,
    raw.ciudadId ?? raw.ciudad_id ?? 0,
    raw.ubicacion ?? '',
    raw.telefono ?? null,
    raw.descripcion ?? null,
    raw.estado === 'ACTIVE' || raw.estado === 'RESCUED' || raw.estado === 'DELETED' ? raw.estado : 'ACTIVE',
    raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    raw.updatedAt ?? raw.updated_at ?? null,
    raw.usuarioId ?? raw.usuario_id ?? 0,
  );
}

export function mapCiudad(raw: any): Ciudad {
  return new Ciudad(
    raw.id,
    raw.nombre ?? '',
    raw.departamento ?? '',
    raw.pais ?? 'Colombia',
    raw.esCapital ?? false,
  );
}

export function mapTipoMascota(raw: any): TipoMascota {
  return new TipoMascota(
    raw.id,
    raw.nombre ?? '',
    raw.activo ?? true,
  );
}
