import { Ciudad } from '../../../domain/mascotas/entities/Ciudad';
import { TipoMascota } from '../../../domain/mascotas/entities/TipoMascota';

/**
 * Utilidades puras de lookup para catálogos (BC Mascotas).
 * Viven en application (no en infrastructure) para que los use cases y
 * controllers no dependan de adaptadores concretos (regla hexagonal).
 */

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
