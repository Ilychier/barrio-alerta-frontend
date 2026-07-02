import { Usuario } from '../entities/usuario';
import { Barrio } from '../entities/barrio';
import { Cuadrante } from '../entities/cuadrante';
import { Categoria } from '../entities/categoria';
import { CategoriaDescripcion } from '../entities/categoriaDescripcion';

export interface IReferenciaRepository {
  getUsuarioById(id: number): Promise<Usuario | undefined>;
  getBarrioById(id: number): Promise<Barrio | undefined>;
  getCuadranteById(id: number): Promise<Cuadrante | undefined>;
  getCategorias(): Promise<Categoria[]>;
  getCategoriaById(id: number): Promise<Categoria | undefined>;
  getDescripcionesPorCategoria(categoriaId: number): Promise<CategoriaDescripcion[]>;
}
