import { Categoria } from '../entities/categoria';
import { CategoriaDescripcion } from '../entities/categoriaDescripcion';

/** Puerta de salida para el catálogo de categorías de alerta (ISP). */
export interface ICategoriaRepository {
  getCategorias(): Promise<Categoria[]>;
  getCategoriaById(id: number): Promise<Categoria | undefined>;
  getDescripcionesPorCategoria(categoriaId: number): Promise<CategoriaDescripcion[]>;
}
