import { IReferenciaRepository } from '../../../domain/ports/IReferenciaRepository';
import { Usuario } from '../../../domain/entities/usuario';
import { Barrio } from '../../../domain/entities/barrio';
import { Cuadrante } from '../../../domain/entities/cuadrante';
import { Categoria } from '../../../domain/entities/categoria';

const INITIAL_CUADRANTES: Cuadrante[] = [
  new Cuadrante(101, 'CAI Soacha Centro', '+57 310 555 0123'),
  new Cuadrante(102, 'CAI Compartir', '+57 312 444 9876'),
];

const INITIAL_BARRIOS: Barrio[] = [
  new Barrio(1, 'Soacha Centro', 101),
  new Barrio(2, 'Compartir', 102),
];

const INITIAL_USUARIOS: Usuario[] = [
  new Usuario(32, 'Carlos Mendoza', 'carlos.mendoza@email.com', 1),
  new Usuario(502, 'Ana María Silva', 'ana.silva@email.com', 1),
];

const INITIAL_CATEGORIAS: Categoria[] = [
  new Categoria(10, 'Sospechoso', 'AlertTriangle'),
  new Categoria(11, 'Robo', 'ShieldAlert'),
  new Categoria(12, 'Urgencia Médica', 'Activity'),
  new Categoria(13, 'Incendio', 'Flame'),
];

export class InMemoryReferenciaRepository implements IReferenciaRepository {
  private readonly cuadrantes: Cuadrante[] = INITIAL_CUADRANTES;
  private readonly barrios: Barrio[] = INITIAL_BARRIOS;
  private readonly usuarios: Usuario[] = INITIAL_USUARIOS;
  private readonly categorias: Categoria[] = INITIAL_CATEGORIAS;

  async getUsuarioById(id: number): Promise<Usuario | undefined> {
    return this.usuarios.find((u) => u.id === id);
  }

  async getBarrioById(id: number): Promise<Barrio | undefined> {
    return this.barrios.find((b) => b.id === id);
  }

  async getCuadranteById(id: number): Promise<Cuadrante | undefined> {
    return this.cuadrantes.find((c) => c.id === id);
  }

  async getCategorias(): Promise<Categoria[]> {
    return this.categorias;
  }

  async getCategoriaById(id: number): Promise<Categoria | undefined> {
    return this.categorias.find((c) => c.id === id);
  }
}
