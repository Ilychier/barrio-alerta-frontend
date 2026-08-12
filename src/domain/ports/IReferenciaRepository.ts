import { Usuario } from '../entities/usuario';
import { Barrio } from '../entities/barrio';
import { Cuadrante } from '../entities/cuadrante';
import { Categoria } from '../entities/categoria';
import { CategoriaDescripcion } from '../entities/categoriaDescripcion';
import { Localidad } from '../entities/localidad';

export interface PaginatedResult<T> {
  items: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface IReferenciaRepository {
  getUsuarioById(id: number): Promise<Usuario | undefined>;
  getBarrioById(id: number): Promise<Barrio | undefined>;
  getBarrios(): Promise<Barrio[]>;
  getBarriosPaginated(page: number, size: number, localidadId?: number): Promise<PaginatedResult<Barrio>>;
  getLocalidadesByMunicipio(municipioId: number): Promise<Localidad[]>;
  getCuadranteById(id: number): Promise<Cuadrante | undefined>;
  getCategorias(): Promise<Categoria[]>;
  getCategoriaById(id: number): Promise<Categoria | undefined>;
  getDescripcionesPorCategoria(categoriaId: number): Promise<CategoriaDescripcion[]>;
}
