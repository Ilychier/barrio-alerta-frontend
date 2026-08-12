import { Usuario } from '../entities/usuario';
import { Barrio } from '../entities/barrio';
import { Cuadrante } from '../entities/cuadrante';
import { Categoria } from '../entities/categoria';
import { CategoriaDescripcion } from '../entities/categoriaDescripcion';
import { Localidad } from '../entities/localidad';
import { ICategoriaRepository } from './ICategoriaRepository';
import { IGeografiaRepository } from './IGeografiaRepository';
import { IUsuarioRepository } from './IUsuarioRepository';

export interface PaginatedResult<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

/**
 * God port histórico — mantenido por compatibilidad (Strangler Fig).
 * Extiende los puertos segregados; los consumidores migran al puerto
 * específico y este se elimina en la Fase 6 (5S) cuando nadie lo use.
 */
export interface IReferenciaRepository
  extends ICategoriaRepository,
    IGeografiaRepository,
    IUsuarioRepository {}

