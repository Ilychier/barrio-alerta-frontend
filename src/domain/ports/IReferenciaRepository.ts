import { Usuario } from '../entities/usuario';
import { Barrio } from '../entities/barrio';
import { Cuadrante } from '../entities/cuadrante';
import { Categoria } from '../entities/categoria';

export interface IReferenciaRepository {
  getUsuarioById(id: number): Usuario | undefined;
  getBarrioById(id: number): Barrio | undefined;
  getCuadranteById(id: number): Cuadrante | undefined;
  getCategorias(): Categoria[];
  getCategoriaById(id: number): Categoria | undefined;
}
