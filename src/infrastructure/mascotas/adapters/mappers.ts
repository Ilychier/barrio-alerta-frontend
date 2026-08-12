import { ReporteMascota } from '../../../domain/mascotas/entities/ReporteMascota';
import { EstadoReporte } from '../../../domain/mascotas/entities/EstadoReporte';
import { TipoReporte } from '../../../domain/mascotas/entities/TipoReporte';
import { Ciudad } from '../../../domain/mascotas/entities/Ciudad';
import { TipoMascota } from '../../../domain/mascotas/entities/TipoMascota';

export function mapReporteMascota(raw: any): ReporteMascota {
  return new ReporteMascota(
    raw.id,
    raw.tipoReporte === 'LOST' || raw.tipoReporte === 'FOUND' ? raw.tipoReporte : 'LOST',
    raw.tipoMascotaId ?? raw.tipo_mascota_id ?? 0,
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
  );
}

export function mapTipoMascota(raw: any): TipoMascota {
  return new TipoMascota(
    raw.id,
    raw.nombre ?? '',
    raw.activo ?? true,
  );
}

/** Resuelve el nombre de un catálogo por id (lookup en cliente, KISS). */
export function nombrePorId(map: Map<number, string>, id: number): string {
  return map.get(id) ?? `#${id}`;
}

export function buildTipoMascotaMap(tipos: TipoMascota[]): Map<number, string> {
  return new Map(tipos.map((t) => [t.id, t.nombre]));
}

export function buildCiudadMap(ciudades: Ciudad[]): Map<number, string> {
  return new Map(ciudades.map((c) => [c.id, c.nombre]));
}

export function buildDepartamentoMap(ciudades: Ciudad[]): Map<number, string> {
  return new Map(ciudades.map((c) => [c.id, c.departamento]));
}
