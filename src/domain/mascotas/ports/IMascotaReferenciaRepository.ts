import { Ciudad } from '../entities/Ciudad';
import { TipoMascota } from '../entities/TipoMascota';
import { PaginatedResult } from '../../ports/IReferenciaRepository';

/**
 * Catálogos del BC Mascotas (públicos, sin auth).
 * El frontend carga estos catálogos completos y resuelve los nombres
 * de ciudad/tipoMascota en cliente (KISS — evita N+1 en el feed).
 */
export interface IMascotaReferenciaRepository {
  getCiudades(page: number, size: number): Promise<PaginatedResult<Ciudad>>;
  getCiudadesTodas(): Promise<Ciudad[]>;
  getTiposMascota(): Promise<TipoMascota[]>;
}
