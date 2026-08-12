import { Barrio } from '../entities/barrio';
import { Cuadrante } from '../entities/cuadrante';
import { Localidad } from '../entities/localidad';
import { PaginatedResult } from './IReferenciaRepository';

/** Puerta de salida para la geografía (barrios, cuadrantes, localidades) (ISP). */
export interface IGeografiaRepository {
  getBarrioById(id: number): Promise<Barrio | undefined>;
  getBarrios(): Promise<Barrio[]>;
  getBarriosPaginated(page: number, size: number, localidadId?: number): Promise<PaginatedResult<Barrio>>;
  getLocalidadesByMunicipio(municipioId: number): Promise<Localidad[]>;
  getCuadranteById(id: number): Promise<Cuadrante | undefined>;
}
